<?php

namespace App\Http\Requests;

use App\Models\Business;
use App\Models\ProductUnitConversion;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SaveOpeningStockRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['business_id' => Business::current()->id]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $businessId = Business::current()->id;

        return [
            'business_id' => ['required', 'integer', Rule::exists('businesses', 'id')->where('id', $businessId)],
            'outlet_id' => ['required', 'integer', Rule::exists('outlets', 'id')->where(fn ($query) => $query->where('business_id', $businessId)->where('status', 'active'))],
            'opening_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'integer', 'distinct', 'exists:product_variants,id'],
            'items.*.unit_of_measurement_id' => ['required', 'integer', 'exists:unit_of_measurements,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'outlet_id.required' => 'Select an active outlet.',
            'opening_date.required' => 'Pick an opening date.',
            'items.required' => 'Add at least one opening stock item.',
            'items.*.product_variant_id.distinct' => 'The same product variant cannot be added twice.',
            'items.*.quantity.gt' => 'Quantity must be more than 0.',
        ];
    }

    /** @return array{opening_stock: array<string, mixed>, items: list<array<string, mixed>>} */
    public function openingStockData(): array
    {
        $data = $this->validated();
        $items = $this->prepareItems($data);

        return [
            'opening_stock' => [
                'business_id' => $data['business_id'],
                'outlet_id' => $data['outlet_id'],
                'opening_date' => $data['opening_date'],
                'total_value' => round(array_sum(array_column($items, 'total_cost')), 2),
                'note' => $data['note'] ?? null,
            ],
            'items' => $items,
        ];
    }

    /** @param array<string, mixed> $data @return list<array<string, mixed>> */
    private function prepareItems(array $data): array
    {
        $items = $data['items'];
        $variants = ProductVariant::query()
            ->with('product:id,business_id,status')
            ->whereIn('id', collect($items)->pluck('product_variant_id')->unique())
            ->where('status', 'active')->get()->keyBy('id');
        $conversions = ProductUnitConversion::query()
            ->whereIn('product_id', $variants->pluck('product_id')->unique())
            ->whereIn('unit_of_measurement_id', collect($items)->pluck('unit_of_measurement_id')->unique())
            ->where('status', 'active')->get()
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
            $unitCost = (float) $item['unit_cost'];
            $factor = (float) $conversion->conversion_factor_to_base;
            $baseQuantity = round($quantity * $factor, 4);
            if ($baseQuantity <= 0) {
                throw ValidationException::withMessages(["items.{$index}.quantity" => 'Quantity is too small for this unit conversion.']);
            }
            $items[$index] = [
                'product_variant_id' => $variant->id,
                'unit_of_measurement_id' => $conversion->unit_of_measurement_id,
                'product_unit_conversion_id' => $conversion->id,
                'quantity' => round($quantity, 4),
                'base_quantity' => $baseQuantity,
                'unit_cost' => round($unitCost, 2),
                'base_unit_cost' => round($unitCost / $factor, 6),
                'total_cost' => round($quantity * $unitCost, 2),
                'note' => $item['note'] ?? null,
            ];
        }

        return array_values($items);
    }
}
