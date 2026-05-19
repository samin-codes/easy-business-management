import type { User } from '@/types';

export type UnitOfMeasurement = {
    id: number;
    name: string;
    code: string;
};

export type Business = {
    id: number;
    name: string;
};

export type Outlet = {
    id: number;
    name: string;
    code?: string;
};

export type Supplier = {
    id: number;
    name: string;
};

export type Brand = {
    id: number;
    name: string;
};

export type ProductUnitConversion = {
    id: number;
    product_id: number;
    unit_of_measurement_id: number;
    conversion_factor_to_base: string;
    is_base_unit: boolean;
    is_default_purchase_unit: boolean;
    is_default_sale_unit: boolean;
    status: string;
    status_label: string;
    unit_of_measurement: UnitOfMeasurement;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    variant_name: string;
    sku: string;
    is_placeholder_variant: boolean;
    status: string;
    purchase_label: string;
    brand?: Brand | null;
    product?: Pick<Product, 'id' | 'name'>;
};

export interface Product {
    id: number;
    name: string;
    base_unit_of_measurement_id: number;
    default_purchase_unit_conversion: ProductUnitConversion | null;
    active_unit_conversions: ProductUnitConversion[];
    product_variants: ProductVariant[];
}

export type PurchaseItem = {
    uid?: string;
    id: number;
    purchase_id: number;
    product_variant_id: number;
    unit_of_measurement_id: number;
    product_unit_conversion_id: number;
    quantity: string;
    base_quantity: string;
    unit_cost: string;
    base_unit_cost: string;
    discount_amount: string;
    line_total: string;
    note?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion;
};

export type PurchaseItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_cost: string;
};

export type PurchaseFormData = {
    purchase_date: string;
    status: string;
    outlet_id: string;
    supplier_party_id: string;
    note: string;
    discount_amount: string;
    transport_cost: string;
    labour_cost: string;
    other_cost: string;
    paid_amount: string;
    items: PurchaseItemFormData[];
};

export type Purchase = {
    id: number;
    business_id: number;
    outlet_id: number;
    supplier_party_id: number;
    user_id: number;
    purchase_no: string;
    purchase_date: string;
    subtotal: string;
    discount_amount: string;
    transport_cost: string;
    labour_cost: string;
    other_cost: string;
    total_amount: string;
    paid_amount: string;
    due_amount: string;
    payment_status: string;
    payment_status_label?: string | null;
    status: string;
    status_label?: string | null;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
    supplier?: Supplier;
    outlet?: Outlet;
    user?: Pick<User, 'id' | 'name'>;
    business?: Business;
    items?: PurchaseItem[];
};
