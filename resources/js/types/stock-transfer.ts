import type { User } from './auth';
import type { Business } from './business';
import type { Outlet } from './outlet';
import type {
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './product';

export type StockTransfer = {
    id: number;
    business_id: number;
    source_outlet_id: number;
    destination_outlet_id: number;
    created_by_id: number;
    transfer_no: string;
    transfer_date: string;
    total_value: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    items_count?: number;
    can_delete?: boolean;

    business?: Business;
    source_outlet?: Outlet;
    destination_outlet?: Outlet;
    createdBy?: User;
    items?: StockTransferItem[];
};

export type StockTransferItem = {
    id: number;
    stock_transfer_id: number;
    product_variant_id: number;
    unit_of_measurement_id: number;
    product_unit_conversion_id: number | null;
    quantity: string;
    base_quantity: string;
    inventory_unit_cost: string;
    inventory_total_cost: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    stock_transfer?: StockTransfer;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion | null;
};
