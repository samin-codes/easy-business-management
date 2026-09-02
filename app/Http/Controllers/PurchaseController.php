<?php

namespace App\Http\Controllers;

use App\Enums\PartyType;
use App\Enums\PaymentMethod;
use App\Enums\ProductStockLedgerTransactionType;
use App\Http\Requests\SavePurchaseRequest;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Party;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = trim((string) $request->query('search', ''));
        $sort = $request->query('sort', 'purchase_date');
        $direction = $request->query('direction', 'desc');

        if (! in_array($sort, ['purchase_no', 'purchase_date', 'total_amount', 'paid_amount', 'due_amount'], true)) {
            $sort = 'purchase_date';
        }

        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $purchases = Purchase::query()
            ->with(['supplier:id,name', 'outlet:id,name', 'createdBy:id,name', 'business:id,name'])
            ->whereBelongsTo($business)
            ->when($search, function ($query, $search) {
                $query->where('purchase_no', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction)
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('purchases/index', [
            'purchases' => $purchases,
            'queryString' => [
                'search' => $search !== '' ? $search : null,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load([
            'supplier:id,name',
            'outlet:id,name,code',
            'createdBy:id,name',
            'items.productVariant:id,product_id,variant_name,sku,brand_id,is_placeholder_variant,status',
            'items.productVariant.product:id,name',
            'items.productVariant.brand:id,name',
            'items.unitOfMeasurement:id,name,code',
            'payments:id,business_id,purchase_id,supplier_party_id,created_by_id,payment_date,amount,payment_method,reference_no,note,created_at,updated_at',
            'payments.createdBy:id,name',
        ]);

        return Inertia::render('purchases/show', [
            'purchase' => $purchase,
            'paymentMethods' => PaymentMethod::toArray(),
        ]);
    }

    public function create(): Response
    {
        $business = Business::current();

        $outlets = Outlet::query()
            ->whereBelongsTo($business)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $suppliers = Party::query()
            ->whereBelongsTo($business)
            ->whereIn('party_type', [PartyType::Supplier, PartyType::Both])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('purchases/create', [
            'outlets' => $outlets,
            'suppliers' => $suppliers,
            'products' => $this->getProducts($business),
            'paymentMethods' => PaymentMethod::toArray(),
        ]);
    }

    public function store(SavePurchaseRequest $request): RedirectResponse
    {
        $purchaseData = $request->purchaseData();
        $purchase = $purchaseData['purchase'];
        $items = $purchaseData['items'];
        $payment = $purchaseData['payment'];

        $purchase['created_by_id'] = auth()->id();
        $purchase = DB::transaction(function () use ($purchase, $items, $payment): Purchase {
            $outlet = Outlet::query()
                ->where('business_id', $purchase['business_id'])
                ->where('status', 'active')
                ->lockForUpdate()
                ->findOrFail($purchase['outlet_id']);
            $purchase['purchase_no'] = Purchase::generatePurchaseNumber(
                $outlet->id,
                Carbon::parse($purchase['purchase_date']),
            );
            $purchase = Purchase::create($purchase);

            foreach ($items as $item) {
                $purchaseItem = $purchase->items()->create($item);

                $purchaseItem->productStockLedgers()->create([
                    'business_id' => $purchase->business_id,
                    'outlet_id' => $purchase->outlet_id,
                    'product_variant_id' => $purchaseItem->product_variant_id,
                    'transaction_type' => ProductStockLedgerTransactionType::Purchase,
                    'quantity_in' => $purchaseItem->quantity,
                    'quantity_out' => 0,
                    'unit_of_measurement_id' => $purchaseItem->unit_of_measurement_id,
                    'product_unit_conversion_id' => $purchaseItem->product_unit_conversion_id,
                    'base_quantity' => $purchaseItem->base_quantity,
                    'unit_cost' => $purchaseItem->unit_cost,
                    'total_cost' => $purchaseItem->line_total,
                    'transaction_date' => $purchase->purchase_date,
                    'note' => $purchaseItem->note,
                ]);

                $stock = ProductStock::query()->firstOrCreate(
                    [
                        'outlet_id' => $purchase->outlet_id,
                        'product_variant_id' => $purchaseItem->product_variant_id,
                    ],
                    [
                        'business_id' => $purchase->business_id,
                        'quantity' => 0,
                        'average_cost' => 0,
                        'stock_value' => 0,
                    ],
                );
                $stock = ProductStock::query()->lockForUpdate()->findOrFail($stock->id);
                $quantity = round((float) $stock->quantity + (float) $purchaseItem->base_quantity, 4);
                $stockValue = round((float) $stock->stock_value + (float) $purchaseItem->line_total, 2);

                $stock->update([
                    'quantity' => $quantity,
                    'average_cost' => $quantity > 0 ? round($stockValue / $quantity, 6) : 0,
                    'stock_value' => $stockValue,
                    'last_movement_at' => now(),
                ]);
            }

            if ($payment !== null) {
                $payment['purchase_id'] = $purchase->id;
                $payment['created_by_id'] = auth()->id();
                $purchase->payments()->create($payment);
            }

            return $purchase;
        });

        return to_route('purchases.show', $purchase)
            ->with('status', 'Purchase created successfully.');
    }

    public function destroy(Purchase $purchase): RedirectResponse
    {
        DB::transaction(function () use ($purchase): void {
            $purchase->load([
                'items.productStockLedgers' => fn ($query) => $query
                    ->where('business_id', $purchase->business_id)
                    ->where('outlet_id', $purchase->outlet_id)
                    ->where('transaction_type', ProductStockLedgerTransactionType::Purchase->value),
            ]);

            $stockLedgers = $purchase->items
                ->flatMap->productStockLedgers
                ->sortBy('product_variant_id');

            foreach ($stockLedgers as $stockLedger) {
                $stock = ProductStock::query()
                    ->where('outlet_id', $purchase->outlet_id)
                    ->where('product_variant_id', $stockLedger->product_variant_id)
                    ->lockForUpdate()
                    ->first();

                if ($stock === null
                    || (float) $stock->quantity + 0.00005 < (float) $stockLedger->base_quantity
                    || (float) $stock->stock_value + 0.005 < (float) $stockLedger->total_cost
                ) {
                    throw ValidationException::withMessages([
                        'purchase' => 'This purchase cannot be deleted because its inventory is no longer available to reverse.',
                    ]);
                }

                $quantity = max(0, round((float) $stock->quantity - (float) $stockLedger->base_quantity, 4));
                $stockValue = max(0, round((float) $stock->stock_value - (float) $stockLedger->total_cost, 2));

                if ($quantity === 0.0) {
                    $stockValue = 0;
                }

                $stock->update([
                    'quantity' => $quantity,
                    'average_cost' => $quantity > 0 ? round($stockValue / $quantity, 6) : 0,
                    'stock_value' => $stockValue,
                    'last_movement_at' => now(),
                ]);

                $stockLedger->delete();
            }

            $purchase->delete();
        });

        return to_route('purchases.index')
            ->with('status', 'Purchase deleted successfully.');
    }

    /**
     * @return Collection<int, Product>
     */
    private function getProducts(Business $business): Collection
    {
        return Product::query()
            ->with([
                'productVariants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->select(['id', 'product_id', 'variant_name', 'sku', 'brand_id', 'is_placeholder_variant', 'status']),
                'productVariants.brand:id,name',
                'defaultPurchaseUnitConversion:id,product_id,unit_of_measurement_id,conversion_factor_to_base,is_base_unit,is_default_purchase_unit,is_default_sale_unit,status',
                'defaultPurchaseUnitConversion.unitOfMeasurement:id,name,code',
                'activeUnitConversions:id,product_id,unit_of_measurement_id,conversion_factor_to_base,is_base_unit,is_default_purchase_unit,is_default_sale_unit,status',
                'activeUnitConversions.unitOfMeasurement:id,name,code',
            ])
            ->whereBelongsTo($business)
            ->orderBy('name')
            ->get(['id', 'name', 'base_unit_of_measurement_id']);
    }
}
