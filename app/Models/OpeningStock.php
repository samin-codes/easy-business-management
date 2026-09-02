<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OpeningStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'outlet_id', 'created_by_id', 'opening_stock_no', 'opening_date', 'total_value', 'note',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['opening_date' => 'date', 'total_value' => 'decimal:2'];
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
        return $this->hasMany(OpeningStockItem::class);
    }

    public static function generateOpeningStockNumber(int $outletId, ?CarbonInterface $date = null): string
    {
        $date ??= now();
        $outlet = Outlet::findOrFail($outletId);
        $prefix = "OS-{$outlet->code}-{$date->format('Ym')}-";
        $latest = self::query()->where('outlet_id', $outletId)->where('opening_stock_no', 'like', $prefix.'%')->latest('id')->first();
        $nextSequence = $latest === null ? 1 : ((int) substr($latest->opening_stock_no, -4)) + 1;

        return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
    }
}
