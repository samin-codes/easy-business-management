import type { User } from './auth';
import type { Business } from './business';
import type { Outlet } from './outlet';
import type {
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './product';

export type OpeningStock = {
    id: number;
    business_id: number;
    outlet_id: number;
    created_by_id: number;
    opening_stock_no: string;
    opening_date: string;
    total_value: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    items_count?: number;
    can_delete?: boolean;

    business?: Business;
    outlet?: Outlet;
    createdBy?: User;
    items?: OpeningStockItem[];
};

export type OpeningStockItem = {
    id: number;
    opening_stock_id: number;
    product_variant_id: number;
    unit_of_measurement_id: number;
    product_unit_conversion_id: number | null;
    quantity: string;
    base_quantity: string;
    unit_cost: string;
    base_unit_cost: string;
    total_cost: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    opening_stock?: OpeningStock;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion | null;
};
