<?php

namespace App\Http\Controllers;

use App\Enums\ProductStockLedgerTransactionType;
use App\Http\Requests\SaveStockTransferRequest;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductStockLedger;
use App\Models\ProductVariant;
use App\Models\StockTransfer;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = $request->string('search')->trim()->limit(255, '')->toString();
        $sourceId = $request->integer('source_outlet_id') ?: null;
        $destinationId = $request->integer('destination_outlet_id') ?: null;

        $transfers = StockTransfer::query()
            ->with([
                'sourceOutlet:id,name',
                'destinationOutlet:id,name',
                'createdBy:id,name',
            ])
            ->withCount('items')
            ->whereBelongsTo($business)
            ->when(
                $search,
                fn ($query, string $value) => $query
                    ->where('transfer_no', 'like', "%{$value}%"),
            )
            ->when(
                $sourceId,
                fn ($query, int $value) => $query
                    ->where('source_outlet_id', $value),
            )
            ->when(
                $destinationId,
                fn ($query, int $value) => $query
                    ->where('destination_outlet_id', $value),
            )
            ->latest('transfer_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('inventory/transfers/index', [
            'transfers' => $transfers,
            'outlets' => $this->outlets($business, false),
            'queryString' => [
                'search' => $search ?: null,
                'source_outlet_id' => $sourceId,
                'destination_outlet_id' => $destinationId,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $business = Business::current();
        $outlets = $this->outlets($business);
        $selectedSourceOutletId = $outlets->firstWhere('id', $request->integer('outlet_id'))?->id ?? $outlets->first()?->id;

        return Inertia::render('inventory/transfers/create', [
            'outlets' => $outlets, 'products' => $this->products($business, $selectedSourceOutletId),
            'selectedSourceOutletId' => $selectedSourceOutletId,
        ]);
    }

    public function store(SaveStockTransferRequest $request): RedirectResponse
    {
        $data = $request->transferData();
        $transfer = DB::transaction(function () use ($data): StockTransfer {
            $attributes = $data['transfer'];
            $outletIds = collect([$attributes['source_outlet_id'], $attributes['destination_outlet_id']])->sort()->values();
            $outlets = Outlet::query()->where('business_id', $attributes['business_id'])->where('status', 'active')
                ->whereIn('id', $outletIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            if ($outlets->count() !== 2) {
                throw ValidationException::withMessages(['destination_outlet_id' => 'Select two different active outlets.']);
            }
            $variantIds = collect($data['items'])->pluck('product_variant_id')->sort()->values();
            foreach ($variantIds as $variantId) {
                ProductStock::query()->firstOrCreate(
                    ['outlet_id' => $attributes['destination_outlet_id'], 'product_variant_id' => $variantId],
                    ['business_id' => $attributes['business_id'], 'quantity' => 0, 'average_cost' => 0, 'stock_value' => 0],
                );
            }
            $stocks = ProductStock::query()->where('business_id', $attributes['business_id'])->whereIn('outlet_id', $outletIds)
                ->whereIn('product_variant_id', $variantIds)->orderBy('outlet_id')->orderBy('product_variant_id')->lockForUpdate()->get()
                ->keyBy(fn (ProductStock $stock): string => "{$stock->outlet_id}:{$stock->product_variant_id}");
            foreach ($data['items'] as $index => $item) {
                $sourceStock = $stocks->get("{$attributes['source_outlet_id']}:{$item['product_variant_id']}");
                if ($sourceStock === null || (float) $sourceStock->quantity + 0.00005 < (float) $item['base_quantity']) {
                    $available = $sourceStock?->quantity ?? '0.0000';
                    throw ValidationException::withMessages(["items.{$index}.quantity" => "The source outlet only has {$available} base units available for this product."]);
                }
            }

            $sourceOutlet = $outlets->get($attributes['source_outlet_id']);
            $attributes['created_by_id'] = auth()->id();
            $attributes['transfer_no'] = StockTransfer::generateTransferNumber($sourceOutlet->id, Carbon::parse($attributes['transfer_date']));
            $transfer = StockTransfer::create($attributes);
            $totalValue = 0.0;

            foreach ($data['items'] as $item) {
                $source = $stocks->get("{$transfer->source_outlet_id}:{$item['product_variant_id']}");
                $destination = $stocks->get("{$transfer->destination_outlet_id}:{$item['product_variant_id']}");
                $item['inventory_unit_cost'] = round((float) $source->average_cost, 6);
                $item['inventory_total_cost'] = abs((float) $source->quantity - (float) $item['base_quantity']) < 0.00005
                    ? round((float) $source->stock_value, 2)
                    : round((float) $item['base_quantity'] * (float) $item['inventory_unit_cost'], 2);
                $transferItem = $transfer->items()->create($item);
                $ledgerData = [
                    'business_id' => $transfer->business_id, 'product_variant_id' => $transferItem->product_variant_id,
                    'unit_of_measurement_id' => $transferItem->unit_of_measurement_id,
                    'product_unit_conversion_id' => $transferItem->product_unit_conversion_id,
                    'base_quantity' => $transferItem->base_quantity, 'unit_cost' => $transferItem->inventory_unit_cost,
                    'total_cost' => $transferItem->inventory_total_cost, 'transaction_date' => $transfer->transfer_date, 'note' => $transferItem->note,
                ];
                $transferItem->productStockLedgers()->create([...$ledgerData, 'outlet_id' => $transfer->source_outlet_id,
                    'transaction_type' => ProductStockLedgerTransactionType::TransferOut, 'quantity_in' => 0, 'quantity_out' => $transferItem->quantity]);
                $transferItem->productStockLedgers()->create([...$ledgerData, 'outlet_id' => $transfer->destination_outlet_id,
                    'transaction_type' => ProductStockLedgerTransactionType::TransferIn, 'quantity_in' => $transferItem->quantity, 'quantity_out' => 0]);

                $sourceQuantity = round((float) $source->quantity - (float) $transferItem->base_quantity, 4);
                $sourceValue = round((float) $source->stock_value - (float) $transferItem->inventory_total_cost, 2);
                if ($sourceQuantity <= 0.00005) {
                    $sourceQuantity = 0;
                    $sourceValue = 0;
                }
                $source->update(['quantity' => $sourceQuantity, 'average_cost' => $sourceQuantity > 0 ? round(max(0, $sourceValue) / $sourceQuantity, 6) : 0,
                    'stock_value' => max(0, $sourceValue), 'last_movement_at' => now()]);
                $destinationQuantity = round((float) $destination->quantity + (float) $transferItem->base_quantity, 4);
                $destinationValue = round((float) $destination->stock_value + (float) $transferItem->inventory_total_cost, 2);
                $destination->update(['quantity' => $destinationQuantity, 'average_cost' => round($destinationValue / $destinationQuantity, 6),
                    'stock_value' => $destinationValue, 'last_movement_at' => now()]);
                $totalValue += (float) $transferItem->inventory_total_cost;
            }
            $transfer->update(['total_value' => round($totalValue, 2)]);

            return $transfer;
        }, attempts: 3);

        return to_route('stock-transfers.show', $transfer)->with('status', 'Stock transfer created successfully.');
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $this->ensureOwnership($stockTransfer);

        $stockTransfer->load([
            'sourceOutlet:id,name,code,status',
            'destinationOutlet:id,name,code,status',
            'createdBy:id,name',
            'items.productVariant:id,product_id,variant_name,sku,brand_id,is_placeholder_variant,status',
            'items.productVariant.product:id,name',
            'items.productVariant.brand:id,name',
            'items.unitOfMeasurement:id,name,code',
            'items.productStockLedgers',
        ]);

        $canDelete = $this->canDelete($stockTransfer);

        $stockTransfer->items->each(
            fn ($item) => $item->unsetRelation('productStockLedgers'),
        );

        $stockTransfer->setAttribute('can_delete', $canDelete);

        return Inertia::render('inventory/transfers/show', [
            'transfer' => $stockTransfer,
        ]);
    }

    public function destroy(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->ensureOwnership($stockTransfer);
        DB::transaction(function () use ($stockTransfer): void {
            $outletIds = collect([$stockTransfer->source_outlet_id, $stockTransfer->destination_outlet_id])->sort()->values();
            Outlet::query()->whereIn('id', $outletIds)->orderBy('id')->lockForUpdate()->get();
            $stockTransfer->load('items.productStockLedgers');
            $variantIds = $stockTransfer->items->pluck('product_variant_id')->sort()->values();
            $stocks = ProductStock::query()->where('business_id', $stockTransfer->business_id)->whereIn('outlet_id', $outletIds)
                ->whereIn('product_variant_id', $variantIds)->orderBy('outlet_id')->orderBy('product_variant_id')->lockForUpdate()->get()
                ->keyBy(fn (ProductStock $stock): string => "{$stock->outlet_id}:{$stock->product_variant_id}");
            foreach ($stockTransfer->items->sortBy('product_variant_id') as $item) {
                $outLedger = $item->productStockLedgers->firstWhere('transaction_type', ProductStockLedgerTransactionType::TransferOut);
                $inLedger = $item->productStockLedgers->firstWhere('transaction_type', ProductStockLedgerTransactionType::TransferIn);
                if ($item->productStockLedgers->count() !== 2 || $outLedger === null || $inLedger === null) {
                    throw ValidationException::withMessages(['transfer' => 'This transfer cannot be deleted because its inventory history is incomplete.']);
                }
                if ((int) $outLedger->outlet_id !== (int) $stockTransfer->source_outlet_id
                    || (int) $inLedger->outlet_id !== (int) $stockTransfer->destination_outlet_id
                    || (int) $outLedger->product_variant_id !== (int) $item->product_variant_id
                    || (int) $inLedger->product_variant_id !== (int) $item->product_variant_id
                    || (float) $outLedger->base_quantity !== (float) $item->base_quantity
                    || (float) $inLedger->base_quantity !== (float) $item->base_quantity
                    || (float) $outLedger->total_cost !== (float) $item->inventory_total_cost
                    || (float) $inLedger->total_cost !== (float) $item->inventory_total_cost) {
                    throw ValidationException::withMessages(['transfer' => 'This transfer cannot be deleted because its inventory history is inconsistent.']);
                }
                foreach ([$outLedger, $inLedger] as $ledger) {
                    if (ProductStockLedger::query()->where('business_id', $stockTransfer->business_id)->where('outlet_id', $ledger->outlet_id)
                        ->where('product_variant_id', $item->product_variant_id)->where('id', '>', $ledger->id)->exists()) {
                        throw ValidationException::withMessages(['transfer' => 'This operation cannot be deleted because later inventory movements depend on it.']);
                    }
                }
                $source = $stocks->get("{$stockTransfer->source_outlet_id}:{$item->product_variant_id}");
                $destination = $stocks->get("{$stockTransfer->destination_outlet_id}:{$item->product_variant_id}");
                if ($source === null || $destination === null || (float) $destination->quantity + 0.00005 < (float) $inLedger->base_quantity
                    || (float) $destination->stock_value + 0.005 < (float) $inLedger->total_cost) {
                    throw ValidationException::withMessages(['transfer' => 'This transfer cannot be deleted because its destination inventory is no longer available.']);
                }
                $destinationQuantity = round((float) $destination->quantity - (float) $inLedger->base_quantity, 4);
                $destinationValue = round((float) $destination->stock_value - (float) $inLedger->total_cost, 2);
                if ($destinationQuantity <= 0.00005) {
                    $destinationQuantity = 0;
                    $destinationValue = 0;
                }
                $destination->update(['quantity' => $destinationQuantity, 'average_cost' => $destinationQuantity > 0 ? round(max(0, $destinationValue) / $destinationQuantity, 6) : 0,
                    'stock_value' => max(0, $destinationValue), 'last_movement_at' => now()]);
                $sourceQuantity = round((float) $source->quantity + (float) $outLedger->base_quantity, 4);
                $sourceValue = round((float) $source->stock_value + (float) $outLedger->total_cost, 2);
                $source->update(['quantity' => $sourceQuantity, 'average_cost' => round($sourceValue / $sourceQuantity, 6), 'stock_value' => $sourceValue, 'last_movement_at' => now()]);
                $outLedger->delete();
                $inLedger->delete();
            }
            $stockTransfer->delete();
        }, attempts: 3);

        return to_route('stock-transfers.index')->with('status', 'Stock transfer deleted successfully.');
    }

    private function ensureOwnership(StockTransfer $transfer): void
    {
        abort_unless($transfer->business_id === Business::current()->id, 404);
    }

    private function canDelete(StockTransfer $transfer): bool
    {
        $variantIds = $transfer->items->pluck('product_variant_id');
        $latestLedgerIds = ProductStockLedger::query()
            ->where('business_id', $transfer->business_id)
            ->whereIn('outlet_id', [$transfer->source_outlet_id, $transfer->destination_outlet_id])
            ->whereIn('product_variant_id', $variantIds)
            ->select(['outlet_id', 'product_variant_id'])
            ->selectRaw('MAX(id) as latest_id')
            ->groupBy('outlet_id', 'product_variant_id')
            ->get()
            ->keyBy(fn (ProductStockLedger $ledger): string => "{$ledger->outlet_id}:{$ledger->product_variant_id}");

        return $transfer->items->every(function ($item) use ($latestLedgerIds): bool {
            if ($item->productStockLedgers->count() !== 2) {
                return false;
            }

            return $item->productStockLedgers->every(function (ProductStockLedger $ledger) use ($item, $latestLedgerIds): bool {
                $latestLedger = $latestLedgerIds->get("{$ledger->outlet_id}:{$item->product_variant_id}");

                return $latestLedger !== null && (int) $latestLedger->latest_id === $ledger->id;
            });
        });
    }

    /** @return Collection<int, Outlet> */
    private function outlets(Business $business, bool $activeOnly = true): Collection
    {
        return Outlet::query()->whereBelongsTo($business)->when($activeOnly, fn ($query) => $query->where('status', 'active'))->orderBy('name')->get(['id', 'name', 'code', 'status']);
    }

    /** @return Collection<int, Product> */
    private function products(Business $business, ?int $outletId): Collection
    {
        $products = Product::query()
            ->whereBelongsTo($business)
            ->where('status', 'active')
            ->with([
                'productVariants' => fn ($query) => $query->where('status', 'active')->select(['id', 'product_id', 'variant_name', 'sku', 'brand_id', 'is_placeholder_variant', 'status']),
                'productVariants.brand:id,name',
                'defaultPurchaseUnitConversion.unitOfMeasurement:id,name,code',
                'baseUnitConversion.unitOfMeasurement:id,name,code',
                'activeUnitConversions.unitOfMeasurement:id,name,code',
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'base_unit_of_measurement_id']);

        $stocks = ProductStock::query()
            ->where('business_id', $business->id)
            ->where('outlet_id', $outletId)
            ->whereIn('product_variant_id', $products->flatMap->productVariants->pluck('id'))
            ->get()
            ->keyBy('product_variant_id');

        $products->each(fn (Product $product) => $product->productVariants->each(function (ProductVariant $variant) use ($stocks): void {
            $stock = $stocks->get($variant->id);
            $variant->setAttribute('available_quantity', $stock?->quantity ?? '0.0000');
            $variant->setAttribute('average_cost', $stock?->average_cost ?? '0.000000');
            $variant->setAttribute('has_inventory_history', false);
        }));

        return $products;
    }
}
