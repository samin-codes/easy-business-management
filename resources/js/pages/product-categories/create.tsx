import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/product-categories';
import type { BreadcrumbItem, Option } from '@/types';
import ProductCategoryForm from './components/form';

export default function ProductCategoriesCreate({ statusOptions }: { statusOptions: Option[] }) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const queryString = {
        page: params.get('page'),
        search: params.get('search'),
        sort: params.get('sort'),
        direction: params.get('direction'),
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Categories', href: index({ query: queryString }).url },
        { title: 'Create', href: create().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product Category" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Create Product Category" className="mb-8" />

                    <ProductCategoryForm statusOptions={statusOptions} />
                </div>
            </div>
        </AppLayout>
    );
}
