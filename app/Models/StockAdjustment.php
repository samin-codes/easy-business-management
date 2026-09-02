<?php

namespace App\Models;

use App\Enums\StockAdjustmentReason;
use App\Enums\StockAdjustmentType;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'outlet_id', 'created_by_id', 'adjustment_no', 'adjustment_date', 'type', 'reason', 'total_value', 'note',
    ];

    protected $appends = ['type_label', 'reason_label'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'adjustment_date' => 'date', 'type' => StockAdjustmentType::class,
            'reason' => StockAdjustmentReason::class, 'total_value' => 'decimal:2',
        ];
    }

    protected function typeLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->type?->label());
    }

    protected function reasonLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->reason?->label());
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class);
    }

    public static function generateAdjustmentNumber(int $outletId, ?CarbonInterface $date = null): string
    {
        $date ??= now();
        $outlet = Outlet::findOrFail($outletId);
        $prefix = "ADJ-{$outlet->code}-{$date->format('Ym')}-";
        $latest = self::query()->where('outlet_id', $outletId)->where('adjustment_no', 'like', $prefix.'%')->latest('id')->first();
        $nextSequence = $latest === null ? 1 : ((int) substr($latest->adjustment_no, -4)) + 1;

        return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
    }
}
