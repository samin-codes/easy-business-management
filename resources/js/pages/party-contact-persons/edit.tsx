import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { show as partyShow } from '@/routes/parties';
import { edit } from '@/routes/parties/party-contact-persons';
import type { BreadcrumbItem, Option, Party, PartyContactPerson } from '@/types';
import PartyContactPersonForm from './components/form';

export default function PartyContactPersonsEdit({
    party,
    partyContactPerson,
    statusOptions,
}: {
    party: Party;
    partyContactPerson: PartyContactPerson;
    statusOptions: Option[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Parties', href: partyShow(party.id).url },
        {
            title: party.name,
            href: partyShow(party.id).url,
        },
        {
            title: 'Edit Contact Person',
            href: edit({
                party,
                party_contact_person: partyContactPerson.id,
            }).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Contact Person" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Heading title="Edit Contact Person" className="mb-8" />

                    <PartyContactPersonForm
                        party={party}
                        partyContactPerson={partyContactPerson}
                        statusOptions={statusOptions}
                        cancelHref={partyShow(party.id).url}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
