<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

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
        'purchase_label',
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

    protected function purchaseLabel(): Attribute
    {
        return Attribute::get(function (): string {
            $productName = $this->relationLoaded('product')
                ? $this->product?->name
                : $this->product()->value('name');
            $brandName = $this->relationLoaded('brand')
                ? $this->brand?->name
                : ($this->brand_id ? $this->brand()->value('name') : null);

            $variantName = $brandName
                ? Str::of($this->variant_name)
                    ->replaceStart("{$brandName} / ", '')
                    ->replaceStart($brandName, '')
                    ->trim()
                    ->toString()
                : $this->variant_name;

            $labelParts = [
                $productName,
                $brandName,
            ];

            if (! $this->is_placeholder_variant) {
                $labelParts[] = $variantName;
            }

            $label = collect($labelParts)
                ->filter(fn (?string $labelPart): bool => filled($labelPart))
                ->implode(' / ') ?: $this->variant_name;

            return $label;
        });
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

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function stockLedgers(): HasMany
    {
        return $this->hasMany(ProductStockLedger::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ProductStock::class);
    }
}
