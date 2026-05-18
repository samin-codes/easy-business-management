<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'variant_name',
        'sku',
        'brand_id',
        'grade_value',
        'grade_unit_id',
        'width',
        'height',
        'size_unit_id',
        'size_label',
        'is_placeholder_variant',
        'status',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
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
            'brand_id' => 'integer',
            'grade_value' => 'decimal:2',
            'grade_unit_id' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'size_unit_id' => 'integer',
            'is_placeholder_variant' => 'boolean',
            'status' => RecordStatus::class,
        ];
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn (): string => $this->status->label());
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function gradeUnit(): BelongsTo
    {
        return $this->belongsTo(ProductGradeUnit::class, 'grade_unit_id');
    }

    public function sizeUnit(): BelongsTo
    {
        return $this->belongsTo(ProductSizeUnit::class, 'size_unit_id');
    }
}
