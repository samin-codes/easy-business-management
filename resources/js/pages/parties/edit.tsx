import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { edit, index } from '@/routes/parties';
import type { BreadcrumbItem, Option, Party } from '@/types';
import PartyForm from './components/form';

export default function PartiesEdit({
    party,
    partyTypeOptions,
    openingBalanceTypeOptions,
    areaTypeOptions,
    statusOptions,
}: {
    party: Party;
    partyTypeOptions: Option[];
    openingBalanceTypeOptions: Option[];
    areaTypeOptions: Option[];
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
        { title: 'Parties', href: index({ query: queryString }).url },
        { title: 'Edit', href: edit(party.id).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Party" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Edit Party" className="mb-8" />

                    <PartyForm
                        party={party}
                        partyTypeOptions={partyTypeOptions}
                        openingBalanceTypeOptions={openingBalanceTypeOptions}
                        areaTypeOptions={areaTypeOptions}
                        statusOptions={statusOptions}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
