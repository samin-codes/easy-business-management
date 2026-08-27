<?php

namespace App\Http\Controllers;

use App\Enums\PartyType;
use App\Enums\PaymentMethod;
use App\Enums\ProductStockLedgerTransactionType;
use App\Http\Requests\SaveSaleRequest;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Party;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = trim((string) $request->query('search', ''));
        $sort = in_array($request->query('sort'), ['sale_no', 'sale_date', 'total_amount', 'paid_amount', 'due_amount'], true)
            ? $request->query('sort') : 'sale_date';
        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';
        $sales = Sale::query()
            ->with(['customer:id,name', 'outlet:id,name', 'createdBy:id,name', 'business:id,name'])
            ->whereBelongsTo($business)
            ->when($search, fn ($query, string $search) => $query->where('sale_no', 'like', "%{$search}%"))
            ->orderBy($sort, $direction)->orderBy('id', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'queryString' => ['search' => $search !== '' ? $search : null, 'sort' => $sort, 'direction' => $direction],
        ]);
    }

    public function create(): Response
    {
        $business = Business::current();
        $outlets = Outlet::query()->whereBelongsTo($business)->where('status', 'active')->orderBy('name')->get(['id', 'name', 'code']);
        $customers = Party::query()->whereBelongsTo($business)->where('status', 'active')
            ->whereIn('party_type', [PartyType::Customer, PartyType::Both])->orderBy('name')->get(['id', 'name']);

        return Inertia::render('sales/create', [
            'outlets' => $outlets,
            'customers' => $customers,
            'products' => $this->getProducts($business),
            'paymentMethods' => PaymentMethod::toArray(),
        ]);
    }

    public function show(Sale $sale): Response
    {
        $this->ensureBusinessOwnership($sale);
        $sale->load([
            'customer:id,name', 'outlet:id,name,code', 'createdBy:id,name',
            'items.productVariant:id,product_id,variant_name,sku,brand_id,is_placeholder_variant,status',
            'items.productVariant.product:id,name', 'items.productVariant.brand:id,name',
            'items.unitOfMeasurement:id,name,code',
            'payments:id,business_id,sale_id,customer_party_id,created_by_id,payment_date,amount,payment_method,reference_no,note,created_at,updated_at',
            'payments.createdBy:id,name',
        ]);

        return Inertia::render('sales/show', ['sale' => $sale, 'paymentMethods' => PaymentMethod::toArray()]);
    }

    public function store(SaveSaleRequest $request): RedirectResponse
    {
        $saleData = $request->saleData();
        $sale = DB::transaction(function () use ($saleData): Sale {
            $saleAttributes = $saleData['sale'];
            $outlet = Outlet::query()->whereKey($saleAttributes['outlet_id'])
                ->where('business_id', $saleAttributes['business_id'])->where('status', 'active')
                ->lockForUpdate()->firstOrFail();
            $saleAttributes['created_by_id'] = auth()->id();
            $saleAttributes['sale_no'] = Sale::generateSaleNumber($outlet->id, Carbon::parse($saleAttributes['sale_date']));
            $items = $saleData['items'];
            $variantQuantities = collect($items)->groupBy('product_variant_id')->map(
                fn ($variantItems): float => round($variantItems->sum(fn (array $item): float => (float) $item['base_quantity']), 4)
            );
            $stocks = ProductStock::query()->where('business_id', $saleAttributes['business_id'])
                ->where('outlet_id', $outlet->id)->whereIn('product_variant_id', $variantQuantities->keys())
                ->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');

            foreach ($variantQuantities as $variantId => $requestedQuantity) {
                $stock = $stocks->get($variantId);
                if ($stock === null || (float) $stock->quantity + 0.00005 < $requestedQuantity) {
                    $itemIndex = collect($items)->search(fn (array $item): bool => (int) $item['product_variant_id'] === (int) $variantId);
                    throw ValidationException::withMessages([
                        "items.{$itemIndex}.quantity" => 'Insufficient stock for this product variant.',
                    ]);
                }
            }

            $sale = Sale::create($saleAttributes);
            $updatedStocks = [];
            foreach ($items as $item) {
                $stock = $stocks->get((int) $item['product_variant_id']);
                $inventoryUnitCost = round((float) $stock->average_cost, 6);
                $inventoryTotalCost = round((float) $item['base_quantity'] * $inventoryUnitCost, 2);
                $item['inventory_unit_cost'] = $inventoryUnitCost;
                $item['inventory_total_cost'] = $inventoryTotalCost;
                $saleItem = $sale->items()->create($item);
                $saleItem->productStockLedgers()->create([
                    'business_id' => $sale->business_id, 'outlet_id' => $sale->outlet_id,
                    'product_variant_id' => $saleItem->product_variant_id,
                    'transaction_type' => ProductStockLedgerTransactionType::Sale,
                    'quantity_in' => 0, 'quantity_out' => $saleItem->quantity,
                    'unit_of_measurement_id' => $saleItem->unit_of_measurement_id,
                    'product_unit_conversion_id' => $saleItem->product_unit_conversion_id,
                    'base_quantity' => $saleItem->base_quantity,
                    'unit_cost' => $inventoryUnitCost, 'total_cost' => $inventoryTotalCost,
                    'transaction_date' => $sale->sale_date, 'note' => $saleItem->note,
                ]);
                $updatedStocks[$stock->id] = ($updatedStocks[$stock->id] ?? 0) + $inventoryTotalCost;
            }

            foreach ($stocks as $stock) {
                $quantity = round((float) $stock->quantity - (float) $variantQuantities[$stock->product_variant_id], 4);
                $stockValue = round((float) $stock->stock_value - (float) ($updatedStocks[$stock->id] ?? 0), 2);
                if ($quantity <= 0.00005) {
                    $quantity = 0;
                    $stockValue = 0;
                }
                $stock->update([
                    'quantity' => $quantity, 'average_cost' => $quantity > 0 ? round($stockValue / $quantity, 6) : 0,
                    'stock_value' => max(0, $stockValue), 'last_movement_at' => now(),
                ]);
            }

            if ($saleData['payment'] !== null) {
                $sale->payments()->create([...$saleData['payment'], 'sale_id' => $sale->id, 'created_by_id' => auth()->id()]);
            }

            return $sale;
        });

        return to_route('sales.show', $sale)->with('status', 'Sale created successfully.');
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        $this->ensureBusinessOwnership($sale);
        DB::transaction(function () use ($sale): void {
            $sale->load(['items.productStockLedgers' => fn ($query) => $query
                ->where('business_id', $sale->business_id)->where('outlet_id', $sale->outlet_id)
                ->where('transaction_type', ProductStockLedgerTransactionType::Sale->value)]);
            $ledgers = collect();
            foreach ($sale->items as $item) {
                if ($item->productStockLedgers->count() !== 1) {
                    throw ValidationException::withMessages(['sale' => 'This sale cannot be deleted because its inventory history is incomplete.']);
                }
                $ledger = $item->productStockLedgers->first();
                if ((int) $ledger->product_variant_id !== (int) $item->product_variant_id
                    || (float) $ledger->base_quantity !== (float) $item->base_quantity
                    || (float) $ledger->quantity_out !== (float) $item->quantity) {
                    throw ValidationException::withMessages(['sale' => 'This sale cannot be deleted because its inventory history is inconsistent.']);
                }
                $ledgers->push($ledger);
            }
            $variantIds = $ledgers->pluck('product_variant_id')->unique()->sort()->values();
            $stocks = ProductStock::query()->where('business_id', $sale->business_id)->where('outlet_id', $sale->outlet_id)
                ->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');
            foreach ($ledgers->sortBy('product_variant_id') as $ledger) {
                $stock = $stocks->get($ledger->product_variant_id);
                if ($stock === null) {
                    throw ValidationException::withMessages(['sale' => 'This sale cannot be deleted because its stock record is missing.']);
                }
                $quantity = round((float) $stock->quantity + (float) $ledger->base_quantity, 4);
                $stockValue = round((float) $stock->stock_value + (float) $ledger->total_cost, 2);
                $stock->update([
                    'quantity' => $quantity, 'average_cost' => $quantity > 0 ? round($stockValue / $quantity, 6) : 0,
                    'stock_value' => $stockValue, 'last_movement_at' => now(),
                ]);
                $ledger->delete();
            }
            $sale->delete();
        });

        return to_route('sales.index')->with('status', 'Sale deleted successfully.');
    }

    private function ensureBusinessOwnership(Sale $sale): void
    {
        abort_unless($sale->business_id === Business::current()->id, 404);
    }

    /** @return Collection<int, Product> */
    private function getProducts(Business $business): Collection
    {
        return Product::query()->whereBelongsTo($business)->where('status', 'active')->with([
            'productVariants' => fn ($query) => $query->where('status', 'active')->select(['id', 'product_id', 'variant_name', 'sku', 'brand_id', 'is_placeholder_variant', 'status']),
            'productVariants.brand:id,name',
            'defaultSaleUnitConversion:id,product_id,unit_of_measurement_id,conversion_factor_to_base,is_base_unit,is_default_purchase_unit,is_default_sale_unit,status',
            'defaultSaleUnitConversion.unitOfMeasurement:id,name,code',
            'activeUnitConversions:id,product_id,unit_of_measurement_id,conversion_factor_to_base,is_base_unit,is_default_purchase_unit,is_default_sale_unit,status',
            'activeUnitConversions.unitOfMeasurement:id,name,code',
        ])->orderBy('name')->get(['id', 'name', 'base_unit_of_measurement_id']);
    }
}
