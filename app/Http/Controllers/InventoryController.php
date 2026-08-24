<?php

namespace App\Http\Controllers;

use App\Enums\ProductStockLedgerTransactionType;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\ProductCategory;
use App\Models\ProductStock;
use App\Models\ProductStockLedger;
use App\Models\ProductVariant;
use App\Models\PurchaseItem;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $outlets = Outlet::query()
            ->whereBelongsTo($business)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
        $selectedOutlet = $outlets->firstWhere('id', $request->integer('outlet_id')) ?? $outlets->first();
        $categories = ProductCategory::query()
            ->whereBelongsTo($business)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $search = $request->string('search')->trim()->limit(255, '')->toString();
        $search = $search !== '' ? $search : null;
        $categoryId = is_array($request->query('category_id'))
            ? null
            : $categories->firstWhere('id', $request->integer('category_id'))?->id;
        $stockStatus = $request->query('stock_status', 'all');
        $stockStatus = in_array($stockStatus, ['all', 'in_stock', 'out_of_stock'], true) ? $stockStatus : 'all';
        $sort = $request->query('sort', 'product');
        $sort = in_array($sort, ['product', 'quantity', 'average_cost', 'stock_value', 'last_movement_at'], true) ? $sort : 'product';
        $direction = $request->query('direction', 'asc') === 'desc' ? 'desc' : 'asc';
        $stockQuantity = 'COALESCE(product_stocks.quantity, 0)';
        $stockAverageCost = 'COALESCE(product_stocks.average_cost, 0)';
        $stockValue = 'COALESCE(product_stocks.stock_value, 0)';

        $inventoryQuery = ProductVariant::query()
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->leftJoin('product_stocks', function (JoinClause $join) use ($business, $selectedOutlet): void {
                $join->on('product_stocks.product_variant_id', '=', 'product_variants.id')
                    ->where('product_stocks.business_id', $business->id)
                    ->where('product_stocks.outlet_id', $selectedOutlet?->id);
            })
            ->where('products.business_id', $business->id)
            ->when($selectedOutlet === null, fn ($query) => $query->whereKey([]))
            ->where(function ($query) use ($stockQuantity): void {
                $query->where('products.status', 'active')
                    ->where('product_variants.status', 'active')
                    ->orWhereRaw("{$stockQuantity} != 0");
            });

        $stocks = (clone $inventoryQuery)
            ->join('product_categories', 'product_categories.id', '=', 'products.product_category_id')
            ->join('unit_of_measurements', 'unit_of_measurements.id', '=', 'products.base_unit_of_measurement_id')
            ->leftJoin('brands', 'brands.id', '=', 'product_variants.brand_id')
            ->when($search, function ($query, string $search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery->where('products.name', 'like', "%{$search}%")
                        ->orWhere('product_variants.variant_name', 'like', "%{$search}%")
                        ->orWhere('product_variants.sku', 'like', "%{$search}%")
                        ->orWhere('brands.name', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, fn ($query, int $categoryId) => $query->where('products.product_category_id', $categoryId))
            ->when($stockStatus === 'in_stock', fn ($query) => $query->whereRaw("{$stockQuantity} > 0"))
            ->when($stockStatus === 'out_of_stock', fn ($query) => $query->whereRaw("{$stockQuantity} <= 0"))
            ->select([
                'product_variants.id',
                'product_variants.product_id',
                'product_variants.variant_name',
                'product_variants.sku',
                'product_variants.status',
                'product_variants.is_placeholder_variant',
                'products.name as product_name',
                'products.status as product_status',
                'product_categories.id as category_id',
                'product_categories.name as category_name',
                'brands.name as brand_name',
                'unit_of_measurements.id as base_unit_id',
                'unit_of_measurements.name as base_unit_name',
                'unit_of_measurements.code as base_unit_code',
                'product_stocks.last_movement_at',
            ])
            ->selectRaw("{$stockQuantity} as stock_quantity")
            ->selectRaw("{$stockAverageCost} as stock_average_cost")
            ->selectRaw("{$stockValue} as stock_value")
            ->orderBy(match ($sort) {
                'quantity' => DB::raw($stockQuantity),
                'average_cost' => DB::raw($stockAverageCost),
                'stock_value' => DB::raw($stockValue),
                'last_movement_at' => 'product_stocks.last_movement_at',
                default => 'products.name',
            }, $direction)
            ->orderBy('product_variants.variant_name')
            ->orderBy('product_variants.id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (ProductVariant $variant): array => [
                'id' => $variant->id,
                'product_id' => $variant->product_id,
                'product_name' => $variant->product_name,
                'label' => $variant->is_placeholder_variant
                    ? $variant->product_name
                    : sprintf('%s / %s', $variant->product_name, $variant->variant_name),
                'variant_name' => $variant->variant_name,
                'sku' => $variant->sku,
                'brand_name' => $variant->brand_name,
                'is_placeholder_variant' => $variant->is_placeholder_variant,
                'status' => $variant->status->value,
                'product_status' => $variant->product_status,
                'category' => [
                    'id' => (int) $variant->category_id,
                    'name' => $variant->category_name,
                ],
                'base_unit' => [
                    'id' => (int) $variant->base_unit_id,
                    'name' => $variant->base_unit_name,
                    'code' => $variant->base_unit_code,
                ],
                'quantity' => (string) $variant->stock_quantity,
                'average_cost' => (string) $variant->stock_average_cost,
                'stock_value' => (string) $variant->stock_value,
                'last_movement_at' => $variant->last_movement_at,
            ]);

        $inventoryTotals = (clone $inventoryQuery)
            ->selectRaw('COUNT(*) as total_variants')
            ->selectRaw("SUM(CASE WHEN {$stockQuantity} > 0 THEN 1 ELSE 0 END) as in_stock_variants")
            ->selectRaw("SUM(CASE WHEN {$stockQuantity} <= 0 THEN 1 ELSE 0 END) as out_of_stock_variants")
            ->selectRaw("COALESCE(SUM({$stockValue}), 0) as inventory_value")
            ->first();

        $summary = [
            'inventory_value' => (string) ($inventoryTotals->inventory_value ?? '0.00'),
            'in_stock_variants' => (int) ($inventoryTotals->in_stock_variants ?? 0),
            'out_of_stock_variants' => (int) ($inventoryTotals->out_of_stock_variants ?? 0),
            'total_variants' => (int) $inventoryTotals->total_variants,
        ];

        return Inertia::render('inventory/index', [
            'stocks' => $stocks,
            'summary' => $summary,
            'outlets' => $outlets,
            'categories' => $categories,
            'selectedOutlet' => $selectedOutlet,
            'queryString' => [
                'outlet_id' => $selectedOutlet?->id,
                'category_id' => $categoryId,
                'search' => $search,
                'stock_status' => $stockStatus,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function show(Request $request, ProductVariant $productVariant): Response
    {
        $business = Business::current();
        $productVariant->load([
            'brand:id,name',
            'product:id,business_id,product_category_id,name,base_unit_of_measurement_id,status',
            'product.category:id,name',
            'product.baseUnitOfMeasurement:id,name,code',
        ]);
        abort_unless($productVariant->product->business_id === $business->id, 404);

        $outlets = Outlet::query()
            ->whereBelongsTo($business)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
        $selectedOutlet = $outlets->firstWhere('id', $request->integer('outlet_id')) ?? $outlets->first();
        $transactionType = $request->query('transaction_type');
        $transactionType = is_string($transactionType)
            ? ProductStockLedgerTransactionType::tryFrom($transactionType)?->value
            : null;
        $dateFrom = $request->date('date_from', '!Y-m-d')?->toDateString();
        $dateTo = $request->date('date_to', '!Y-m-d')?->toDateString();

        if ($dateFrom !== null && $dateTo !== null && $dateTo < $dateFrom) {
            $dateTo = null;
        }

        $stock = ProductStock::query()
            ->whereBelongsTo($business)
            ->where('outlet_id', $selectedOutlet?->id)
            ->whereBelongsTo($productVariant, 'productVariant')
            ->when($selectedOutlet === null, fn ($query) => $query->whereKey([]))
            ->first();

        $movements = ProductStockLedger::query()
            ->with([
                'unitOfMeasurement:id,name,code',
                'source' => function (MorphTo $morphTo): void {
                    $morphTo->morphWith([
                        PurchaseItem::class => ['purchase:id,purchase_no'],
                    ]);
                },
            ])
            ->whereBelongsTo($business)
            ->where('outlet_id', $selectedOutlet?->id)
            ->whereBelongsTo($productVariant, 'productVariant')
            ->when($selectedOutlet === null, fn ($query) => $query->whereKey([]))
            ->when($transactionType, fn ($query, string $transactionType) => $query->where('transaction_type', $transactionType))
            ->when($dateFrom, fn ($query, string $dateFrom) => $query->whereDate('transaction_date', '>=', $dateFrom))
            ->when($dateTo, fn ($query, string $dateTo) => $query->whereDate('transaction_date', '<=', $dateTo))
            ->latest('transaction_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (ProductStockLedger $ledger) use ($selectedOutlet): array {
                $isInbound = (float) $ledger->quantity_in > 0;
                $source = null;

                if ($ledger->source instanceof PurchaseItem && $ledger->source->purchase !== null) {
                    $source = [
                        'type' => 'purchase',
                        'label' => $ledger->source->purchase->purchase_no,
                        'href' => route('purchases.show', $ledger->source->purchase),
                    ];
                }

                return [
                    'id' => $ledger->id,
                    'transaction_date' => $ledger->transaction_date->toDateString(),
                    'transaction_type' => $ledger->transaction_type->value,
                    'transaction_type_label' => $ledger->transaction_type->label(),
                    'direction' => $isInbound ? 'in' : 'out',
                    'entered_quantity' => $isInbound ? $ledger->quantity_in : $ledger->quantity_out,
                    'base_quantity' => $isInbound ? $ledger->base_quantity : '-'.$ledger->base_quantity,
                    'unit_cost' => $ledger->unit_cost,
                    'total_cost' => $ledger->total_cost,
                    'unit' => $ledger->unitOfMeasurement,
                    'outlet' => $selectedOutlet,
                    'source' => $source,
                    'note' => $ledger->note,
                ];
            });

        return Inertia::render('inventory/show', [
            'variant' => [
                'id' => $productVariant->id,
                'label' => $productVariant->is_placeholder_variant
                    ? $productVariant->product->name
                    : sprintf('%s / %s', $productVariant->product->name, $productVariant->variant_name),
                'product_name' => $productVariant->product->name,
                'variant_name' => $productVariant->variant_name,
                'sku' => $productVariant->sku,
                'brand_name' => $productVariant->brand?->name,
                'is_placeholder_variant' => $productVariant->is_placeholder_variant,
                'status' => $productVariant->status->value === 'active' && $productVariant->product->status->value === 'active'
                    ? 'active'
                    : 'inactive',
                'category' => $productVariant->product->category,
                'base_unit' => $productVariant->product->baseUnitOfMeasurement,
            ],
            'stock' => [
                'quantity' => $stock?->quantity ?? '0.0000',
                'average_cost' => $stock?->average_cost ?? '0.000000',
                'stock_value' => $stock?->stock_value ?? '0.00',
                'last_movement_at' => $stock?->last_movement_at?->toISOString(),
            ],
            'movements' => $movements,
            'outlets' => $outlets,
            'selectedOutlet' => $selectedOutlet,
            'transactionTypes' => ProductStockLedgerTransactionType::options(),
            'queryString' => [
                'outlet_id' => $selectedOutlet?->id,
                'transaction_type' => $transactionType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
