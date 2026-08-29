import type { User } from './auth';
import type { Business } from './business';
import type {
    PaymentMethod,
    PurchasePaymentStatus,
    PurchaseStatus,
} from './enums';
import type { Outlet } from './outlet';
import type { Party } from './party';
import type {
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './product';

export type Purchase = {
    id: number;
    business_id: number;
    outlet_id: number;
    supplier_party_id: number;
    created_by_id: number;
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
    payment_status: PurchasePaymentStatus;
    status: PurchaseStatus;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    payment_status_label: string | null;
    status_label: string | null;

    business?: Business;
    outlet?: Outlet;
    supplier?: Party;
    createdBy?: User;
    items?: PurchaseItem[];
    payments?: PurchasePayment[];
};

export type PurchaseItem = {
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
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    purchase?: Purchase;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion;
};

export type PurchasePayment = {
    id: number;
    business_id: number;
    purchase_id: number;
    supplier_party_id: number;
    created_by_id: number;
    payment_date: string;
    amount: string;
    payment_method: PaymentMethod;
    reference_no: string | null;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    business?: Business;
    purchase?: Purchase;
    supplier?: Party;
    createdBy?: User;
};
