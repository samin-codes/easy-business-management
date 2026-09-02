<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'source_outlet_id', 'destination_outlet_id', 'created_by_id',
        'transfer_no', 'transfer_date', 'total_value', 'note',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['transfer_date' => 'date', 'total_value' => 'decimal:2'];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function sourceOutlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'source_outlet_id');
    }

    public function destinationOutlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'destination_outlet_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public static function generateTransferNumber(int $sourceOutletId, ?CarbonInterface $date = null): string
    {
        $date ??= now();
        $outlet = Outlet::findOrFail($sourceOutletId);
        $prefix = "TRF-{$outlet->code}-{$date->format('Ym')}-";
        $latest = self::query()->where('source_outlet_id', $sourceOutletId)->where('transfer_no', 'like', $prefix.'%')->latest('id')->first();
        $nextSequence = $latest === null ? 1 : ((int) substr($latest->transfer_no, -4)) + 1;

        return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
    }
}
