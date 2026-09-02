import type { Business } from './business';
import type {
    RecordStatus,
    UnitOfMeasurementType,
} from './enums';

export type Brand = {
    id: number;
    name: string;
    status: RecordStatus;
};

export type UnitOfMeasurement = {
    id: number;
    name: string;
    code: string;
    type: UnitOfMeasurementType | null;
    status: RecordStatus;
};

export type ProductCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    status: RecordStatus;

    status_label: string | null;

    business?: Pick<Business, 'id' | 'name'>;
};

export type ProductGradeUnit = {
    id: number;
    name: string;
    code: string;
    symbol: string;
    status: RecordStatus;
};

export type ProductSizeUnit = {
    id: number;
    name: string;
    code: string;
    symbol: string;
    status: RecordStatus;
};

export type ProductUnitConversion = {
    id: number;
    product_id: number;
    unit_of_measurement_id: number;
    conversion_factor_to_base: string;
    is_base_unit: boolean;
    is_default_purchase_unit: boolean;
    is_default_sale_unit: boolean;
    status: RecordStatus;

    conversion_unit_quantity: string;
    base_unit_quantity: string;
    status_label: string;

    product?: Pick<Product, 'id' | 'name'>;
    unit_of_measurement?: UnitOfMeasurement;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    variant_name: string;
    sku: string | null;
    brand_id: number | null;
    grade_value: string | null;
    grade_unit_id: number | null;
    width: number | null;
    height: number | null;
    size_unit_id: number | null;
    size_label: string | null;
    is_placeholder_variant: boolean;
    status: RecordStatus;

    purchase_label: string;
    status_label: string;

    available_quantity?: string;
    average_cost?: string;
    has_inventory_history?: boolean;

    product?: Pick<Product, 'id' | 'name'>;
    brand?: Brand | null;
    grade_unit?: ProductGradeUnit | null;
    size_unit?: ProductSizeUnit | null;
};

export type Product = {
    id: number;
    business_id: number;
    product_category_id: number;
    name: string;
    base_unit_of_measurement_id: number;
    status: RecordStatus;

    status_label: string | null;

    business?: Pick<Business, 'id' | 'name'>;
    category?: ProductCategory;
    base_unit_of_measurement?: UnitOfMeasurement;

    product_variants?: ProductVariant[];

    unit_conversions?: ProductUnitConversion[];
    active_unit_conversions?: ProductUnitConversion[];

    base_unit_conversion?: ProductUnitConversion | null;
    default_purchase_unit_conversion?: ProductUnitConversion | null;
    default_sale_unit_conversion?: ProductUnitConversion | null;
};
