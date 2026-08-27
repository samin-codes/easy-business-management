<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Models\Business;
use App\Models\Sale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalePaymentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        /** @var Sale $sale */
        $sale = $this->route('sale');
        $this->merge([
            'business_id' => Business::current()->id,
            'sale_id' => $sale->id,
            'customer_party_id' => $sale->customer_party_id,
            'created_by_id' => auth()->id(),
        ]);
    }

    public function authorize(): bool
    {
        /** @var Sale $sale */
        $sale = $this->route('sale');

        return $sale->business_id === Business::current()->id;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        /** @var Sale $sale */
        $sale = $this->route('sale');

        return [
            'business_id' => ['required', 'exists:businesses,id'],
            'sale_id' => ['required', 'exists:sales,id'],
            'customer_party_id' => ['required', 'exists:parties,id'],
            'created_by_id' => ['required', 'exists:users,id'],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$sale->due_amount],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
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
