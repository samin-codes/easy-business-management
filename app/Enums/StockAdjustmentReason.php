<?php

namespace App\Enums;

enum StockAdjustmentReason: string
{
    case StockCountCorrection = 'stock_count_correction';
    case FoundStock = 'found_stock';
    case Damaged = 'damaged';
    case Expired = 'expired';
    case Lost = 'lost';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::StockCountCorrection => 'Stock Count Correction',
            self::FoundStock => 'Found Stock',
            self::Damaged => 'Damaged',
            self::Expired => 'Expired',
            self::Lost => 'Lost',
            self::Other => 'Other',
        };
    }

    /**
     * @return list<self>
     */
    public static function forType(StockAdjustmentType $type): array
    {
        return match ($type) {
            StockAdjustmentType::In => [self::StockCountCorrection, self::FoundStock, self::Other],
            StockAdjustmentType::Out => [self::StockCountCorrection, self::Damaged, self::Expired, self::Lost, self::Other],
        };
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function optionsForType(StockAdjustmentType $type): array
    {
        return array_map(
            fn (self $reason): array => ['label' => $reason->label(), 'value' => $reason->value],
            self::forType($type),
        );
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $reason): array => ['label' => $reason->label(), 'value' => $reason->value],
            self::cases(),
        );
    }
}
