<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id', 'product_variant_id', 'unit_of_measurement_id', 'product_unit_conversion_id',
        'quantity', 'base_quantity', 'unit_price', 'base_unit_price', 'line_total',
        'inventory_unit_cost', 'inventory_total_cost', 'note',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:4', 'base_quantity' => 'decimal:4', 'unit_price' => 'decimal:2',
            'base_unit_price' => 'decimal:6', 'line_total' => 'decimal:2',
            'inventory_unit_cost' => 'decimal:6', 'inventory_total_cost' => 'decimal:2',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
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

    public function productStockLedgers(): MorphMany
    {
        return $this->morphMany(ProductStockLedger::class, 'source');
    }
}
