<?php

namespace App\Models;

use App\Enums\ProductStockLedgerTransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ProductStockLedger extends Model
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
        'product_variant_id',
        'transaction_type',
        'quantity_in',
        'quantity_out',
        'unit_of_measurement_id',
        'product_unit_conversion_id',
        'base_quantity',
        'unit_cost',
        'total_cost',
        'source_type',
        'source_id',
        'transaction_date',
        'note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'transaction_type' => ProductStockLedgerTransactionType::class,
            'quantity_in' => 'decimal:4',
            'quantity_out' => 'decimal:4',
            'base_quantity' => 'decimal:4',
            'unit_cost' => 'decimal:6',
            'total_cost' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function unitOfMeasurement(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class);
    }

    public function productUnitConversion(): BelongsTo
    {
        return $this->belongsTo(ProductUnitConversion::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
