import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { edit, index } from '@/routes/products';
import type { BreadcrumbItem, Option } from '@/types';
import ProductVariantsSection from './components/product-variants-section';
import UnitConversionsSection from './components/unit-conversions-section';
import ProductForm from './components/form';
import type {
    Brand,
    Product,
    ProductCategory,
    ProductGradeUnit,
    ProductSizeUnit,
    UnitOfMeasurement,
} from './types';
import { Separator } from '@/components/ui/separator';

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
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: index().url },
        { title: 'Edit', href: edit(product.id).url },
    ];

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

                    <ProductVariantsSection
                        product={product}
                        brands={brands}
                        productGradeUnits={productGradeUnits}
                        productSizeUnits={productSizeUnits}
                        statusOptions={statusOptions}
                    />

                    <Separator />

                    <UnitConversionsSection
                        product={product}
                        unitOfMeasurements={unitOfMeasurements}
                        statusOptions={statusOptions}
                    />

                </div>
            </div>
        </AppLayout>
    );
}
