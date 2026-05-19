import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { show as businessShow } from '@/routes/business';
import { edit } from '@/routes/businesses/outlets';
import type { BreadcrumbItem, Option } from '@/types';
import OutletForm from './components/form';
import type { Business, Outlet } from './types';

export default function OutletsEdit({
    business,
    outlet,
    outletTypeOptions,
    statusOptions,
    areaTypeOptions,
}: {
    business: Business;
    outlet: Outlet;
    outletTypeOptions: Option[];
    statusOptions: Option[];
    areaTypeOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Business', href: businessShow().url },
        {
            title: 'Edit Outlet',
            href: edit({ business, outlet }).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Outlet" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Edit Outlet" className="mb-8" />

                    <OutletForm
                        business={business}
                        outlet={outlet}
                        outletTypeOptions={outletTypeOptions}
                        statusOptions={statusOptions}
                        areaTypeOptions={areaTypeOptions}
                        cancelHref={businessShow().url}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
