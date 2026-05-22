<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Enums\PurchasePaymentStatus;
use App\Enums\PurchaseStatus;
use App\Models\Business;
use App\Models\ProductUnitConversion;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SavePurchaseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $paymentAmount = $this->input('payment.amount');

        $this->merge([
            'business_id' => Business::current()->id,
            'payment.amount' => ($paymentAmount === '' || $paymentAmount === null)
                ? 0
                : $paymentAmount,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paymentAmount = (float) $this->input('payment.amount');

        return [
            'business_id' => ['required', 'exists:businesses,id'],
            'outlet_id' => ['required', 'exists:outlets,id'],
            'supplier_party_id' => ['required', 'exists:parties,id'],
            'purchase_date' => ['required', 'date'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'transport_cost' => ['required', 'numeric', 'min:0'],
            'labour_cost' => ['required', 'numeric', 'min:0'],
            'other_cost' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::enum(PurchaseStatus::class)],
            'note' => ['nullable', 'string', 'max:2000'],
            'payment' => ['nullable', 'array'],
            'payment.payment_date' => ['nullable', 'date', Rule::requiredIf($paymentAmount > 0)],
            'payment.payment_method' => ['nullable', Rule::enum(PaymentMethod::class), Rule::requiredIf($paymentAmount > 0)],
            'payment.amount' => ['nullable', 'numeric', 'min:0'],
            'payment.reference_no' => ['nullable', 'string', 'max:255'],
            'payment.note' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.unit_of_measurement_id' => ['required', 'exists:unit_of_measurements,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'outlet_id.required' => 'Select an outlet.',
            'supplier_party_id.required' => 'Select a supplier.',
            'purchase_date.required' => 'Pick a purchase date.',
            'payment.payment_date.required' => 'Pick a payment date.',
            'payment.payment_method.required' => 'Select a payment method.',
            'items.required' => 'Add at least one purchase item.',
            'items.*.product_variant_id.required' => 'Select a product variant for each item.',
            'items.*.unit_of_measurement_id.required' => 'Select a unit.',
            'items.*.unit_cost.required' => 'Enter the unit cost for each item.',
            'items.*.quantity.required' => 'Enter the quantity for each item.',
            'items.*.quantity.min' => 'Quantity must be more than 0.',
        ];
    }

    /**
     * Get the prepared data for purchase creation.
     *
     * @return array{purchase: array<string, mixed>, items: list<array<string, mixed>>, payment: array<string, mixed>|null}
     *
     * @throws ValidationException
     */
    public function purchaseData(): array
    {
        $data = $this->validated();
        $items = $this->processPurchaseItems($data);
        $subtotal = array_sum(array_column($items, 'line_total'));

        $discountAmount = (float) $data['discount_amount'];
        $transportCost = (float) $data['transport_cost'];
        $labourCost = (float) $data['labour_cost'];
        $otherCost = (float) $data['other_cost'];
        $paymentAmount = (float) Arr::get($data, 'payment.amount', 0);
        $totalAmount = $subtotal + $transportCost + $labourCost + $otherCost - $discountAmount;

        if ($totalAmount < 0) {
            throw ValidationException::withMessages([
                'discount_amount' => 'Discount cannot exceed subtotal and costs.',
            ]);
        }

        $paidAmount = round($paymentAmount, 2);
        $dueAmount = round($totalAmount - $paidAmount, 2);

        $purchase = [
            'business_id' => $data['business_id'],
            'outlet_id' => $data['outlet_id'],
            'supplier_party_id' => $data['supplier_party_id'],
            'purchase_date' => $data['purchase_date'],
            'subtotal' => round($subtotal, 2),
            'discount_amount' => $discountAmount,
            'transport_cost' => $transportCost,
            'labour_cost' => $labourCost,
            'other_cost' => $otherCost,
            'total_amount' => round($totalAmount, 2),
            'paid_amount' => $paidAmount,
            'due_amount' => $dueAmount,
            'payment_status' => match (true) {
                $paidAmount <= 0 => PurchasePaymentStatus::Unpaid,
                $paidAmount >= $totalAmount => PurchasePaymentStatus::Paid,
                default => PurchasePaymentStatus::Partial,
            },
            'status' => $data['status'],
            'note' => $data['note'] ?? null,
        ];

        $payment = null;

        if ($paymentAmount > 0) {
            $payment = [
                'business_id' => $data['business_id'],
                'supplier_party_id' => $data['supplier_party_id'],
                'payment_date' => $data['payment']['payment_date'],
                'amount' => $paidAmount,
                'payment_method' => $data['payment']['payment_method'],
                'reference_no' => $data['payment']['reference_no'] ?? null,
                'note' => $data['payment']['note'] ?? null,
            ];
        }

        return [
            'purchase' => $purchase,
            'items' => $items,
            'payment' => $payment,
        ];
    }

    /**
     * Process and validate purchase items from request data.
     *
     * @param  array<string, mixed>  $data
     * @return list<array<string, mixed>>
     *
     * @throws ValidationException
     */
    private function processPurchaseItems(array $data): array
    {
        $items = $data['items'];

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
        }

        return array_values($items);
    }
}
