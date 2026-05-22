<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Models\Business;
use App\Models\Purchase;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchasePaymentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        /** @var Purchase $purchase */
        $purchase = $this->route('purchase');

        $this->merge([
            'business_id' => Business::current()->id,
            'purchase_id' => $purchase->id,
            'supplier_party_id' => $purchase->supplier_party_id,
            'created_by_id' => auth()->id(),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Purchase $purchase */
        $purchase = $this->route('purchase');

        return [
            'business_id' => ['required', 'exists:businesses,id'],
            'purchase_id' => ['required', 'exists:purchases,id'],
            'supplier_party_id' => ['required', 'exists:parties,id'],
            'created_by_id' => ['required', 'exists:users,id'],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$purchase->due_amount],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
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
            'payment_date.required' => 'Pick a payment date.',
            'amount.required' => 'Enter the payment amount.',
            'amount.min' => 'Payment amount must be greater than 0.',
            'amount.max' => 'Payment amount cannot exceed the due amount.',
            'payment_method.required' => 'Select a payment method.',
        ];
    }
}
