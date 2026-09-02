<?php

namespace App\Http\Controllers;

use App\Enums\ProductStockLedgerTransactionType;
use App\Enums\StockAdjustmentReason;
use App\Enums\StockAdjustmentType;
use App\Http\Requests\SaveStockAdjustmentRequest;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use App\Models\StockAdjustment;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = $request->string('search')->trim()->limit(255, '')->toString();
        $outletId = $request->integer('outlet_id') ?: null;

        $adjustments = StockAdjustment::query()
            ->with([
                'outlet:id,name',
                'createdBy:id,name',
            ])
            ->withCount('items')
            ->whereBelongsTo($business)
            ->when(
                $search,
                fn ($query, string $value) => $query
                    ->where('adjustment_no', 'like', "%{$value}%"),
            )
            ->when(
                $outletId,
                fn ($query, int $value) => $query
                    ->where('outlet_id', $value),
            )
            ->latest('adjustment_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('inventory/adjustments/index', [
            'adjustments' => $adjustments,
            'outlets' => $this->outlets($business, false),
            'queryString' => [
                'search' => $search ?: null,
                'outlet_id' => $outletId,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $business = Business::current();
        $outlets = $this->outlets($business);
        $selectedOutletId = $outlets->firstWhere('id', $request->integer('outlet_id'))?->id ?? $outlets->first()?->id;

        return Inertia::render('inventory/adjustments/create', [
            'outlets' => $outlets, 'products' => $this->products($business, $selectedOutletId),
            'adjustmentTypes' => StockAdjustmentType::options(),
            'adjustmentReasons' => array_map(fn (StockAdjustmentReason $reason): array => [
                'label' => $reason->label(),
                'value' => $reason->value,
                'types' => array_values(array_map(
                    fn (StockAdjustmentType $type): string => $type->value,
                    array_filter(StockAdjustmentType::cases(), fn (StockAdjustmentType $type): bool => in_array($reason, $type->reasons(), true)),
                )),
            ], StockAdjustmentReason::cases()),
            'selectedOutletId' => $selectedOutletId,
        ]);
    }

    public function store(SaveStockAdjustmentRequest $request): RedirectResponse
    {
        $data = $request->adjustmentData();
        $adjustment = DB::transaction(function () use ($data): StockAdjustment {
            $attributes = $data['adjustment'];
            $outlet = Outlet::query()->where('business_id', $attributes['business_id'])->where('status', 'active')->lockForUpdate()->findOrFail($attributes['outlet_id']);
            $variantIds = collect($data['items'])->pluck('product_variant_id')->sort()->values();
            if ($attributes['type'] === StockAdjustmentType::In) {
                foreach ($variantIds as $variantId) {
                    ProductStock::query()->firstOrCreate(
                        ['outlet_id' => $outlet->id, 'product_variant_id' => $variantId],
                        ['business_id' => $attributes['business_id'], 'quantity' => 0, 'average_cost' => 0, 'stock_value' => 0],
                    );
                }
            }
            $stocks = ProductStock::query()->where('business_id', $attributes['business_id'])->where('outlet_id', $outlet->id)
                ->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');

            if ($attributes['type'] === StockAdjustmentType::Out) {
                foreach ($data['items'] as $index => $item) {
                    $stock = $stocks->get($item['product_variant_id']);
                    if ($stock === null || (float) $stock->quantity + 0.00005 < (float) $item['base_quantity']) {
                        $available = $stock?->quantity ?? '0.0000';
                        throw ValidationException::withMessages(["items.{$index}.quantity" => "Insufficient stock. {$available} base units are available."]);
                    }
                }
            }

            $attributes['created_by_id'] = auth()->id();
            $attributes['adjustment_no'] = StockAdjustment::generateAdjustmentNumber($outlet->id, Carbon::parse($attributes['adjustment_date']));
            $adjustment = StockAdjustment::create($attributes);
            $totalValue = 0.0;

            foreach ($data['items'] as $item) {
                $stock = $stocks->get($item['product_variant_id']);
                if ($adjustment->type === StockAdjustmentType::Out) {
                    $inventoryUnitCost = round((float) $stock->average_cost, 6);
                    $isFullDepletion = abs((float) $stock->quantity - (float) $item['base_quantity']) < 0.00005;
                    $inventoryTotalCost = $isFullDepletion ? round((float) $stock->stock_value, 2) : round((float) $item['base_quantity'] * $inventoryUnitCost, 2);
                    $item['inventory_unit_cost'] = $inventoryUnitCost;
                    $item['inventory_total_cost'] = $inventoryTotalCost;
                }
                $adjustmentItem = $adjustment->items()->create($item);
                $isInbound = $adjustment->type === StockAdjustmentType::In;
                $adjustmentItem->productStockLedgers()->create([
                    'business_id' => $adjustment->business_id, 'outlet_id' => $adjustment->outlet_id,
                    'product_variant_id' => $adjustmentItem->product_variant_id,
                    'transaction_type' => $isInbound ? ProductStockLedgerTransactionType::AdjustmentIn : ProductStockLedgerTransactionType::AdjustmentOut,
                    'quantity_in' => $isInbound ? $adjustmentItem->quantity : 0, 'quantity_out' => $isInbound ? 0 : $adjustmentItem->quantity,
                    'unit_of_measurement_id' => $adjustmentItem->unit_of_measurement_id,
                    'product_unit_conversion_id' => $adjustmentItem->product_unit_conversion_id,
                    'base_quantity' => $adjustmentItem->base_quantity,
                    'unit_cost' => $isInbound ? $adjustmentItem->unit_cost : $adjustmentItem->inventory_unit_cost,
                    'total_cost' => $adjustmentItem->inventory_total_cost,
                    'transaction_date' => $adjustment->adjustment_date, 'note' => $adjustmentItem->note,
                ]);

                $quantity = round((float) $stock->quantity + ($isInbound ? 1 : -1) * (float) $adjustmentItem->base_quantity, 4);
                $stockValue = round((float) $stock->stock_value + ($isInbound ? 1 : -1) * (float) $adjustmentItem->inventory_total_cost, 2);
                if ($quantity <= 0.00005) {
                    $quantity = 0;
                    $stockValue = 0;
                }
                $stock->update(['quantity' => $quantity, 'average_cost' => $quantity > 0 ? round(max(0, $stockValue) / $quantity, 6) : 0, 'stock_value' => max(0, $stockValue), 'last_movement_at' => now()]);
                $totalValue += (float) $adjustmentItem->inventory_total_cost;
            }
            $adjustment->update(['total_value' => round($totalValue, 2)]);

            return $adjustment;
        }, attempts: 3);

        return to_route('stock-adjustments.show', $adjustment)->with('status', 'Stock adjustment created successfully.');
    }

    public function show(StockAdjustment $stockAdjustment): Response
    {
        $this->ensureOwnership($stockAdjustment);

        $stockAdjustment->load([
            'outlet:id,name,code,status',
            'createdBy:id,name',
            'items.productVariant:id,product_id,variant_name,sku,brand_id,is_placeholder_variant,status',
            'items.productVariant.product:id,name',
            'items.productVariant.brand:id,name',
            'items.unitOfMeasurement:id,name,code',
            'items.productStockLedgers',
        ]);

        $canDelete = $this->canDelete($stockAdjustment);

        $stockAdjustment->items->each(
            fn ($item) => $item->unsetRelation('productStockLedgers'),
        );

        $stockAdjustment->setAttribute('can_delete', $canDelete);

        return Inertia::render('inventory/adjustments/show', [
            'adjustment' => $stockAdjustment,
        ]);
    }

    public function destroy(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->ensureOwnership($stockAdjustment);
        DB::transaction(function () use ($stockAdjustment): void {
            Outlet::query()->lockForUpdate()->findOrFail($stockAdjustment->outlet_id);
            $stockAdjustment->load('items.productStockLedgers');
            $variantIds = $stockAdjustment->items->pluck('product_variant_id')->sort()->values();
            $stocks = ProductStock::query()->where('business_id', $stockAdjustment->business_id)->where('outlet_id', $stockAdjustment->outlet_id)
                ->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');
            foreach ($stockAdjustment->items->sortBy('product_variant_id') as $item) {
                if ($item->productStockLedgers->count() !== 1) {
                    throw ValidationException::withMessages(['adjustment' => 'This adjustment cannot be deleted because its inventory history is incomplete.']);
                }
                $ledger = $item->productStockLedgers->first();
                $expectedType = $stockAdjustment->type === StockAdjustmentType::In
                    ? ProductStockLedgerTransactionType::AdjustmentIn
                    : ProductStockLedgerTransactionType::AdjustmentOut;
                if ($ledger->transaction_type !== $expectedType
                    || (int) $ledger->outlet_id !== (int) $stockAdjustment->outlet_id
                    || (int) $ledger->product_variant_id !== (int) $item->product_variant_id
                    || (float) $ledger->base_quantity !== (float) $item->base_quantity
                    || (float) $ledger->total_cost !== (float) $item->inventory_total_cost) {
                    throw ValidationException::withMessages(['adjustment' => 'This adjustment cannot be deleted because its inventory history is inconsistent.']);
                }
                $stock = $stocks->get($item->product_variant_id);
                if ($stock === null) {
                    throw ValidationException::withMessages(['adjustment' => 'This adjustment cannot be deleted because its stock record is missing.']);
                }
                $isInbound = $stockAdjustment->type === StockAdjustmentType::In;
                if ($isInbound && ((float) $stock->quantity + 0.00005 < (float) $ledger->base_quantity || (float) $stock->stock_value + 0.005 < (float) $ledger->total_cost)) {
                    throw ValidationException::withMessages(['adjustment' => 'This adjustment cannot be deleted because its inventory is no longer available to reverse.']);
                }
                $quantity = round((float) $stock->quantity + ($isInbound ? -1 : 1) * (float) $ledger->base_quantity, 4);
                $stockValue = round((float) $stock->stock_value + ($isInbound ? -1 : 1) * (float) $ledger->total_cost, 2);
                if ($quantity <= 0.00005) {
                    $quantity = 0;
                    $stockValue = 0;
                }
                $stock->update(['quantity' => $quantity, 'average_cost' => $quantity > 0 ? round(max(0, $stockValue) / $quantity, 6) : 0, 'stock_value' => max(0, $stockValue), 'last_movement_at' => now()]);
                $ledger->delete();
            }
            $stockAdjustment->delete();
        }, attempts: 3);

        return to_route('stock-adjustments.index')->with('status', 'Stock adjustment deleted successfully.');
    }

    private function ensureOwnership(StockAdjustment $adjustment): void
    {
        abort_unless($adjustment->business_id === Business::current()->id, 404);
    }

    private function canDelete(StockAdjustment $adjustment): bool
    {
        $stocks = ProductStock::query()
            ->where('business_id', $adjustment->business_id)
            ->where('outlet_id', $adjustment->outlet_id)
            ->whereIn('product_variant_id', $adjustment->items->pluck('product_variant_id'))
            ->get()
            ->keyBy('product_variant_id');

        return $adjustment->items->every(function ($item) use ($adjustment, $stocks): bool {
            if ($item->productStockLedgers->count() !== 1) {
                return false;
            }

            $stock = $stocks->get($item->product_variant_id);
            $ledger = $item->productStockLedgers->first();

            return $stock !== null && ($adjustment->type === StockAdjustmentType::Out
                || ((float) $stock->quantity + 0.00005 >= (float) $ledger->base_quantity
                    && (float) $stock->stock_value + 0.005 >= (float) $ledger->total_cost));
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
        $products = Product::query()->whereBelongsTo($business)->where('status', 'active')->with([
            'productVariants' => fn ($query) => $query->where('status', 'active')->select(['id', 'product_id', 'variant_name', 'sku', 'brand_id', 'is_placeholder_variant', 'status']),
            'productVariants.brand:id,name', 'defaultPurchaseUnitConversion.unitOfMeasurement:id,name,code', 'baseUnitConversion.unitOfMeasurement:id,name,code',
            'activeUnitConversions.unitOfMeasurement:id,name,code',
        ])->orderBy('name')->get(['id', 'name', 'base_unit_of_measurement_id']);
        $stocks = ProductStock::query()->where('business_id', $business->id)->where('outlet_id', $outletId)
            ->whereIn('product_variant_id', $products->flatMap->productVariants->pluck('id'))->get()->keyBy('product_variant_id');
        $products->each(fn (Product $product) => $product->productVariants->each(function (ProductVariant $variant) use ($stocks): void {
            $stock = $stocks->get($variant->id);
            $variant->setAttribute('available_quantity', $stock?->quantity ?? '0.0000');
            $variant->setAttribute('average_cost', $stock?->average_cost ?? '0.000000');
            $variant->setAttribute('has_inventory_history', false);
        }));

        return $products;
    }
}
