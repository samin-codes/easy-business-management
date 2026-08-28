<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Models\Brand;
use App\Models\Business;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductGradeUnit;
use App\Models\ProductSizeUnit;
use App\Models\UnitOfMeasurement;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $business = Business::current();

        $categories = ProductCategory::query()
            ->whereBelongsTo($business)
            ->get()
            ->keyBy('name');

        $units = UnitOfMeasurement::query()
            ->whereIn('code', ['ream', 'kg', 'roll', 'bundle'])
            ->get()
            ->keyBy('code');

        $brands = Brand::query()
            ->get()
            ->keyBy('name');

        $gradeUnits = ProductGradeUnit::query()
            ->get()
            ->keyBy('code');

        $sizeUnits = ProductSizeUnit::query()
            ->get()
            ->keyBy('code');

        $products = [
            [
                'category' => 'Offset Paper',
                'name' => 'Offset Paper',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 55 GSM / 23x36', 'sku' => 'OFF-55-2336-001', 'brand' => 'Local Mill', 'grade_value' => 55, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 60 GSM / 23x36', 'sku' => 'OFF-60-2336-002', 'brand' => 'Local Mill', 'grade_value' => 60, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Bashundhara / 70 GSM / 23x36', 'sku' => 'OFF-70-2336-003', 'brand' => 'Bashundhara', 'grade_value' => 70, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Bashundhara / 80 GSM / 23x36', 'sku' => 'OFF-80-2336-004', 'brand' => 'Bashundhara', 'grade_value' => 80, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 100 GSM / 20x30', 'sku' => 'OFF-100-2030-007', 'brand' => 'Local Mill', 'grade_value' => 100, 'grade_unit_code' => 'GSM', 'width' => 20, 'height' => 30, 'size_unit_code' => 'IN', 'size_label' => '20x30', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Offset Paper',
                'name' => 'A4 Copy Paper',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'PaperOne / 80 GSM / A4', 'sku' => 'OFF-80-A4-005', 'brand' => 'PaperOne', 'grade_value' => 80, 'grade_unit_code' => 'GSM', 'width' => null, 'height' => null, 'size_unit_code' => null, 'size_label' => 'A4', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Double A / 80 GSM / A4', 'sku' => 'OFF-80-A4-006', 'brand' => 'Double A', 'grade_value' => 80, 'grade_unit_code' => 'GSM', 'width' => null, 'height' => null, 'size_unit_code' => null, 'size_label' => 'A4', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Offset Paper',
                'name' => 'Cream Wove Offset Paper',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 80 GSM / 23x36', 'sku' => 'OFF-80-CRM-008', 'brand' => 'Local Mill', 'grade_value' => 80, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Art Card',
                'name' => 'Art Card',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 230 GSM / 23x36', 'sku' => 'ART-230-2336-009', 'brand' => 'Local Mill', 'grade_value' => 230, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 250 GSM / 23x36', 'sku' => 'ART-250-2336-010', 'brand' => 'Local Mill', 'grade_value' => 250, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 260 GSM / 20x30', 'sku' => 'ART-260-2030-011', 'brand' => 'Local Mill', 'grade_value' => 260, 'grade_unit_code' => 'GSM', 'width' => 20, 'height' => 30, 'size_unit_code' => 'IN', 'size_label' => '20x30', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 300 GSM / 20x30', 'sku' => 'ART-300-2030-012', 'brand' => 'Local Mill', 'grade_value' => 300, 'grade_unit_code' => 'GSM', 'width' => 20, 'height' => 30, 'size_unit_code' => 'IN', 'size_label' => '20x30', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Art Card',
                'name' => 'Glossy Art Card',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 250 GSM / 23x36', 'sku' => 'ART-250-GLS-013', 'brand' => 'Local Mill', 'grade_value' => 250, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Art Card',
                'name' => 'Matte Art Card',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 300 GSM / 23x36', 'sku' => 'ART-300-MAT-014', 'brand' => 'Local Mill', 'grade_value' => 300, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Duplex Board',
                'name' => 'Duplex Board Grey Back',
                'unit' => 'kg',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 250 GSM / 23x36', 'sku' => 'DUP-250-GB-015', 'brand' => 'Local Mill', 'grade_value' => 250, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 300 GSM / 23x36', 'sku' => 'DUP-300-GB-016', 'brand' => 'Local Mill', 'grade_value' => 300, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 350 GSM / 23x36', 'sku' => 'DUP-350-GB-017', 'brand' => 'Local Mill', 'grade_value' => 350, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 400 GSM / 23x36', 'sku' => 'DUP-400-GB-018', 'brand' => 'Local Mill', 'grade_value' => 400, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Duplex Board',
                'name' => 'Duplex Board White Back',
                'unit' => 'kg',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 300 GSM / 23x36', 'sku' => 'DUP-300-WB-019', 'brand' => 'Local Mill', 'grade_value' => 300, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 350 GSM / 23x36', 'sku' => 'DUP-350-WB-020', 'brand' => 'Local Mill', 'grade_value' => 350, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Newsprint',
                'name' => 'Newsprint',
                'unit' => 'kg',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 45 GSM / 23x36', 'sku' => 'NEW-45-2336-021', 'brand' => 'Local Mill', 'grade_value' => 45, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 48 GSM / 23x36', 'sku' => 'NEW-48-2336-022', 'brand' => 'Local Mill', 'grade_value' => 48, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Local Mill / 52 GSM / 23x36', 'sku' => 'NEW-52-2336-023', 'brand' => 'Local Mill', 'grade_value' => 52, 'grade_unit_code' => 'GSM', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Newsprint',
                'name' => 'Newsprint Roll',
                'unit' => 'roll',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Local Mill / 45 GSM / Roll', 'sku' => 'NEW-45-ROLL-024', 'brand' => 'Local Mill', 'grade_value' => 45, 'grade_unit_code' => 'GSM', 'width' => null, 'height' => null, 'size_unit_code' => null, 'size_label' => 'Roll', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Sticker Paper',
                'name' => 'Glossy Sticker Paper',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => '20x30', 'sku' => 'STK-GLS-2030-025', 'brand' => null, 'grade_value' => null, 'grade_unit_code' => null, 'width' => 20, 'height' => 30, 'size_unit_code' => 'IN', 'size_label' => '20x30', 'is_placeholder_variant' => true, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Sticker Paper',
                'name' => 'Matte Sticker Paper',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => '20x30', 'sku' => 'STK-MAT-2030-026', 'brand' => null, 'grade_value' => null, 'grade_unit_code' => null, 'width' => 20, 'height' => 30, 'size_unit_code' => 'IN', 'size_label' => '20x30', 'is_placeholder_variant' => true, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Sticker Paper',
                'name' => 'Chromo Sticker Paper',
                'unit' => 'ream',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => '20x30', 'sku' => 'STK-CHR-2030-027', 'brand' => null, 'grade_value' => null, 'grade_unit_code' => null, 'width' => 20, 'height' => 30, 'size_unit_code' => 'IN', 'size_label' => '20x30', 'is_placeholder_variant' => true, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Sticker Paper',
                'name' => 'PVC Sticker Roll White',
                'unit' => 'roll',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Roll', 'sku' => 'STK-PVC-ROLL-028', 'brand' => null, 'grade_value' => null, 'grade_unit_code' => null, 'width' => null, 'height' => null, 'size_unit_code' => null, 'size_label' => 'Roll', 'is_placeholder_variant' => true, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Board',
                'name' => 'Mill Board',
                'unit' => 'bundle',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => '32 OZ / 23x36', 'sku' => 'BRD-MILL-32OZ-029', 'brand' => null, 'grade_value' => 32, 'grade_unit_code' => 'OZ', 'width' => 23, 'height' => 36, 'size_unit_code' => 'IN', 'size_label' => '23x36', 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'category' => 'Board',
                'name' => 'Hard Board',
                'unit' => 'bundle',
                'status' => RecordStatus::Active,
                'variants' => [
                    ['variant_name' => 'Sonali / 120 GSM', 'sku' => 'BRD-HARD-SON-120-030', 'brand' => 'Sonali', 'grade_value' => 120, 'grade_unit_code' => 'GSM', 'width' => null, 'height' => null, 'size_unit_code' => null, 'size_label' => null, 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                    ['variant_name' => 'Century / 140 GSM', 'sku' => 'BRD-HARD-CEN-140-031', 'brand' => 'Century', 'grade_value' => 140, 'grade_unit_code' => 'GSM', 'width' => null, 'height' => null, 'size_unit_code' => null, 'size_label' => null, 'is_placeholder_variant' => false, 'status' => RecordStatus::Active],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::query()->updateOrCreate(
                [
                    'business_id' => $business->id,
                    'product_category_id' => $categories->get($productData['category'])->id,
                    'name' => $productData['name'],
                ],
                [
                    'base_unit_of_measurement_id' => $units->get($productData['unit'])->id,
                    'status' => $productData['status'],
                ]
            );

            foreach ($productData['variants'] as $variantData) {
                $product->productVariants()->updateOrCreate(
                    [
                        'sku' => $variantData['sku'],
                    ],
                    [
                        'variant_name' => $variantData['variant_name'],
                        'brand_id' => $variantData['brand'] === null
                            ? null
                            : $brands->get($variantData['brand'])?->id,
                        'grade_value' => $variantData['grade_value'],
                        'grade_unit_id' => $variantData['grade_unit_code'] === null
                            ? null
                            : $gradeUnits->get($variantData['grade_unit_code'])?->id,
                        'width' => $variantData['width'],
                        'height' => $variantData['height'],
                        'size_unit_id' => $variantData['size_unit_code'] === null
                            ? null
                            : $sizeUnits->get($variantData['size_unit_code'])?->id,
                        'size_label' => $variantData['size_label'],
                        'is_placeholder_variant' => $variantData['is_placeholder_variant'],
                        'status' => $variantData['status'],
                    ]
                );
            }

            $product->unitConversions()->updateOrCreate(
                [
                    'unit_of_measurement_id' => $product->base_unit_of_measurement_id,
                ],
                [
                    'conversion_factor_to_base' => 1,
                    'is_base_unit' => true,
                    'is_default_purchase_unit' => $product->name !== 'A4 Copy Paper',
                    'is_default_sale_unit' => true,
                    'status' => RecordStatus::Active,
                ]
            );
        }
    }
}
