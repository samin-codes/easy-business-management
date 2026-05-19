import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { edit, index } from '@/routes/purchases';
import type { BreadcrumbItem, Option } from '@/types';
import PurchaseForm from './components/form';
import type { Outlet, Product, Purchase, Supplier } from './types';

export default function PurchasesEdit({
    purchase,
    outlets,
    suppliers,
    products,
    purchaseStatusOptions,
    purchasePaymentStatusOptions,
}: {
    purchase: Purchase;
    outlets: Outlet[];
    suppliers: Supplier[];
    products: Product[];
    purchaseStatusOptions: Option[];
    purchasePaymentStatusOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: `Edit ${purchase.purchase_no}`, href: edit(purchase.id).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${purchase.purchase_no}`} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <Heading title={`Edit ${purchase.purchase_no}`} className="mb-8" />

                    <PurchaseForm
                        purchase={purchase}
                        outlets={outlets}
                        suppliers={suppliers}
                        products={products}
                        purchaseStatusOptions={purchaseStatusOptions}
                        purchasePaymentStatusOptions={purchasePaymentStatusOptions}
                        cancelHref={index().url}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
