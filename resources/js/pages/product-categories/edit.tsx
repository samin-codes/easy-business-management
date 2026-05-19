import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { edit, index } from '@/routes/product-categories';
import type { BreadcrumbItem, Option } from '@/types';
import ProductCategoryForm from './components/form';
import type { ProductCategory } from './types';

export default function ProductCategoriesEdit({
    productCategory,
    statusOptions,
}: {
    productCategory: ProductCategory;
    statusOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Categories', href: index().url },
        { title: 'Edit', href: edit(productCategory.id).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product Category" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Edit Product Category" className="mb-8" />

                    <ProductCategoryForm productCategory={productCategory} statusOptions={statusOptions} cancelHref={index().url} />
                </div>
            </div>
        </AppLayout>
    );
}
