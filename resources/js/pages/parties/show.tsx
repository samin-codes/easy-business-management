import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import PartyContactPersonController from '@/actions/App/Http/Controllers/PartyContactPersonController';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import type { TextEntryColor } from '@/components/text-entry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { index as partyIndex, edit as partyEdit, show as partyShow } from '@/routes/parties';
import { create as contactPersonCreate, edit as contactPersonEdit } from '@/routes/parties/party-contact-persons';
import type { BreadcrumbItem, Party, PartyContactPerson } from '@/types';

export default function PartiesShow({ party }: { party: Party }) {
    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Parties', href: partyIndex().url },
        { title: party.name, href: partyShow(party.id).url },
    ];

    const contactPersons = party.contact_persons ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={party.name} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading title={party.name} />

                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={partyEdit(party.id).url}>
                                    <SquarePen className="size-4" />
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

                    <div className="space-y-8">
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Party details</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <TextEntry label="Party name" value={party.name} inlineLabel weight="medium" />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Trade name" value={party.trade_name} inlineLabel weight="medium" />
                                    <TextEntry label="Party type" value={party.party_type_label} inlineLabel weight="medium" />
                                </div>
                                <TextEntry
                                    label="Status"
                                    value={party.status_label}
                                    badge
                                    color={party.status === 'active' ? 'success' : 'gray'}
                                    inlineLabel
                                    weight="medium"
                                />
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Contact</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Mobile" value={party.mobile} inlineLabel weight="medium" />
                                    <TextEntry label="Email" value={party.email} inlineLabel weight="medium" />
                                </div>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Financials</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <TextEntry
                                    label="Opening balance type"
                                    value={party.opening_balance_type_label}
                                    badge
                                    color={getOpeningBalanceTypeColor(party.opening_balance_type)}
                                    inlineLabel
                                    weight="medium"
                                />
                                {party.opening_balance_type !== 'none' && (
                                    <TextEntry label="Opening balance" value={party.opening_balance} inlineLabel weight="medium" />
                                )}
                                {(party.party_type === 'customer' || party.party_type === 'both') && (
                                    <TextEntry label="Credit limit" value={party.credit_limit} inlineLabel weight="medium" />
                                )}
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Address</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <TextEntry label="Address line" value={party.address_line} inlineLabel weight="medium" />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="District" value={party.district} inlineLabel weight="medium" />
                                    <TextEntry label="Postal code" value={party.postal_code} inlineLabel weight="medium" />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Area type" value={party.area_type_label} inlineLabel weight="medium" />
                                    <TextEntry label="Area name" value={party.area_name} inlineLabel weight="medium" />
                                </div>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <div className="flex flex-row items-center justify-between">
                                    <SectionTitle>Contact Persons ({contactPersons.length})</SectionTitle>
                                    <Button asChild size="sm">
                                        <Link href={contactPersonCreate(party.id).url}>
                                            <Plus className="size-4" />
                                            New Contact Person
                                        </Link>
                                    </Button>
                                </div>
                                <Separator />
                            </SectionHeader>

                            <SectionContent>
                                {contactPersons.length === 0 ? (
                                    <div className="py-4 text-sm text-muted-foreground">No contact persons yet.</div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {contactPersons.map((contactPerson) => (
                                            <ContactPersonCard key={contactPerson.id} party={party} contactPerson={contactPerson} />
                                        ))}
                                    </div>
                                )}
                            </SectionContent>
                        </Section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function getOpeningBalanceTypeColor(openingBalanceType: string): TextEntryColor {
    if (openingBalanceType === 'receivable') {
        return 'success';
    }

    if (openingBalanceType === 'payable') {
        return 'danger';
    }

    return 'gray';
}

function ContactPersonCard({ party, contactPerson }: { party: Party; contactPerson: PartyContactPerson }) {
    return (
        <Card className="gap-4">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="flex items-center gap-2">
                        {contactPerson.name}
                        {contactPerson.is_primary && (
                            <Badge variant="outline" className="border-transparent bg-amber-100 text-amber-800">
                                Primary
                            </Badge>
                        )}
                    </CardTitle>
                    {contactPerson.designation && <div className="text-sm text-muted-foreground">{contactPerson.designation}</div>}
                </div>
                <Badge
                    variant="outline"
                    className={
                        contactPerson.status === 'active'
                            ? 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }
                >
                    {contactPerson.status_label ?? '-'}
                </Badge>
            </CardHeader>

            <CardContent>
                <div className="space-y-1">
                    {contactPerson.mobile && <TextEntry label="Mobile" value={contactPerson.mobile} inlineLabel weight="medium" />}
                    {contactPerson.email && <TextEntry label="Email" value={contactPerson.email} inlineLabel weight="medium" />}
                    {contactPerson.note && <TextEntry label="Note" value={contactPerson.note} inlineLabel weight="medium" />}
                </div>
            </CardContent>

            <CardFooter className="justify-end gap-2">
                <Button size="sm" variant="outline" asChild title="Edit Contact Person" aria-label="Edit Contact Person">
                    <Link
                        href={
                            contactPersonEdit({
                                party,
                                party_contact_person: contactPerson.id,
                            }).url
                        }
                    >
                        <SquarePen className="size-4" />
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
                            size="icon-sm"
                            variant="ghost"
                            disabled={processing}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Contact Person"
                            aria-label="Delete Contact Person"
                        >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    )}
                </Form>
            </CardFooter>
        </Card>
    );
}
