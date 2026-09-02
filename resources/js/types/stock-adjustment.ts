import type { User } from './auth';
import type { Business } from './business';
import type {
    StockAdjustmentReason,
    StockAdjustmentType,
} from './enums';
import type { Outlet } from './outlet';
import type {
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './product';

export type StockAdjustment = {
    id: number;
    business_id: number;
    outlet_id: number;
    created_by_id: number;
    adjustment_no: string;
    adjustment_date: string;
    type: StockAdjustmentType;
    reason: StockAdjustmentReason;
    total_value: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    type_label: string | null;
    reason_label: string | null;

    items_count?: number;
    can_delete?: boolean;

    business?: Business;
    outlet?: Outlet;
    createdBy?: User;
    items?: StockAdjustmentItem[];
};

export type StockAdjustmentItem = {
    id: number;
    stock_adjustment_id: number;
    product_variant_id: number;
    unit_of_measurement_id: number;
    product_unit_conversion_id: number | null;
    quantity: string;
    base_quantity: string;
    unit_cost: string | null;
    inventory_unit_cost: string;
    inventory_total_cost: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    stock_adjustment?: StockAdjustment;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion | null;
};
