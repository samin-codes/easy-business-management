<?php

namespace App\Models;

use App\Enums\SalePaymentStatus;
use App\Enums\SaleStatus;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'outlet_id', 'customer_party_id', 'created_by_id', 'sale_no', 'sale_date',
        'subtotal', 'discount_amount', 'total_amount', 'paid_amount', 'due_amount', 'payment_status', 'status', 'note',
    ];

    protected $appends = ['payment_status_label', 'status_label'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'sale_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_amount' => 'decimal:2',
            'payment_status' => SalePaymentStatus::class,
            'status' => SaleStatus::class,
        ];
    }

    protected function paymentStatusLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->payment_status?->label());
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->status?->label());
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'customer_party_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SalePayment::class);
    }

    public static function generateSaleNumber(int $outletId, ?CarbonInterface $date = null): string
    {
        $date ??= now();
        $outlet = Outlet::findOrFail($outletId);
        $prefix = "SAL-{$outlet->code}-{$date->format('Ym')}-";
        $latestSale = self::query()->where('outlet_id', $outletId)->where('sale_no', 'like', $prefix.'%')->latest('id')->first();
        $nextSequence = $latestSale === null ? 1 : ((int) substr($latestSale->sale_no, -4)) + 1;

        return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
    }
}
