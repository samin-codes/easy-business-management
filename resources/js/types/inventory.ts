import type { Business } from './business';
import type { ProductStockLedgerTransactionType } from './enums';
import type { Outlet } from './outlet';
import type {
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './product';

export type ProductStock = {
    id: number;
    business_id: number;
    outlet_id: number;
    product_variant_id: number;
    quantity: string;
    average_cost: string;
    stock_value: string;
    last_movement_at: string | null;
    created_at: string | null;
    updated_at: string | null;

    business?: Business;
    outlet?: Outlet;
    product_variant?: ProductVariant;
};

export type ProductStockLedger = {
    id: number;
    business_id: number;
    outlet_id: number;
    product_variant_id: number;
    transaction_type: ProductStockLedgerTransactionType;
    quantity_in: string;
    quantity_out: string;
    unit_of_measurement_id: number;
    product_unit_conversion_id: number | null;
    base_quantity: string;
    unit_cost: string | null;
    total_cost: string | null;
    source_type: string | null;
    source_id: number | null;
    transaction_date: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    business?: Business;
    outlet?: Outlet;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion | null;
};
