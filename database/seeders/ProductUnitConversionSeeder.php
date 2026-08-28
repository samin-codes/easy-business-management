<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Product;
use App\Models\UnitOfMeasurement;
use Illuminate\Database\Seeder;

class ProductUnitConversionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $business = Business::current();
        $units = UnitOfMeasurement::query()
            ->whereIn('code', ['ream', 'carton', 'sheet'])
            ->get()
            ->keyBy('code');
        $products = Product::query()
            ->whereBelongsTo($business)
            ->whereIn('name', [
                'A4 Copy Paper', 'Offset Paper', 'Cream Wove Offset Paper',
                'Glossy Sticker Paper', 'Matte Sticker Paper',
            ])
            ->get()
            ->keyBy('name');

        $conversions = [
            ['product' => 'A4 Copy Paper', 'unit' => 'ream', 'factor' => 1, 'is_base_unit' => true, 'is_default_purchase_unit' => false, 'is_default_sale_unit' => true],
            ['product' => 'A4 Copy Paper', 'unit' => 'carton', 'factor' => 5, 'is_base_unit' => false, 'is_default_purchase_unit' => true, 'is_default_sale_unit' => false],
            ['product' => 'A4 Copy Paper', 'unit' => 'sheet', 'factor' => 0.002, 'is_base_unit' => false, 'is_default_purchase_unit' => false, 'is_default_sale_unit' => false],
            ['product' => 'Offset Paper', 'unit' => 'sheet', 'factor' => 0.002, 'is_base_unit' => false, 'is_default_purchase_unit' => false, 'is_default_sale_unit' => false],
            ['product' => 'Cream Wove Offset Paper', 'unit' => 'sheet', 'factor' => 0.002, 'is_base_unit' => false, 'is_default_purchase_unit' => false, 'is_default_sale_unit' => false],
            ['product' => 'Glossy Sticker Paper', 'unit' => 'sheet', 'factor' => 0.002, 'is_base_unit' => false, 'is_default_purchase_unit' => false, 'is_default_sale_unit' => false],
            ['product' => 'Matte Sticker Paper', 'unit' => 'sheet', 'factor' => 0.002, 'is_base_unit' => false, 'is_default_purchase_unit' => false, 'is_default_sale_unit' => false],
        ];

        $products->get('A4 Copy Paper')->unitConversions()->update([
            'is_default_purchase_unit' => false,
            'is_default_sale_unit' => false,
        ]);

        foreach ($conversions as $conversionData) {
            $product = $products->get($conversionData['product']);

            $product->unitConversions()->updateOrCreate(
                ['unit_of_measurement_id' => $units->get($conversionData['unit'])->id],
                [
                    'conversion_factor_to_base' => $conversionData['factor'],
                    'is_base_unit' => $conversionData['is_base_unit'],
                    'is_default_purchase_unit' => $conversionData['is_default_purchase_unit'],
                    'is_default_sale_unit' => $conversionData['is_default_sale_unit'],
                    'status' => RecordStatus::Active,
                ],
            );
        }
    }
}
