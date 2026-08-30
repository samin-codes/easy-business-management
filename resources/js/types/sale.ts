import type { User } from './auth';
import type { Business } from './business';
import type {
    PaymentMethod,
    SalePaymentStatus,
    SaleStatus,
} from './enums';
import type { Outlet } from './outlet';
import type { Party } from './party';
import type {
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './product';

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
    payment_status: SalePaymentStatus;
    status: SaleStatus;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    payment_status_label: string | null;
    status_label: string | null;

    business?: Business;
    outlet?: Outlet;
    customer?: Party;
    createdBy?: User;
    items?: SaleItem[];
    payments?: SalePayment[];
};

export type SaleItem = {
    id: number;
    sale_id: number;
    product_variant_id: number;
    unit_of_measurement_id: number;
    product_unit_conversion_id: number;
    quantity: string;
    base_quantity: string;
    unit_price: string;
    base_unit_price: string;
    line_total: string;
    inventory_unit_cost: string;
    inventory_total_cost: string;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    sale?: Sale;
    product_variant?: ProductVariant;
    unit_of_measurement?: UnitOfMeasurement;
    product_unit_conversion?: ProductUnitConversion;
};

export type SalePayment = {
    id: number;
    business_id: number;
    sale_id: number;
    customer_party_id: number;
    created_by_id: number;
    payment_date: string;
    amount: string;
    payment_method: PaymentMethod;
    reference_no: string | null;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;

    business?: Business;
    sale?: Sale;
    customer?: Party;
    createdBy?: User;
};
