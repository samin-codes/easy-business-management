import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { show as businessShow } from '@/routes/business';
import { create } from '@/routes/businesses/outlets';
import type { BreadcrumbItem, Option } from '@/types';
import OutletForm from './components/form';
import type { Business } from './types';

export default function OutletsCreate({
    business,
    outletTypeOptions,
    statusOptions,
    areaTypeOptions,
}: {
    business: Business;
    outletTypeOptions: Option[];
    statusOptions: Option[];
    areaTypeOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Business', href: businessShow().url },
        {
            title: 'Create Outlet',
            href: create(business.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Outlet" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Create Outlet" className="mb-8" />

                    <OutletForm
                        business={business}
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
