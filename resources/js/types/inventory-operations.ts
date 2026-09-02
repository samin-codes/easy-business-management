import type { User } from './auth';
import type { Business } from './business';
import type { StockAdjustmentReason, StockAdjustmentType } from './enums';
import type { Outlet } from './outlet';
import type { ProductUnitConversion, ProductVariant, UnitOfMeasurement } from './product';

type InventoryOperationItemRelations = {
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion | null;
};

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
    business?: Business;
    outlet?: Outlet;
    created_by?: User;
    items?: OpeningStockItem[];
};

export type OpeningStockItem = InventoryOperationItemRelations & {
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
};

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
    business?: Business;
    outlet?: Outlet;
    created_by?: User;
    items?: StockAdjustmentItem[];
};

export type StockAdjustmentItem = InventoryOperationItemRelations & {
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
};

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
    business?: Business;
    source_outlet?: Outlet;
    destination_outlet?: Outlet;
    created_by?: User;
    items?: StockTransferItem[];
};

export type StockTransferItem = InventoryOperationItemRelations & {
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
};
