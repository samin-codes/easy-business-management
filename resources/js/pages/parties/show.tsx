import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import PartyContactPersonController from '@/actions/App/Http/Controllers/PartyContactPersonController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index as partyIndex, edit as partyEdit, show as partyShow } from '@/routes/parties';
import { create as contactPersonCreate, edit as contactPersonEdit } from '@/routes/parties/party-contact-persons';
import type { BreadcrumbItem, Party, PartyContactPerson } from '@/types';

type TextEntryColor = 'gray' | 'blue' | 'success' | 'danger' | 'warning';

const openingBalanceTypeColors: Record<string, TextEntryColor> = {
    receivable: 'success',
    payable: 'danger',
    none: 'gray',
};

export default function PartiesShow({ party }: { party: Party }) {
    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const openingBalanceTypeColor = openingBalanceTypeColors[party.opening_balance_type] ?? 'gray';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Parties', href: partyIndex().url },
        { title: party.name, href: partyShow(party.id).url },
    ];

    const contactPersons = party.contact_persons ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={party.name} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading title={party.name} />

                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={partyEdit(party.id).url}>
                                    <Pencil className="size-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {flash.status}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <div className="mb-3 text-base font-medium">Party details</div>
                            <div className="space-y-3">
                                <TextEntry label="Party name" value={party.name} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Trade name" value={party.trade_name} />
                                    <TextEntry label="Party type" value={party.party_type_label} />
                                </div>
                                <TextEntry
                                    label="Status"
                                    value={party.status_label}
                                    badge
                                    color={party.status === 'active' ? 'success' : 'gray'}
                                />
                            </div>
                        </div>

                        <hr className="border-t" />

                        <div>
                            <div className="mb-3 text-base font-medium">Contact</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <TextEntry label="Mobile" value={party.mobile} />
                                <TextEntry label="Email" value={party.email} />
                            </div>
                        </div>

                        <hr className="border-t" />

                        <div>
                            <div className="mb-3 text-base font-medium">Financials</div>
                            <div className="space-y-3">
                                <TextEntry
                                    label="Opening balance type"
                                    value={party.opening_balance_type_label}
                                    badge
                                    color={openingBalanceTypeColor}
                                />
                                {party.opening_balance_type !== 'none' && (
                                    <TextEntry label="Opening balance" value={party.opening_balance} />
                                )}
                                {(party.party_type === 'customer' || party.party_type === 'both') && (
                                    <TextEntry label="Credit limit" value={party.credit_limit} />
                                )}
                            </div>
                        </div>

                        <hr className="border-t" />

                        <div>
                            <div className="mb-3 text-base font-medium">Address</div>
                            <div className="space-y-3">
                                <TextEntry label="Address line" value={party.address_line} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="District" value={party.district} />
                                    <TextEntry label="Postal code" value={party.postal_code} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Area type" value={party.area_type_label} />
                                    <TextEntry label="Area name" value={party.area_name} />
                                </div>
                            </div>
                        </div>

                        <hr className="border-t" />

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-base font-medium">Contact Persons ({contactPersons.length})</div>
                                <Button asChild size="sm">
                                    <Link href={contactPersonCreate(party.id).url}>
                                        <Plus className="size-4" />
                                        New Contact Person
                                    </Link>
                                </Button>
                            </div>

                            {contactPersons.length === 0 ? (
                                <div className="py-4 text-sm text-muted-foreground">No contact persons yet.</div>
                            ) : (
                                <div className="divide-y">
                                    {contactPersons.map((contactPerson) => (
                                        <ContactPersonListItem key={contactPerson.id} party={party} contactPerson={contactPerson} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function ContactPersonListItem({ party, contactPerson }: { party: Party; contactPerson: PartyContactPerson }) {
    return (
        <div className="space-y-2 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{contactPerson.name}</span>
                    {contactPerson.designation && <span className="text-sm text-muted-foreground">({contactPerson.designation})</span>}
                    {contactPerson.is_primary && (
                        <Badge variant="outline" className="border-transparent bg-amber-100 text-amber-800">
                            Primary
                        </Badge>
                    )}
                </div>
                <Badge
                    variant="outline"
                    className={
                        contactPerson.status === 'active'
                            ? 'border-transparent bg-blue-100 text-blue-800'
                            : 'border-transparent bg-gray-300 text-gray-800'
                    }
                >
                    {contactPerson.status_label ?? '-'}
                </Badge>
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
                {contactPerson.mobile && <span>Mobile: {contactPerson.mobile}</span>}
                {contactPerson.email && <span>Email: {contactPerson.email}</span>}
            </div>

            {contactPerson.note && <div className="text-sm text-muted-foreground">Note: {contactPerson.note}</div>}

            <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                    <Link
                        href={
                            contactPersonEdit({
                                party,
                                party_contact_person: contactPerson.id,
                            }).url
                        }
                    >
                        <Pencil className="size-4" />
                        Edit
                    </Link>
                </Button>

                <Form
                    action={PartyContactPersonController.destroy({
                        party,
                        party_contact_person: contactPerson.id,
                    })}
                    options={{ preserveScroll: true }}
                    onBefore={() => window.confirm(`Delete the contact person "${contactPerson.name}" from this party?`)}
                >
                    {({ processing }) => (
                        <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            disabled={processing}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    )}
                </Form>
            </div>
        </div>
    );
}

function TextEntry({
    label,
    value,
    badge = false,
    color = 'gray',
}: {
    label: string;
    value: string | null | undefined;
    badge?: boolean;
    color?: TextEntryColor;
}) {
    const colorClasses: Record<string, string> = {
        gray: 'border-transparent bg-gray-100 text-gray-800',
        blue: 'border-transparent bg-blue-100 text-blue-800',
        success: 'border-transparent bg-emerald-100 text-emerald-800',
        danger: 'border-transparent bg-red-100 text-red-800',
        warning: 'border-transparent bg-amber-100 text-amber-800',
    };

    const content = badge ? (
        <Badge variant="outline" className={colorClasses[color]}>
            {value || '-'}
        </Badge>
    ) : (
        value || '-'
    );

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <div className="text-sm text-muted-foreground sm:w-40 sm:shrink-0">{label}</div>
            <div className="text-sm font-medium">{content}</div>
        </div>
    );
}
