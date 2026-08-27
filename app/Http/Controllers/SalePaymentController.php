<?php

namespace App\Http\Controllers;

use App\Enums\SalePaymentStatus;
use App\Http\Requests\StoreSalePaymentRequest;
use App\Models\Business;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalePaymentController extends Controller
{
    public function store(Sale $sale, StoreSalePaymentRequest $request): RedirectResponse
    {
        abort_unless($sale->business_id === Business::current()->id, 404);
        $data = $request->validated();
        DB::transaction(function () use ($sale, $data): void {
            $sale = Sale::query()->whereBelongsTo(Business::current())->lockForUpdate()->findOrFail($sale->id);
            $amount = round((float) $data['amount'], 2);
            if ($amount > (float) $sale->due_amount + 0.005) {
                throw ValidationException::withMessages(['amount' => 'Payment cannot exceed the current due amount.']);
            }
            $sale->payments()->create($data);
            $this->syncTotals($sale);
        });

        return to_route('sales.show', $sale)->with('status', 'Payment recorded successfully.');
    }

    public function destroy(Sale $sale, SalePayment $salePayment): RedirectResponse
    {
        abort_unless($sale->business_id === Business::current()->id && $salePayment->business_id === Business::current()->id, 404);
        abort_unless($salePayment->sale_id === $sale->id, 404);
        DB::transaction(function () use ($sale, $salePayment): void {
            $sale = Sale::query()->whereBelongsTo(Business::current())->lockForUpdate()->findOrFail($sale->id);
            $salePayment->delete();
            $this->syncTotals($sale);
        });

        return to_route('sales.show', $sale)->with('status', 'Payment deleted successfully.');
    }

    private function syncTotals(Sale $sale): void
    {
        $totalPaid = round((float) $sale->payments()->sum('amount'), 2);
        $totalAmount = (float) $sale->total_amount;
        $sale->update([
            'paid_amount' => $totalPaid,
            'due_amount' => round($totalAmount - $totalPaid, 2),
            'payment_status' => match (true) {
                $totalPaid <= 0 => SalePaymentStatus::Unpaid,
                $totalPaid >= $totalAmount => SalePaymentStatus::Paid,
                default => SalePaymentStatus::Partial,
            },
        ]);
    }
}
