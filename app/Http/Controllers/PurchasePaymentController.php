<?php

namespace App\Http\Controllers;

use App\Enums\PurchasePaymentStatus;
use App\Http\Requests\StorePurchasePaymentRequest;
use App\Models\Purchase;
use App\Models\PurchasePayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class PurchasePaymentController extends Controller
{
    public function store(Purchase $purchase, StorePurchasePaymentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($purchase, $data): void {
            $purchase->payments()->create($data);

            $totalPaid = $purchase->payments()->sum('amount');
            $totalAmount = (float) $purchase->total_amount;
            $dueAmount = round($totalAmount - $totalPaid, 2);

            $paymentStatus = match (true) {
                $totalPaid <= 0 => PurchasePaymentStatus::Unpaid,
                $totalPaid >= $totalAmount => PurchasePaymentStatus::Paid,
                default => PurchasePaymentStatus::Partial,
            };

            $purchase->update([
                'paid_amount' => round($totalPaid, 2),
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
            ]);
        });

        return to_route('purchases.show', $purchase)
            ->with('status', 'Payment recorded successfully.');
    }

    public function destroy(Purchase $purchase, PurchasePayment $purchasePayment): RedirectResponse
    {
        abort_if($purchasePayment->purchase_id !== $purchase->id, 404);

        DB::transaction(function () use ($purchase, $purchasePayment): void {
            $purchasePayment->delete();

            $totalPaid = $purchase->payments()->sum('amount');
            $totalAmount = (float) $purchase->total_amount;
            $dueAmount = round($totalAmount - $totalPaid, 2);

            $paymentStatus = match (true) {
                $totalPaid <= 0 => PurchasePaymentStatus::Unpaid,
                $totalPaid >= $totalAmount => PurchasePaymentStatus::Paid,
                default => PurchasePaymentStatus::Partial,
            };

            $purchase->update([
                'paid_amount' => round($totalPaid, 2),
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
            ]);
        });

        return to_route('purchases.show', $purchase)
            ->with('status', 'Payment deleted successfully.');
    }
}
