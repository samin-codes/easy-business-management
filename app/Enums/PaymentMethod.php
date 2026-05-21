<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case BankTransfer = 'bank_transfer';
    case Cheque = 'cheque';
    case MobileBanking = 'mobile_banking';
    case Card = 'card';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::BankTransfer => 'Bank Transfer',
            self::Cheque => 'Cheque',
            self::MobileBanking => 'Mobile Banking',
            self::Card => 'Card',
            self::Other => 'Other',
        };
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function toArray(): array
    {
        return array_map(
            fn (self $method): array => [
                'value' => $method->value,
                'label' => $method->label(),
            ],
            self::cases()
        );
    }
}
