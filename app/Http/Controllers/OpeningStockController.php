<?php

namespace App\Http\Controllers;

use App\Enums\ProductStockLedgerTransactionType;
use App\Http\Requests\SaveOpeningStockRequest;
use App\Models\Business;
use App\Models\OpeningStock;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductStockLedger;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OpeningStockController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = $request->string('search')->trim()->limit(255, '')->toString();
        $outletId = $request->integer('outlet_id') ?: null;
        $dateFrom = $request->date('date_from', '!Y-m-d')?->toDateString();
        $dateTo = $request->date('date_to', '!Y-m-d')?->toDateString();

        $openingStocks = OpeningStock::query()
            ->with([
                'outlet:id,name,code',
                'createdBy:id,name',
            ])
            ->withCount('items')
            ->whereBelongsTo($business)
            ->when(
                $search,
                fn ($query, string $value) => $query
                    ->where('opening_stock_no', 'like', "%{$value}%"),
            )
            ->when(
                $outletId,
                fn ($query, int $value) => $query
                    ->where('outlet_id', $value),
            )
            ->when(
                $dateFrom,
                fn ($query, string $value) => $query
                    ->whereDate('opening_date', '>=', $value),
            )
            ->when(
                $dateTo,
                fn ($query, string $value) => $query
                    ->whereDate('opening_date', '<=', $value),
            )
            ->latest('opening_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('inventory/opening-stocks/index', [
            'openingStocks' => $openingStocks,
            'outlets' => $this->outlets($business, activeOnly: false),
            'queryString' => [
                'search' => $search ?: null,
                'outlet_id' => $outletId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $business = Business::current();
        $outlets = $this->outlets($business);
        $selectedOutletId = $outlets->firstWhere('id', $request->integer('outlet_id'))?->id ?? $outlets->first()?->id;

        return Inertia::render('inventory/opening-stocks/create', [
            'outlets' => $outlets,
            'products' => $this->products($business, $selectedOutletId),
            'selectedOutletId' => $selectedOutletId,
        ]);
    }

    public function store(SaveOpeningStockRequest $request): RedirectResponse
    {
        $data = $request->openingStockData();
        $openingStock = DB::transaction(function () use ($data): OpeningStock {
            $attributes = $data['opening_stock'];
            $outlet = Outlet::query()->where('business_id', $attributes['business_id'])->where('status', 'active')
                ->lockForUpdate()->findOrFail($attributes['outlet_id']);
            $variantIds = collect($data['items'])->pluck('product_variant_id')->sort()->values();

            foreach ($variantIds as $variantId) {
                ProductStock::query()->firstOrCreate(
                    ['outlet_id' => $outlet->id, 'product_variant_id' => $variantId],
                    ['business_id' => $attributes['business_id'], 'quantity' => 0, 'average_cost' => 0, 'stock_value' => 0],
                );
            }

            $stocks = ProductStock::query()->where('business_id', $attributes['business_id'])->where('outlet_id', $outlet->id)
                ->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');
            $historyVariantId = ProductStockLedger::query()->where('business_id', $attributes['business_id'])->where('outlet_id', $outlet->id)
                ->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->value('product_variant_id');
            if ($historyVariantId !== null) {
                $itemIndex = collect($data['items'])->search(fn (array $item): bool => (int) $item['product_variant_id'] === (int) $historyVariantId);
                throw ValidationException::withMessages([
                    "items.{$itemIndex}.product_variant_id" => 'Opening stock cannot be added because this product already has inventory movement at this outlet.',
                ]);
            }

            $attributes['created_by_id'] = auth()->id();
            $attributes['opening_stock_no'] = OpeningStock::generateOpeningStockNumber($outlet->id, Carbon::parse($attributes['opening_date']));
            $openingStock = OpeningStock::create($attributes);

            foreach ($data['items'] as $item) {
                $openingStockItem = $openingStock->items()->create($item);
                $openingStockItem->productStockLedgers()->create([
                    'business_id' => $openingStock->business_id, 'outlet_id' => $openingStock->outlet_id,
                    'product_variant_id' => $openingStockItem->product_variant_id,
                    'transaction_type' => ProductStockLedgerTransactionType::OpeningStock,
                    'quantity_in' => $openingStockItem->quantity, 'quantity_out' => 0,
                    'unit_of_measurement_id' => $openingStockItem->unit_of_measurement_id,
                    'product_unit_conversion_id' => $openingStockItem->product_unit_conversion_id,
                    'base_quantity' => $openingStockItem->base_quantity, 'unit_cost' => $openingStockItem->unit_cost,
                    'total_cost' => $openingStockItem->total_cost, 'transaction_date' => $openingStock->opening_date,
                    'note' => $openingStockItem->note,
                ]);
                $stock = $stocks->get($openingStockItem->product_variant_id);
                $quantity = round((float) $stock->quantity + (float) $openingStockItem->base_quantity, 4);
                $stockValue = round((float) $stock->stock_value + (float) $openingStockItem->total_cost, 2);
                $stock->update(['quantity' => $quantity, 'average_cost' => round($stockValue / $quantity, 6), 'stock_value' => $stockValue, 'last_movement_at' => now()]);
            }

            return $openingStock;
        }, attempts: 3);

        return to_route('opening-stocks.show', $openingStock)->with('status', 'Opening stock created successfully.');
    }

    public function show(OpeningStock $openingStock): Response
    {
        $this->ensureOwnership($openingStock);

        $openingStock->load([
            'outlet:id,name,code,status',
            'createdBy:id,name',
            'items.productVariant:id,product_id,variant_name,sku,brand_id,is_placeholder_variant,status',
            'items.productVariant.product:id,name',
            'items.productVariant.brand:id,name',
            'items.unitOfMeasurement:id,name,code',
        ]);

        $canDelete = $this->canDelete($openingStock);

        $openingStock->items->each(
            fn ($item) => $item->unsetRelation('productStockLedgers'),
        );

        $openingStock->setAttribute('can_delete', $canDelete);

        return Inertia::render('inventory/opening-stocks/show', [
            'openingStock' => $openingStock,
        ]);
    }

    public function destroy(OpeningStock $openingStock): RedirectResponse
    {
        $this->ensureOwnership($openingStock);
        DB::transaction(function () use ($openingStock): void {
            Outlet::query()->lockForUpdate()->findOrFail($openingStock->outlet_id);
            $openingStock->load(['items.productStockLedgers' => fn ($query) => $query->where('transaction_type', ProductStockLedgerTransactionType::OpeningStock->value)]);
            $variantIds = $openingStock->items->pluck('product_variant_id')->sort()->values();
            $stocks = ProductStock::query()->where('business_id', $openingStock->business_id)->where('outlet_id', $openingStock->outlet_id)
                ->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');

            foreach ($openingStock->items->sortBy('product_variant_id') as $item) {
                if ($item->productStockLedgers->count() !== 1) {
                    throw ValidationException::withMessages(['opening_stock' => 'This opening stock cannot be deleted because its inventory history is incomplete.']);
                }
                $ledger = $item->productStockLedgers->first();
                if ((int) $ledger->product_variant_id !== (int) $item->product_variant_id
                    || (int) $ledger->outlet_id !== (int) $openingStock->outlet_id
                    || (float) $ledger->base_quantity !== (float) $item->base_quantity
                    || (float) $ledger->quantity_in !== (float) $item->quantity
                    || (float) $ledger->total_cost !== (float) $item->total_cost) {
                    throw ValidationException::withMessages(['opening_stock' => 'This opening stock cannot be deleted because its inventory history is inconsistent.']);
                }
                if (ProductStockLedger::query()->where('business_id', $openingStock->business_id)->where('outlet_id', $openingStock->outlet_id)
                    ->where('product_variant_id', $item->product_variant_id)->where('id', '>', $ledger->id)->exists()) {
                    throw ValidationException::withMessages(['opening_stock' => 'This operation cannot be deleted because later inventory movements depend on it.']);
                }
                $stock = $stocks->get($item->product_variant_id);
                if ($stock === null || (float) $stock->quantity + 0.00005 < (float) $ledger->base_quantity || (float) $stock->stock_value + 0.005 < (float) $ledger->total_cost) {
                    throw ValidationException::withMessages(['opening_stock' => 'This opening stock cannot be deleted because its inventory is no longer available to reverse.']);
                }
                $quantity = max(0, round((float) $stock->quantity - (float) $ledger->base_quantity, 4));
                $stockValue = $quantity === 0.0 ? 0 : max(0, round((float) $stock->stock_value - (float) $ledger->total_cost, 2));
                $stock->update(['quantity' => $quantity, 'average_cost' => $quantity > 0 ? round($stockValue / $quantity, 6) : 0, 'stock_value' => $stockValue, 'last_movement_at' => now()]);
                $ledger->delete();
            }
            $openingStock->delete();
        }, attempts: 3);

        return to_route('opening-stocks.index')->with('status', 'Opening stock deleted successfully.');
    }

    private function ensureOwnership(OpeningStock $openingStock): void
    {
        abort_unless($openingStock->business_id === Business::current()->id, 404);
    }

    private function canDelete(OpeningStock $openingStock): bool
    {
        $openingStock->loadMissing('items.productStockLedgers');
        $latestLedgerIds = ProductStockLedger::query()
            ->where('business_id', $openingStock->business_id)
            ->where('outlet_id', $openingStock->outlet_id)
            ->whereIn('product_variant_id', $openingStock->items->pluck('product_variant_id'))
            ->select(['product_variant_id'])
            ->selectRaw('MAX(id) as latest_id')
            ->groupBy('product_variant_id')
            ->pluck('latest_id', 'product_variant_id');

        return $openingStock->items->every(function ($item) use ($latestLedgerIds): bool {
            if ($item->productStockLedgers->count() !== 1) {
                return false;
            }
            $ledger = $item->productStockLedgers->first();

            return (int) $latestLedgerIds->get($item->product_variant_id) === $ledger->id;
        });
    }

    /** @return Collection<int, Outlet> */
    private function outlets(Business $business, bool $activeOnly = true): Collection
    {
        return Outlet::query()->whereBelongsTo($business)->when($activeOnly, fn ($query) => $query->where('status', 'active'))
            ->orderBy('name')->get(['id', 'name', 'code', 'status']);
    }

    /** @return Collection<int, Product> */
    private function products(Business $business, ?int $outletId): Collection
    {
        $products = Product::query()->whereBelongsTo($business)->where('status', 'active')->with([
            'productVariants' => fn ($query) => $query->where('status', 'active')->select(['id', 'product_id', 'variant_name', 'sku', 'brand_id', 'is_placeholder_variant', 'status']),
            'productVariants.brand:id,name', 'defaultPurchaseUnitConversion.unitOfMeasurement:id,name,code',
            'activeUnitConversions.unitOfMeasurement:id,name,code',
        ])->orderBy('name')->get(['id', 'name', 'base_unit_of_measurement_id']);
        $variantIds = $products->flatMap->productVariants->pluck('id');
        $stocks = ProductStock::query()->where('business_id', $business->id)->where('outlet_id', $outletId)->whereIn('product_variant_id', $variantIds)->get()->keyBy('product_variant_id');
        $history = ProductStockLedger::query()->where('business_id', $business->id)->where('outlet_id', $outletId)->whereIn('product_variant_id', $variantIds)->pluck('product_variant_id')->flip();
        $products->each(fn (Product $product) => $product->productVariants->each(function (ProductVariant $variant) use ($stocks, $history): void {
            $stock = $stocks->get($variant->id);
            $variant->setAttribute('available_quantity', $stock?->quantity ?? '0.0000');
            $variant->setAttribute('average_cost', $stock?->average_cost ?? '0.000000');
            $variant->setAttribute('has_inventory_history', $history->has($variant->id));
        }));

        return $products;
    }
}
