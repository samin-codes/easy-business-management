import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { show as partyShow } from '@/routes/parties';
import { create } from '@/routes/parties/party-contact-persons';
import type { BreadcrumbItem, Option, Party } from '@/types';
import PartyContactPersonForm from './components/form';

export default function PartyContactPersonsCreate({ party, statusOptions }: { party: Party; statusOptions: Option[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Parties', href: partyShow(party.id).url },
        {
            title: party.name,
            href: partyShow(party.id).url,
        },
        {
            title: 'Create Contact Person',
            href: create(party.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Contact Person" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Create Contact Person" className="mb-8" />

                    <PartyContactPersonForm party={party} statusOptions={statusOptions} cancelHref={partyShow(party.id).url} />
                </div>
            </div>
        </AppLayout>
    );
}
