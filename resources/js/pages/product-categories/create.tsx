import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/product-categories';
import type { BreadcrumbItem, Option } from '@/types';
import ProductCategoryForm from './components/form';

export default function ProductCategoriesCreate({ statusOptions }: { statusOptions: Option[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Categories', href: index().url },
        { title: 'Create', href: create().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product Category" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Create Product Category" className="mb-8" />

                    <ProductCategoryForm statusOptions={statusOptions} cancelHref={index().url} />
                </div>
            </div>
        </AppLayout>
    );
}
