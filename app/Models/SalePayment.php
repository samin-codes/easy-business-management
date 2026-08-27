<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'sale_id', 'customer_party_id', 'created_by_id', 'payment_date', 'amount',
        'payment_method', 'reference_no', 'note',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['payment_date' => 'date', 'amount' => 'decimal:2', 'payment_method' => PaymentMethod::class];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'customer_party_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
