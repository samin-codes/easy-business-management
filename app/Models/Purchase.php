<?php

namespace App\Models;

use App\Enums\PurchasePaymentStatus;
use App\Enums\PurchaseStatus;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'business_id',
        'outlet_id',
        'supplier_party_id',
        'created_by_id',
        'purchase_no',
        'purchase_date',
        'subtotal',
        'discount_amount',
        'transport_cost',
        'labour_cost',
        'other_cost',
        'total_amount',
        'paid_amount',
        'due_amount',
        'payment_status',
        'status',
        'note',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'payment_status_label',
        'status_label',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'transport_cost' => 'decimal:2',
            'labour_cost' => 'decimal:2',
            'other_cost' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_amount' => 'decimal:2',
            'payment_status' => PurchasePaymentStatus::class,
            'status' => PurchaseStatus::class,
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

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'supplier_party_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PurchasePayment::class);
    }

    /**
     * Generate a unique purchase number for the given outlet and date.
     *
     * Format: PUR-{OUTLET_CODE}-{YYYYMM}-{SEQUENCE}
     * Sequence resets per outlet per month.
     */
    public static function generatePurchaseNumber(int $outletId, ?CarbonInterface $date = null): string
    {
        $date = $date ?? now();
        $outlet = Outlet::findOrFail($outletId);
        $month = $date->format('Ym');
        $prefix = "PUR-{$outlet->code}-{$month}-";

        $latestPurchase = self::query()
            ->where('outlet_id', $outletId)
            ->where('purchase_no', 'like', $prefix.'%')
            ->latest('id')
            ->first();

        $nextSequence = 1;

        if ($latestPurchase !== null) {
            $lastSequence = (int) substr($latestPurchase->purchase_no, -4);
            $nextSequence = $lastSequence + 1;
        }

        $sequence = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

        return "PUR-{$outlet->code}-{$month}-{$sequence}";
    }
}
