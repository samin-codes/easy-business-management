import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/parties';
import type { BreadcrumbItem, Option } from '@/types';
import PartyForm from './components/form';

export default function PartiesCreate({
    partyTypeOptions,
    openingBalanceTypeOptions,
    areaTypeOptions,
    statusOptions,
}: {
    partyTypeOptions: Option[];
    openingBalanceTypeOptions: Option[];
    areaTypeOptions: Option[];
    statusOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Parties', href: index().url },
        { title: 'Create', href: create().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Party" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Create Party" className="mb-8" />

                    <PartyForm
                        partyTypeOptions={partyTypeOptions}
                        openingBalanceTypeOptions={openingBalanceTypeOptions}
                        areaTypeOptions={areaTypeOptions}
                        statusOptions={statusOptions}
                        cancelHref={index().url}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
