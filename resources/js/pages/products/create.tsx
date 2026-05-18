import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/products';
import type { BreadcrumbItem, Option } from '@/types';
import ProductForm from './components/form';
import type { ProductCategory, UnitOfMeasurement } from './types';

export default function ProductsCreate({
    productCategories,
    unitOfMeasurements,
    statusOptions,
}: {
    productCategories: ProductCategory[];
    unitOfMeasurements: UnitOfMeasurement[];
    statusOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: index().url },
        { title: 'Create', href: create().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Create Product" className="mb-8" />

                    <ProductForm
                        productCategories={productCategories}
                        unitOfMeasurements={unitOfMeasurements}
                        statusOptions={statusOptions}
                        cancelHref={index().url}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
