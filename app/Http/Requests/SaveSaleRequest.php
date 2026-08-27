<?php

namespace App\Http\Requests;

use App\Enums\PartyType;
use App\Enums\PaymentMethod;
use App\Enums\SalePaymentStatus;
use App\Enums\SaleStatus;
use App\Models\Business;
use App\Models\ProductUnitConversion;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SaveSaleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $paymentAmount = $this->input('payment.amount');

        $this->merge([
            'business_id' => Business::current()->id,
            'payment.amount' => $paymentAmount === '' || $paymentAmount === null ? 0 : $paymentAmount,
        ]);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'business_id' => ['required', 'exists:businesses,id'],
            'outlet_id' => [
                'required',
                Rule::exists('outlets', 'id')->where(fn ($query) => $query
                    ->where('business_id', Business::current()->id)
                    ->where('status', 'active')),
            ],
            'customer_party_id' => [
                'required',
                Rule::exists('parties', 'id')->where(fn ($query) => $query
                    ->where('business_id', Business::current()->id)
                    ->where('status', 'active')
                    ->whereIn('party_type', [PartyType::Customer->value, PartyType::Both->value])),
            ],
            'sale_date' => ['required', 'date'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:2000'],
            'payment' => ['nullable', 'array'],
            'payment.payment_date' => ['nullable', 'date'],
            'payment.payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'payment.amount' => ['nullable', 'numeric', 'min:0'],
            'payment.reference_no' => ['nullable', 'string', 'max:255'],
            'payment.note' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.unit_of_measurement_id' => ['required', 'exists:unit_of_measurements,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'outlet_id.required' => 'Select an active outlet.',
            'customer_party_id.required' => 'Select an active customer.',
            'sale_date.required' => 'Pick a sale date.',
            'items.required' => 'Add at least one sale item.',
            'items.*.product_variant_id.required' => 'Select a product variant for each item.',
            'items.*.unit_of_measurement_id.required' => 'Select a unit.',
            'items.*.quantity.required' => 'Enter the quantity for each item.',
            'items.*.quantity.gt' => 'Quantity must be more than 0.',
            'items.*.unit_price.required' => 'Enter the unit price for each item.',
        ];
    }

    /**
     * @return array{sale: array<string, mixed>, items: list<array<string, mixed>>, payment: array<string, mixed>|null}
     *
     * @throws ValidationException
     */
    public function saleData(): array
    {
        $data = $this->validated();
        $items = $this->processSaleItems($data);
        $subtotal = array_sum(array_column($items, 'line_total'));
        $discountAmount = (float) $data['discount_amount'];
        $totalAmount = round($subtotal - $discountAmount, 2);
        $paymentAmount = round((float) Arr::get($data, 'payment.amount', 0), 2);

        if ($totalAmount < 0) {
            throw ValidationException::withMessages(['discount_amount' => 'Discount cannot exceed the subtotal.']);
        }

        if ($paymentAmount > $totalAmount + 0.005) {
            throw ValidationException::withMessages(['payment.amount' => 'Payment cannot exceed the sale total.']);
        }

        if ($paymentAmount > 0 && (blank(Arr::get($data, 'payment.payment_date')) || blank(Arr::get($data, 'payment.payment_method')))) {
            throw ValidationException::withMessages(['payment' => 'Payment date and method are required for an initial payment.']);
        }

        return [
            'sale' => [
                'business_id' => $data['business_id'],
                'outlet_id' => $data['outlet_id'],
                'customer_party_id' => $data['customer_party_id'],
                'sale_date' => $data['sale_date'],
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discountAmount, 2),
                'total_amount' => $totalAmount,
                'paid_amount' => $paymentAmount,
                'due_amount' => round($totalAmount - $paymentAmount, 2),
                'payment_status' => $this->paymentStatus($paymentAmount, $totalAmount),
                'status' => SaleStatus::Confirmed,
                'note' => $data['note'] ?? null,
            ],
            'items' => $items,
            'payment' => $paymentAmount > 0 ? [
                'business_id' => $data['business_id'],
                'customer_party_id' => $data['customer_party_id'],
                'payment_date' => $data['payment']['payment_date'],
                'amount' => $paymentAmount,
                'payment_method' => $data['payment']['payment_method'],
                'reference_no' => $data['payment']['reference_no'] ?? null,
                'note' => $data['payment']['note'] ?? null,
            ] : null,
        ];
    }

    /** @param array<string, mixed> $data @return list<array<string, mixed>> */
    private function processSaleItems(array $data): array
    {
        $items = $data['items'];
        $variantIds = collect($items)->pluck('product_variant_id')->map(fn (mixed $id): int => (int) $id)->unique()->values();
        $unitIds = collect($items)->pluck('unit_of_measurement_id')->map(fn (mixed $id): int => (int) $id)->unique()->values();
        $variants = ProductVariant::query()
            ->with('product:id,business_id,status')
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
            if ($variant === null || $variant->product?->business_id !== (int) $data['business_id'] || $variant->product?->status->value !== 'active') {
                throw ValidationException::withMessages(["items.{$index}.product_variant_id" => 'Select a valid active product variant.']);
            }

            $conversion = $conversions->get("{$variant->product_id}:{$item['unit_of_measurement_id']}");
            if ($conversion === null) {
                throw ValidationException::withMessages(["items.{$index}.unit_of_measurement_id" => 'Select a valid active unit for this product variant.']);
            }

            $quantity = (float) $item['quantity'];
            $unitPrice = (float) $item['unit_price'];
            $factor = (float) $conversion->conversion_factor_to_base;
            $baseQuantity = round($quantity * $factor, 4);
            if ($baseQuantity <= 0) {
                throw ValidationException::withMessages(["items.{$index}.quantity" => 'Quantity is too small for this unit conversion.']);
            }

            $items[$index] = [
                'product_variant_id' => $item['product_variant_id'],
                'unit_of_measurement_id' => $item['unit_of_measurement_id'],
                'product_unit_conversion_id' => $conversion->id,
                'quantity' => round($quantity, 4),
                'base_quantity' => $baseQuantity,
                'unit_price' => round($unitPrice, 2),
                'base_unit_price' => $factor > 0 ? round($unitPrice / $factor, 6) : 0,
                'line_total' => round($quantity * $unitPrice, 2),
                'inventory_unit_cost' => 0,
                'inventory_total_cost' => 0,
            ];
        }

        return array_values($items);
    }

    private function paymentStatus(float $paidAmount, float $totalAmount): SalePaymentStatus
    {
        return match (true) {
            $paidAmount <= 0 => SalePaymentStatus::Unpaid,
            $paidAmount >= $totalAmount => SalePaymentStatus::Paid,
            default => SalePaymentStatus::Partial,
        };
    }
}
