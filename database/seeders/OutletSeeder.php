<?php

namespace Database\Seeders;

use App\Enums\AreaType;
use App\Enums\OutletType;
use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Outlet;
use Illuminate\Database\Seeder;

class OutletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $business = Business::current();

        $outlets = [
            [
                'name' => 'Arambag Main Shop', 'code' => 'MAIN', 'mobile' => '01700-100001',
                'email' => 'main@arambag-paper.example.test', 'outlet_type' => OutletType::Shop,
                'address_line' => '12/1 Arambag Commercial Area', 'district' => 'Dhaka',
                'area_type' => AreaType::Thana, 'area_name' => 'Motijheel', 'postal_code' => '1000',
                'status' => RecordStatus::Active,
            ],
            [
                'name' => 'Keraniganj Warehouse', 'code' => 'WH01', 'mobile' => '01700-100002',
                'email' => 'warehouse@arambag-paper.example.test', 'outlet_type' => OutletType::Warehouse,
                'address_line' => 'Plot 18, Kaliganj Industrial Lane', 'district' => 'Dhaka',
                'area_type' => AreaType::Upazila, 'area_name' => 'Keraniganj', 'postal_code' => '1310',
                'status' => RecordStatus::Active,
            ],
            [
                'name' => 'Uttara Branch', 'code' => 'UTR', 'mobile' => '01700-100003',
                'email' => 'uttara@arambag-paper.example.test', 'outlet_type' => OutletType::Shop,
                'address_line' => 'Demo House 7, Road 12, Sector 10', 'district' => 'Dhaka',
                'area_type' => AreaType::Thana, 'area_name' => 'Uttara West', 'postal_code' => '1230',
                'status' => RecordStatus::Active,
            ],
        ];

        foreach ($outlets as $outletData) {
            Outlet::query()->updateOrCreate(
                [
                    'business_id' => $business->id,
                    'code' => $outletData['code'],
                ],
                $outletData,
            );
        }
    }
}
