<?php

namespace App\Http\Requests;

use App\Enums\RecordStatus;
use App\Models\ProductVariant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var ProductVariant|null $productVariant */
        $productVariant = $this->route('product_variant');

        return [
            'variant_name' => ['required', 'string', 'max:255'],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_variants', 'sku')->ignore($productVariant?->id),
            ],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'grade_value' => ['nullable', 'numeric', 'gte:0', 'required_with:grade_unit_id'],
            'grade_unit_id' => ['nullable', 'exists:product_grade_units,id', 'required_with:grade_value'],
            'width' => ['nullable', 'integer', 'min:1', 'max:65535', 'required_with:height,size_unit_id'],
            'height' => ['nullable', 'integer', 'min:1', 'max:65535', 'required_with:width,size_unit_id'],
            'size_unit_id' => ['nullable', 'exists:product_size_units,id', 'required_with:width,height'],
            'size_label' => ['nullable', 'string', 'max:255'],
            'is_placeholder_variant' => ['boolean'],
            'status' => ['required', Rule::enum(RecordStatus::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'variant_name.required' => 'Enter a variant name.',
            'sku.required' => 'Enter a SKU.',
            'sku.unique' => 'This SKU is already used by another variant.',
            'grade_value.required_with' => 'Enter the grade value when selecting a grade unit.',
            'grade_unit_id.required_with' => 'Select the grade unit when entering a grade value.',
            'width.required_with' => 'Enter the width when defining dimensions.',
            'height.required_with' => 'Enter the height when defining dimensions.',
            'size_unit_id.required_with' => 'Select the size unit when defining dimensions.',
            'status.required' => 'Choose a status.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'brand_id' => $this->filled('brand_id') ? $this->input('brand_id') : null,
            'grade_value' => $this->filled('grade_value') ? $this->input('grade_value') : null,
            'grade_unit_id' => $this->filled('grade_unit_id') ? $this->input('grade_unit_id') : null,
            'width' => $this->filled('width') ? $this->input('width') : null,
            'height' => $this->filled('height') ? $this->input('height') : null,
            'size_unit_id' => $this->filled('size_unit_id') ? $this->input('size_unit_id') : null,
            'size_label' => $this->filled('size_label') ? $this->input('size_label') : null,
            'is_placeholder_variant' => $this->boolean('is_placeholder_variant'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'brand_id' => 'brand',
            'grade_unit_id' => 'grade unit',
            'size_unit_id' => 'size unit',
        ];
    }
}
