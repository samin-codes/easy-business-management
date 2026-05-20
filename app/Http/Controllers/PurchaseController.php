<?php

namespace App\Http\Controllers;

use App\Enums\PartyType;
use App\Enums\PurchasePaymentStatus;
use App\Enums\PurchaseStatus;
use App\Http\Requests\SavePurchaseRequest;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Party;
use App\Models\Product;
use App\Models\ProductUnitConversion;
use App\Models\ProductVariant;
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
        ]);

        return Inertia::render('purchases/show', [
            'purchase' => $purchase,
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
        ]);
    }

    public function store(SavePurchaseRequest $request): RedirectResponse
    {
        [$data, $items] = $this->preparePurchaseData($request->validated());

        $data['created_by_id'] = auth()->id();
        $data['purchase_no'] = Purchase::generatePurchaseNumber((int) $data['outlet_id'], Carbon::parse($data['purchase_date']));

        $purchase = DB::transaction(function () use ($data, $items): Purchase {
            $purchase = Purchase::create($data);

            foreach ($items as $item) {
                $purchase->items()->create($item);
            }

            return $purchase;
        });

        return to_route('purchases.show', $purchase)
            ->with('status', 'Purchase created successfully.');
    }

    public function edit(Purchase $purchase): Response
    {
        $business = Business::current();
        $purchase->load('items');

        return Inertia::render('purchases/edit', [
            'purchase' => $purchase,
            'purchaseStatusOptions' => PurchaseStatus::options(),
            'purchasePaymentStatusOptions' => PurchasePaymentStatus::options(),
            'outlets' => Outlet::query()
                ->whereBelongsTo($business)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'suppliers' => Party::query()
                ->whereBelongsTo($business)
                ->whereIn('party_type', [PartyType::Supplier->value, PartyType::Both->value])
                ->orderBy('name')
                ->get(['id', 'name']),
            'products' => $this->getProducts($business),
        ]);
    }

    public function update(SavePurchaseRequest $request, Purchase $purchase): RedirectResponse
    {
        [$data, $items] = $this->preparePurchaseData($request->validated());

        DB::transaction(function () use ($purchase, $data, $items): void {
            $purchase->update($data);

            $purchase->items()->delete();

            foreach ($items as $item) {
                $purchase->items()->create($item);
            }
        });

        return to_route('purchases.show', $purchase)
            ->with('status', 'Purchase updated successfully.');
    }

    public function destroy(Purchase $purchase): RedirectResponse
    {
        $purchase->delete();

        return to_route('purchases.index')
            ->with('status', 'Purchase deleted successfully.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: list<array<string, mixed>>}
     *
     * @throws ValidationException
     */
    private function preparePurchaseData(array $data): array
    {
        $items = $data['items'];
        unset($data['items']);

        $subtotal = 0.0;
        $variantIds = collect($items)
            ->pluck('product_variant_id')
            ->map(fn (mixed $variantId): int => (int) $variantId)
            ->unique()
            ->values();
        $unitIds = collect($items)
            ->pluck('unit_of_measurement_id')
            ->map(fn (mixed $unitId): int => (int) $unitId)
            ->unique()
            ->values();
        $variants = ProductVariant::query()
            ->with('product:id,business_id,name')
            ->whereIn('id', $variantIds)
            ->where('status', 'active')
            ->get()
            ->keyBy('id');
        $conversions = ProductUnitConversion::query()
            ->whereIn('product_id', $variants->pluck('product_id')->unique())
            ->whereIn('unit_of_measurement_id', $unitIds)
            ->where('status', 'active')
            ->get()
            ->keyBy(fn (ProductUnitConversion $conversion): string => "{$conversion->product_id}:{$conversion->unit_of_measurement_id}");

        foreach ($items as $index => $item) {
            $variant = $variants->get((int) $item['product_variant_id']);

            if ($variant === null || $variant->product?->business_id !== (int) $data['business_id']) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_variant_id" => 'Select a valid product variant.',
                ]);
            }

            $conversion = $conversions->get("{$variant->product_id}:{$item['unit_of_measurement_id']}");

            if ($conversion === null) {
                throw ValidationException::withMessages([
                    "items.{$index}.unit_of_measurement_id" => 'Select a valid unit for this product variant.',
                ]);
            }

            $quantity = (float) $item['quantity'];
            $unitCost = (float) $item['unit_cost'];
            $conversionFactor = (float) $conversion->conversion_factor_to_base;
            $lineTotal = $quantity * $unitCost;

            $items[$index] = [
                'product_variant_id' => $item['product_variant_id'],
                'unit_of_measurement_id' => $item['unit_of_measurement_id'],
                'product_unit_conversion_id' => $conversion->id,
                'quantity' => round($quantity, 4),
                'base_quantity' => round($quantity * $conversionFactor, 4),
                'unit_cost' => round($unitCost, 2),
                'base_unit_cost' => $conversionFactor > 0
                    ? round($unitCost / $conversionFactor, 6)
                    : 0,
                'discount_amount' => 0,
                'line_total' => round($lineTotal, 2),
            ];

            $subtotal += $lineTotal;
        }

        $discountAmount = (float) $data['discount_amount'];
        $transportCost = (float) $data['transport_cost'];
        $labourCost = (float) $data['labour_cost'];
        $otherCost = (float) $data['other_cost'];
        $paidAmount = (float) $data['paid_amount'];
        $totalAmount = $subtotal + $transportCost + $labourCost + $otherCost - $discountAmount;

        if ($totalAmount < 0) {
            throw ValidationException::withMessages([
                'discount_amount' => 'Discount cannot exceed subtotal and costs.',
            ]);
        }

        $data['subtotal'] = round($subtotal, 2);
        $data['total_amount'] = round($totalAmount, 2);
        $data['due_amount'] = round($totalAmount - $paidAmount, 2);
        $data['payment_status'] = match (true) {
            $paidAmount <= 0 => PurchasePaymentStatus::Unpaid,
            $paidAmount >= $totalAmount => PurchasePaymentStatus::Paid,
            default => PurchasePaymentStatus::Partial,
        };

        return [$data, array_values($items)];
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
