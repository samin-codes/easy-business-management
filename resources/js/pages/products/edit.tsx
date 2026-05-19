import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { edit, index } from '@/routes/products';
import type { BreadcrumbItem, Option } from '@/types';
import ProductForm from './components/form';
import ProductVariantDialog from './components/product-variant-dialog';
import ProductVariantsSection from './components/product-variants-section';
import UnitConversionDialog from './components/unit-conversion-dialog';
import UnitConversionsSection from './components/unit-conversions-section';
import type {
    Brand,
    Product,
    ProductCategory,
    ProductGradeUnit,
    ProductSizeUnit,
    ProductUnitConversion,
    ProductVariant,
    UnitOfMeasurement,
} from './types';

export default function ProductsEdit({
    product,
    brands,
    productGradeUnits,
    productSizeUnits,
    productCategories,
    unitOfMeasurements,
    statusOptions,
}: {
    product: Product;
    brands: Brand[];
    productGradeUnits: ProductGradeUnit[];
    productSizeUnits: ProductSizeUnit[];
    productCategories: ProductCategory[];
    unitOfMeasurements: UnitOfMeasurement[];
    statusOptions: Option[];
}) {
    const [isProductVariantDialogOpen, setIsProductVariantDialogOpen] = useState(false);
    const [selectedProductVariant, setSelectedProductVariant] = useState<ProductVariant | null>(null);
    const [isUnitConversionDialogOpen, setIsUnitConversionDialogOpen] = useState(false);
    const [selectedUnitConversion, setSelectedUnitConversion] = useState<ProductUnitConversion | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: index().url },
        { title: 'Edit', href: edit(product.id).url },
    ];

    const unitConversions = product.unit_conversions ?? [];

    const getAvailableUnits = (currentUnitOfMeasurementId?: number): UnitOfMeasurement[] => {
        const usedUnitIds = new Set(unitConversions.map((unitConversion) => unitConversion.unit_of_measurement_id));

        return unitOfMeasurements.filter(
            (unitOfMeasurement) => unitOfMeasurement.id === currentUnitOfMeasurementId || !usedUnitIds.has(unitOfMeasurement.id),
        );
    };

    const handleCreateProductVariant = () => {
        setSelectedProductVariant(null);
        setIsProductVariantDialogOpen(true);
    };

    const handleEditProductVariant = (productVariant: ProductVariant) => {
        setSelectedProductVariant(productVariant);
        setIsProductVariantDialogOpen(true);
    };

    const handleCloseProductVariantDialog = () => {
        setIsProductVariantDialogOpen(false);
        setSelectedProductVariant(null);
    };

    const handleCreateUnitConversion = () => {
        setSelectedUnitConversion(null);
        setIsUnitConversionDialogOpen(true);
    };

    const handleEditUnitConversion = (unitConversion: ProductUnitConversion) => {
        setSelectedUnitConversion(unitConversion);
        setIsUnitConversionDialogOpen(true);
    };

    const handleCloseUnitConversionDialog = () => {
        setIsUnitConversionDialogOpen(false);
        setSelectedUnitConversion(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-10">
                    <Heading title="Edit Product" className="mb-8" />

                    <ProductForm
                        product={product}
                        productCategories={productCategories}
                        unitOfMeasurements={unitOfMeasurements}
                        statusOptions={statusOptions}
                        cancelHref={index().url}
                    />

                    <Separator />

                    <ProductVariantsSection product={product} onCreate={handleCreateProductVariant} onEdit={handleEditProductVariant} />

                    <Separator />

                    <UnitConversionsSection product={product} onCreate={handleCreateUnitConversion} onEdit={handleEditUnitConversion} />
                </div>
            </div>

            <ProductVariantDialog
                key={selectedProductVariant ? `edit-${selectedProductVariant.id}` : 'create'}
                product={product}
                productVariant={selectedProductVariant}
                brands={brands}
                productGradeUnits={productGradeUnits}
                productSizeUnits={productSizeUnits}
                statusOptions={statusOptions}
                open={isProductVariantDialogOpen}
                onClose={handleCloseProductVariantDialog}
            />

            <UnitConversionDialog
                key={selectedUnitConversion ? `edit-${selectedUnitConversion.id}` : 'create'}
                product={product}
                unitConversion={selectedUnitConversion}
                units={getAvailableUnits(selectedUnitConversion?.unit_of_measurement_id)}
                statusOptions={statusOptions}
                open={isUnitConversionDialogOpen}
                onClose={handleCloseUnitConversionDialog}
            />
        </AppLayout>
    );
}
