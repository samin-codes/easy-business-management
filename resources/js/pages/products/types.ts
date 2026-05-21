type Business = {
    id: number;
    name: string;
};

type ProductCategory = {
    id: number;
    business_id: number;
    name: string;
    business?: Business;
};

type UnitOfMeasurement = {
    id: number;
    name: string;
    code: string;
};

type Brand = {
    id: number;
    name: string;
};

type ProductGradeUnit = {
    id: number;
    name: string;
    code: string;
    symbol: string;
};

type ProductSizeUnit = {
    id: number;
    name: string;
    code: string;
    symbol: string;
};

type ProductVariant = {
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
    status: string;
    status_label: string;
    brand?: Brand | null;
    grade_unit?: ProductGradeUnit | null;
    size_unit?: ProductSizeUnit | null;
};

type ProductUnitConversion = {
    id: number;
    product_id: number;
    unit_of_measurement_id: number;
    conversion_factor_to_base: string;
    conversion_unit_quantity: string;
    base_unit_quantity: string;
    is_base_unit: boolean;
    is_default_purchase_unit: boolean;
    is_default_sale_unit: boolean;
    status: string;
    status_label: string;
    unit_of_measurement: UnitOfMeasurement;
};

type Product = {
    id: number;
    business_id: number;
    product_category_id: number;
    name: string;
    base_unit_of_measurement_id: number;
    status: string;
    status_label: string | null;
    business: Business;
    category: ProductCategory;
    base_unit_of_measurement: UnitOfMeasurement;
    product_variants?: ProductVariant[];
    unit_conversions?: ProductUnitConversion[];
};

export type {
    Brand,
    Business,
    Product,
    ProductCategory,
    ProductGradeUnit,
    ProductSizeUnit,
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
};
