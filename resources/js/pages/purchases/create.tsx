import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/purchases';
import type { BreadcrumbItem } from '@/types';
import PurchaseForm from './components/form';
import type { Outlet, Product, Supplier } from './types';

export default function PurchasesCreate({
    outlets,
    suppliers,
    products,
}: {
    outlets: Outlet[];
    suppliers: Supplier[];
    products: Product[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: 'Create', href: create().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <Heading title="Create Purchase" className="mb-8" />

                    <PurchaseForm outlets={outlets} suppliers={suppliers} products={products} cancelHref={index().url} />
                </div>
            </div>
        </AppLayout>
    );
}
