<?php

namespace App\Http\Requests;

use App\Enums\PurchaseStatus;
use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePurchaseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'business_id' => Business::current()->id,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'business_id' => ['required', 'exists:businesses,id'],
            'outlet_id' => ['required', 'exists:outlets,id'],
            'supplier_party_id' => ['required', 'exists:parties,id'],
            'purchase_date' => ['required', 'date'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'transport_cost' => ['required', 'numeric', 'min:0'],
            'labour_cost' => ['required', 'numeric', 'min:0'],
            'other_cost' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::enum(PurchaseStatus::class)],
            'note' => ['nullable', 'string', 'max:2000'],
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
            'items.required' => 'Add at least one purchase item.',
            'items.*.product_variant_id.required' => 'Select a product variant for each item.',
            'items.*.unit_of_measurement_id.required' => 'Select a unit.',
            'items.*.unit_cost.required' => 'Enter the unit cost for each item.',
            'items.*.quantity.required' => 'Enter the quantity for each item.',
            'items.*.quantity.min' => 'Quantity must be more than 0.',
        ];
    }
}
