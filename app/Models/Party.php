<?php

namespace App\Models;

use App\Enums\AreaType;
use App\Enums\OpeningBalanceType;
use App\Enums\PartyType;
use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Party extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'business_id',
        'name',
        'trade_name',
        'mobile',
        'email',
        'party_type',
        'address_line',
        'district',
        'area_type',
        'area_name',
        'postal_code',
        'opening_balance',
        'opening_balance_type',
        'credit_limit',
        'status',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'party_type_label',
        'opening_balance_type_label',
        'area_type_label',
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
            'party_type' => PartyType::class,
            'opening_balance_type' => OpeningBalanceType::class,
            'status' => RecordStatus::class,
            'opening_balance' => 'decimal:2',
            'credit_limit' => 'decimal:2',
            'area_type' => AreaType::class,
        ];
    }

    protected function partyTypeLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->party_type?->label());
    }

    protected function openingBalanceTypeLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->opening_balance_type?->label());
    }

    protected function areaTypeLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->area_type?->label());
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->status?->label());
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function contactPersons(): HasMany
    {
        return $this->hasMany(PartyContactPerson::class);
    }

    public function partyContactPeople(): HasMany
    {
        return $this->contactPersons();
    }

    public function activeContactPersons(): HasMany
    {
        return $this->hasMany(PartyContactPerson::class)->where('status', 'active');
    }

    public function primaryContactPerson(): HasOne
    {
        return $this->hasOne(PartyContactPerson::class)->where('is_primary', true);
    }

    public function supplierPurchases(): HasMany
    {
        return $this->hasMany(Purchase::class, 'supplier_party_id');
    }

    public function customerSales(): HasMany
    {
        return $this->hasMany(Sale::class, 'customer_party_id');
    }
}
