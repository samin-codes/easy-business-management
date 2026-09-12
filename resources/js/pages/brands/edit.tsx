import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { edit, index } from '@/routes/brands';
import type { Brand, BreadcrumbItem, Option } from '@/types';
import BrandForm from './components/form';

export default function Edit({ brand, statusOptions }: { brand: Brand; statusOptions: Option[] }) {
    const {
        url,
        props: { flash },
    } = usePage<{ flash: { status?: string } }>();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const queryString = {
        page: params.get('page'),
        search: params.get('search'),
        sort: params.get('sort'),
        direction: params.get('direction'),
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Brands', href: index({ query: queryString }).url },
        { title: 'Edit', href: edit(brand.id, { query: queryString }).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Brand" />
            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Edit Brand" />
                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}
                    <BrandForm key={brand.id} brand={brand} statusOptions={statusOptions} />
                </div>
            </div>
        </AppLayout>
    );
}
