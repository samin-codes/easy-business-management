import type { User } from '@/types';

export type Outlet = { id: number; name: string; code?: string | null };
export type Customer = { id: number; name: string };
export type Unit = { id: number; name: string; code: string };
export type Conversion = {
    id: number;
    product_id: number;
    unit_of_measurement_id: number;
    conversion_factor_to_base: string;
    is_default_sale_unit: boolean;
    status: string;
    unit_of_measurement: Unit;
};
export type Variant = {
    id: number;
    product_id: number;
    variant_name: string;
    sku: string | null;
    purchase_label: string;
    is_placeholder_variant: boolean;
    brand?: { id: number; name: string } | null;
};
export type Product = {
    id: number;
    name: string;
    default_sale_unit_conversion: Conversion | null;
    active_unit_conversions: Conversion[];
    product_variants: Variant[];
};
export type PaymentMethod = { value: string; label: string };
export type PaymentFormData = { payment_date: string; amount: string; payment_method: string; reference_no: string; note: string };
export type SaleItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_price: string;
};
export type SaleFormData = {
    sale_date: string;
    outlet_id: string;
    customer_party_id: string;
    note: string;
    discount_amount: string;
    payment: PaymentFormData;
    items: SaleItemFormData[];
};
export type SaleItem = {
    id: number;
    product_variant_id: number;
    unit_of_measurement_id: number;
    quantity: string;
    base_quantity: string;
    unit_price: string;
    base_unit_price: string;
    line_total: string;
    inventory_unit_cost: string;
    inventory_total_cost: string;
    product_variant?: Variant;
    unit_of_measurement?: Unit;
};
export type SalePayment = {
    id: number;
    payment_date: string;
    amount: string;
    payment_method: string;
    reference_no: string | null;
    note: string | null;
    createdBy?: Pick<User, 'id' | 'name'>;
};
export type Sale = {
    id: number;
    business_id: number;
    outlet_id: number;
    customer_party_id: number;
    created_by_id: number;
    sale_no: string;
    sale_date: string;
    subtotal: string;
    discount_amount: string;
    total_amount: string;
    paid_amount: string;
    due_amount: string;
    payment_status: string;
    payment_status_label?: string | null;
    status: string;
    status_label?: string | null;
    note: string | null;
    customer?: Customer;
    outlet?: Outlet;
    createdBy?: Pick<User, 'id' | 'name'>;
    items: SaleItem[];
    payments?: SalePayment[];
};
