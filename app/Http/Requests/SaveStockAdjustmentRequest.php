<?php

namespace App\Http\Requests;

use App\Enums\StockAdjustmentReason;
use App\Enums\StockAdjustmentType;
use App\Models\Business;
use App\Models\ProductUnitConversion;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SaveStockAdjustmentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['business_id' => Business::current()->id]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $businessId = Business::current()->id;
        $isInbound = $this->input('type') === StockAdjustmentType::In->value;

        return [
            'business_id' => ['required', 'integer', Rule::exists('businesses', 'id')->where('id', $businessId)],
            'outlet_id' => ['required', 'integer', Rule::exists('outlets', 'id')->where(fn ($query) => $query->where('business_id', $businessId)->where('status', 'active'))],
            'adjustment_date' => ['required', 'date'],
            'type' => ['required', Rule::enum(StockAdjustmentType::class)],
            'reason' => ['required', Rule::enum(StockAdjustmentReason::class)],
            'note' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'integer', 'distinct', 'exists:product_variants,id'],
            'items.*.unit_of_measurement_id' => ['required', 'integer', 'exists:unit_of_measurements,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_cost' => [Rule::requiredIf($isInbound), 'nullable', 'numeric', 'min:0'],
            'items.*.note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array{adjustment: array<string, mixed>, items: list<array<string, mixed>>} */
    public function adjustmentData(): array
    {
        $data = $this->validated();
        $type = StockAdjustmentType::from($data['type']);
        $reason = StockAdjustmentReason::from($data['reason']);

        if (! in_array($reason, $type->reasons(), true)) {
            throw ValidationException::withMessages(['reason' => 'Select a valid reason for this adjustment type.']);
        }

        return [
            'adjustment' => [
                'business_id' => $data['business_id'],
                'outlet_id' => $data['outlet_id'],
                'adjustment_date' => $data['adjustment_date'],
                'type' => $type,
                'reason' => $reason,
                'total_value' => 0,
                'note' => $data['note'] ?? null,
            ],
            'items' => $this->prepareItems($data, $type),
        ];
    }

    /** @param array<string, mixed> $data @return list<array<string, mixed>> */
    private function prepareItems(array $data, StockAdjustmentType $type): array
    {
        $items = $data['items'];
        $variants = ProductVariant::query()->with('product:id,business_id,status')
            ->whereIn('id', collect($items)->pluck('product_variant_id')->unique())->where('status', 'active')->get()->keyBy('id');
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
            $factor = (float) $conversion->conversion_factor_to_base;
            $baseQuantity = round($quantity * $factor, 4);
            if ($baseQuantity <= 0) {
                throw ValidationException::withMessages(["items.{$index}.quantity" => 'Quantity is too small for this unit conversion.']);
            }
            $unitCost = $type === StockAdjustmentType::In ? round((float) $item['unit_cost'], 2) : null;
            $items[$index] = [
                'product_variant_id' => $variant->id,
                'unit_of_measurement_id' => $conversion->unit_of_measurement_id,
                'product_unit_conversion_id' => $conversion->id,
                'quantity' => round($quantity, 4),
                'base_quantity' => $baseQuantity,
                'unit_cost' => $unitCost,
                'inventory_unit_cost' => $unitCost === null ? 0 : round($unitCost / $factor, 6),
                'inventory_total_cost' => $unitCost === null ? 0 : round($quantity * $unitCost, 2),
                'note' => $item['note'] ?? null,
            ];
        }

        return array_values($items);
    }
}
