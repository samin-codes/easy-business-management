import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/products';
import type {
    BreadcrumbItem,
    Option,
    ProductCategory,
    UnitOfMeasurement,
} from '@/types';
import ProductForm from './components/form';

export default function ProductsCreate({
    productCategories,
    unitOfMeasurements,
    statusOptions,
}: {
    productCategories: Pick<ProductCategory, 'id' | 'name'>[];
    unitOfMeasurements: Pick<UnitOfMeasurement, 'id' | 'name'>[];
    statusOptions: Option[];
}) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const queryString = {
        page: params.get('page'),
        search: params.get('search'),
        sort: params.get('sort'),
        direction: params.get('direction'),
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: index({ query: queryString }).url },
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
                    />
                </div>
            </div>
        </AppLayout>
    );
}
