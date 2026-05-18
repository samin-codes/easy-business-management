<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductUnitConversion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'unit_of_measurement_id',
        'conversion_factor_to_base',
        'is_base_unit',
        'is_default_purchase_unit',
        'is_default_sale_unit',
        'status',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'conversion_unit_quantity',
        'base_unit_quantity',
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
            'conversion_factor_to_base' => 'decimal:6',
            'is_base_unit' => 'boolean',
            'is_default_purchase_unit' => 'boolean',
            'is_default_sale_unit' => 'boolean',
            'status' => RecordStatus::class,
        ];
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn (): string => $this->status->label());
    }

    protected function conversionUnitQuantity(): Attribute
    {
        return Attribute::get(function (): string {
            if ($this->is_base_unit) {
                return '1';
            }

            $conversionFactor = (float) $this->conversion_factor_to_base;

            if ($conversionFactor < 1) {
                return $this->formatQuantity(1 / $conversionFactor);
            }

            return '1';
        });
    }

    protected function baseUnitQuantity(): Attribute
    {
        return Attribute::get(function (): string {
            if ($this->is_base_unit) {
                return '1';
            }

            $conversionFactor = (float) $this->conversion_factor_to_base;

            if ($conversionFactor < 1) {
                return '1';
            }

            return $this->formatQuantity($conversionFactor);
        });
    }

    private function formatQuantity(float $quantity): string
    {
        return rtrim(rtrim(number_format($quantity, 3, '.', ''), '0'), '.');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unitOfMeasurement(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function productStockLedgers(): HasMany
    {
        return $this->hasMany(ProductStockLedger::class);
    }
}
