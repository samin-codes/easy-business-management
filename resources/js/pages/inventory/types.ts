export type Outlet = {
    id: number;
    name: string;
    code: string;
};

export type Category = {
    id: number;
    name: string;
};

export type UnitOfMeasurement = {
    id: number;
    name: string;
    code: string;
};

export type Stock = {
    id: number;
    product_id: number;
    label: string;
    product_name: string;
    variant_name: string;
    sku: string | null;
    brand_name: string | null;
    is_placeholder_variant: boolean;
    status: string;
    product_status: string;
    category: Category;
    base_unit: UnitOfMeasurement;
    quantity: string;
    average_cost: string;
    stock_value: string;
    last_movement_at: string | null;
};

export type InventoryVariant = {
    id: number;
    label: string;
    product_name: string;
    variant_name: string;
    sku: string | null;
    brand_name: string | null;
    is_placeholder_variant: boolean;
    status: string;
    category: Category;
    base_unit: UnitOfMeasurement;
};

export type StockBalance = {
    quantity: string;
    average_cost: string;
    stock_value: string;
    last_movement_at: string | null;
};

export type MovementSource = {
    type: string;
    label: string;
    href: string | null;
};

export type StockMovement = {
    id: number;
    transaction_date: string;
    transaction_type: string;
    transaction_type_label: string;
    direction: 'in' | 'out';
    entered_quantity: string;
    base_quantity: string;
    unit_cost: string | null;
    total_cost: string | null;
    unit: UnitOfMeasurement;
    outlet: Outlet;
    source: MovementSource | null;
    note: string | null;
};
