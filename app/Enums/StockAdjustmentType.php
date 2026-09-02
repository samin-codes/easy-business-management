<?php

namespace App\Enums;

enum StockAdjustmentType: string
{
    case In = 'in';
    case Out = 'out';

    public function label(): string
    {
        return match ($this) {
            self::In => 'Adjustment In',
            self::Out => 'Adjustment Out',
        };
    }

    /**
     * @return list<StockAdjustmentReason>
     */
    public function reasons(): array
    {
        return StockAdjustmentReason::forType($this);
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case): array => ['label' => $case->label(), 'value' => $case->value],
            self::cases(),
        );
    }
}
