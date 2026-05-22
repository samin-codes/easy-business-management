<?php

namespace App\Http\Controllers;

use App\Enums\PartyType;
use App\Enums\PaymentMethod;
use App\Http\Requests\SavePurchaseRequest;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Party;
use App\Models\Product;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $purchase['purchase_no'] = Purchase::generatePurchaseNumber(
            (int) $purchase['outlet_id'],
            Carbon::parse($purchase['purchase_date']),
        );

        $purchase = DB::transaction(function () use ($purchase, $items, $payment): Purchase {
            $purchase = Purchase::create($purchase);

            foreach ($items as $item) {
                $purchase->items()->create($item);
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
        $purchase->delete();

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
