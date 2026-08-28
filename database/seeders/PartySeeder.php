<?php

namespace Database\Seeders;

use App\Enums\AreaType;
use App\Enums\OpeningBalanceType;
use App\Enums\PartyType;
use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Party;
use Illuminate\Database\Seeder;

class PartySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $business = Business::current();

        $parties = [
            [
                'name' => 'Bengal Paper Mills', 'trade_name' => 'Bengal Paper Mills Ltd.', 'mobile' => '01700-200001', 'email' => 'bengal@example.test',
                'party_type' => PartyType::Supplier, 'address_line' => 'Demo premises, Rupganj', 'district' => 'Narayanganj', 'area_type' => AreaType::Upazila,
                'area_name' => 'Rupganj', 'postal_code' => '1400', 'opening_balance' => 85000, 'opening_balance_type' => OpeningBalanceType::Payable,
                'credit_limit' => null, 'status' => RecordStatus::Active,
                'contacts' => [
                    ['name' => 'Mahmud Hasan', 'designation' => 'General Manager', 'mobile' => '01800-210001', 'email' => null, 'is_primary' => true, 'note' => 'Coordinates mill allocations.', 'status' => RecordStatus::Active],
                    ['name' => 'Farzana Rahman', 'designation' => 'Accounts', 'mobile' => '01800-210002', 'email' => null, 'is_primary' => false, 'note' => null, 'status' => RecordStatus::Active],
                    ['name' => 'Imran Kabir', 'designation' => 'Sales', 'mobile' => '01800-210003', 'email' => null, 'is_primary' => false, 'note' => null, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'name' => 'Metro Paper & Board Traders', 'trade_name' => 'Metro Paper & Board', 'mobile' => '01700-200002', 'email' => 'metro@example.test',
                'party_type' => PartyType::Supplier, 'address_line' => 'Demo premises, Bangshal', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Bangshal', 'postal_code' => '1000', 'opening_balance' => 42500, 'opening_balance_type' => OpeningBalanceType::Payable,
                'credit_limit' => null, 'status' => RecordStatus::Active,
                'contacts' => [
                    ['name' => 'Shafiq Ahmed', 'designation' => 'Owner', 'mobile' => '01800-210004', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active],
                    ['name' => 'Tania Sultana', 'designation' => 'Accounts', 'mobile' => '01800-210005', 'email' => null, 'is_primary' => false, 'note' => null, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'name' => 'Eastern Paper Imports', 'trade_name' => 'Eastern Paper Imports', 'mobile' => '01700-200003', 'email' => 'eastern@example.test',
                'party_type' => PartyType::Supplier, 'address_line' => 'Demo premises, Double Mooring', 'district' => 'Chattogram', 'area_type' => AreaType::Thana,
                'area_name' => 'Double Mooring', 'postal_code' => '1400', 'opening_balance' => 0, 'opening_balance_type' => OpeningBalanceType::None,
                'credit_limit' => null, 'status' => RecordStatus::Active,
                'contacts' => [
                    ['name' => 'Rezaul Karim', 'designation' => 'Import Manager', 'mobile' => '01800-210006', 'email' => null, 'is_primary' => true, 'note' => 'Handles imported copy-paper consignments.', 'status' => RecordStatus::Active],
                ],
            ],
            [
                'name' => 'Padma Paper Depot', 'trade_name' => 'Padma Paper Depot', 'mobile' => '01700-200004', 'email' => 'padma@example.test',
                'party_type' => PartyType::Supplier, 'address_line' => 'Demo premises, Chawkbazar', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Chawkbazar', 'postal_code' => '1000', 'opening_balance' => 18000, 'opening_balance_type' => OpeningBalanceType::Payable,
                'credit_limit' => null, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Mizanur Rahman', 'designation' => 'Owner', 'mobile' => '01800-210007', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'Meghna Board Supply', 'trade_name' => 'Meghna Board Supply', 'mobile' => '01700-200005', 'email' => 'meghna@example.test',
                'party_type' => PartyType::Supplier, 'address_line' => 'Demo premises, Tongi', 'district' => 'Gazipur', 'area_type' => AreaType::Upazila,
                'area_name' => 'Tongi', 'postal_code' => '1400', 'opening_balance' => 0, 'opening_balance_type' => OpeningBalanceType::None,
                'credit_limit' => null, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Nusrat Jahan', 'designation' => 'Sales Manager', 'mobile' => '01800-210008', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'City Print & Packaging', 'trade_name' => 'City Print', 'mobile' => '01700-200006', 'email' => 'cityprint@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Paltan', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Paltan', 'postal_code' => '1000', 'opening_balance' => 55000, 'opening_balance_type' => OpeningBalanceType::Receivable,
                'credit_limit' => 300000, 'status' => RecordStatus::Active,
                'contacts' => [
                    ['name' => 'Arif Hossain', 'designation' => 'Managing Director', 'mobile' => '01800-210009', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active],
                    ['name' => 'Sabina Yasmin', 'designation' => 'Procurement', 'mobile' => '01800-210010', 'email' => null, 'is_primary' => false, 'note' => 'Prefers delivery confirmation by phone.', 'status' => RecordStatus::Active],
                ],
            ],
            [
                'name' => 'Green Leaf Press', 'trade_name' => 'Green Leaf Press', 'mobile' => '01700-200007', 'email' => 'greenleaf@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Nilkhet', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Nilkhet', 'postal_code' => '1000', 'opening_balance' => 0, 'opening_balance_type' => OpeningBalanceType::None,
                'credit_limit' => 120000, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Rashedul Alam', 'designation' => 'Owner', 'mobile' => '01800-210011', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'Classic Publications', 'trade_name' => 'Classic Publications', 'mobile' => '01700-200008', 'email' => 'classic@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Banglabazar', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Banglabazar', 'postal_code' => '1000', 'opening_balance' => 32000, 'opening_balance_type' => OpeningBalanceType::Receivable,
                'credit_limit' => 220000, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Nafisa Islam', 'designation' => 'Accounts Manager', 'mobile' => '01800-210012', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'Nova Packaging', 'trade_name' => 'Nova Packaging Works', 'mobile' => '01700-200009', 'email' => 'nova@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Fatullah', 'district' => 'Narayanganj', 'area_type' => AreaType::Upazila,
                'area_name' => 'Fatullah', 'postal_code' => '1400', 'opening_balance' => 0, 'opening_balance_type' => OpeningBalanceType::None,
                'credit_limit' => 400000, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Tanvir Chowdhury', 'designation' => 'Procurement Manager', 'mobile' => '01800-210013', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'Dhaka Stationery Wholesale', 'trade_name' => 'Dhaka Stationery', 'mobile' => '01700-200010', 'email' => 'stationery@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Motijheel', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Motijheel', 'postal_code' => '1000', 'opening_balance' => 75000, 'opening_balance_type' => OpeningBalanceType::Receivable,
                'credit_limit' => 250000, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Kamrul Ahsan', 'designation' => 'Owner', 'mobile' => '01800-210014', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'Pixel Print House', 'trade_name' => 'Pixel Print House', 'mobile' => '01700-200011', 'email' => 'pixel@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Dhanmondi', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Dhanmondi', 'postal_code' => '1000', 'opening_balance' => 12500, 'opening_balance_type' => OpeningBalanceType::Receivable,
                'credit_limit' => 100000, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Sharmin Akter', 'designation' => 'Operations Manager', 'mobile' => '01800-210015', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active]],
            ],
            [
                'name' => 'Uttara Digital Press', 'trade_name' => 'Uttara Digital Press', 'mobile' => '01700-200012', 'email' => 'uttarapress@example.test',
                'party_type' => PartyType::Customer, 'address_line' => 'Demo premises, Uttara East', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Uttara East', 'postal_code' => '1000', 'opening_balance' => 0, 'opening_balance_type' => OpeningBalanceType::None,
                'credit_limit' => 50000, 'status' => RecordStatus::Inactive, 'contacts' => [],
            ],
            [
                'name' => 'Sonar Bangla Paper & Packaging', 'trade_name' => 'Sonar Bangla Packaging', 'mobile' => '01700-200013', 'email' => 'sonarbangla@example.test',
                'party_type' => PartyType::Both, 'address_line' => 'Demo premises, Tejgaon', 'district' => 'Dhaka', 'area_type' => AreaType::Thana,
                'area_name' => 'Tejgaon', 'postal_code' => '1000', 'opening_balance' => 25000, 'opening_balance_type' => OpeningBalanceType::Payable,
                'credit_limit' => 350000, 'status' => RecordStatus::Active,
                'contacts' => [
                    ['name' => 'Sajjad Hossain', 'designation' => 'Director', 'mobile' => '01800-210016', 'email' => null, 'is_primary' => true, 'note' => null, 'status' => RecordStatus::Active],
                    ['name' => 'Maliha Noor', 'designation' => 'Accounts', 'mobile' => '01800-210017', 'email' => null, 'is_primary' => false, 'note' => null, 'status' => RecordStatus::Active],
                ],
            ],
            [
                'name' => 'Buriganga Print Materials', 'trade_name' => 'Buriganga Print Materials', 'mobile' => '01700-200014', 'email' => 'buriganga@example.test',
                'party_type' => PartyType::Both, 'address_line' => 'Demo premises, Keraniganj', 'district' => 'Dhaka', 'area_type' => AreaType::Upazila,
                'area_name' => 'Keraniganj', 'postal_code' => '1000', 'opening_balance' => 15000, 'opening_balance_type' => OpeningBalanceType::Receivable,
                'credit_limit' => 180000, 'status' => RecordStatus::Active,
                'contacts' => [['name' => 'Omar Faruk', 'designation' => 'Owner', 'mobile' => '01800-210018', 'email' => null, 'is_primary' => true, 'note' => 'Coordinates warehouse pickup orders.', 'status' => RecordStatus::Active]],
            ],
        ];

        foreach ($parties as $partyData) {
            $contacts = $partyData['contacts'];
            unset($partyData['contacts']);

            $party = Party::query()->updateOrCreate(
                ['business_id' => $business->id, 'mobile' => $partyData['mobile']],
                $partyData,
            );

            $party->contactPersons()->update(['is_primary' => false]);

            foreach ($contacts as $contactData) {
                $party->contactPersons()->updateOrCreate(
                    ['mobile' => $contactData['mobile']],
                    $contactData,
                );
            }
        }
    }
}
