import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import OutletController from '@/actions/App/Http/Controllers/OutletController';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { edit as businessEdit, show as businessShow } from '@/routes/business';
import { create as outletCreate, edit as outletEdit } from '@/routes/businesses/outlets';
import type { BreadcrumbItem } from '@/types';
import type { Business, Outlet } from './types';

export default function BusinessesShow({ business }: { business: Business }) {
    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const outlets = business.outlets ?? [];

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Business', href: businessShow().url }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={business.name} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading title={business.name} />

                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={businessEdit().url}>
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
                                <SectionTitle>Business details</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <TextEntry label="Business name" value={business.name} inlineLabel weight="medium" />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Trade name" value={business.trade_name} inlineLabel weight="medium" />
                                    <TextEntry label="Business type" value={business.business_type_label} inlineLabel weight="medium" />
                                </div>
                                <TextEntry
                                    label="Status"
                                    value={business.status_label}
                                    inlineLabel
                                    weight="medium"
                                    badge
                                    color={business.status === 'active' ? 'success' : 'gray'}
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
                                    <TextEntry label="Mobile" value={business.mobile} inlineLabel weight="medium" />
                                    <TextEntry label="Email" value={business.email} inlineLabel weight="medium" />
                                </div>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Registration</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <TextEntry label="Trade license no." value={business.trade_license_no} inlineLabel weight="medium" />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="TIN no." value={business.tin_no} inlineLabel weight="medium" />
                                    <TextEntry label="BIN no." value={business.bin_no} inlineLabel weight="medium" />
                                </div>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Address</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <TextEntry label="Address line" value={business.address_line} inlineLabel weight="medium" />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="District" value={business.district} inlineLabel weight="medium" />
                                    <TextEntry label="Postal code" value={business.postal_code} inlineLabel weight="medium" />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Area type" value={business.area_type_label} inlineLabel weight="medium" />
                                    <TextEntry label="Area name" value={business.area_name} inlineLabel weight="medium" />
                                </div>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <div className="flex flex-row items-center justify-between">
                                    <SectionTitle>Outlets ({outlets.length})</SectionTitle>
                                    <Button asChild size="sm">
                                        <Link href={outletCreate(business.id).url}>
                                            <Plus className="size-4" />
                                            New Outlet
                                        </Link>
                                    </Button>
                                </div>
                                <Separator />
                            </SectionHeader>

                            <SectionContent>
                                {outlets.length === 0 ? (
                                    <div className="py-4 text-sm text-muted-foreground">No outlets yet.</div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {outlets.map((outlet) => (
                                            <OutletCard key={outlet.id} business={business} outlet={outlet} />
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

function OutletCard({ business, outlet }: { business: Business; outlet: Outlet }) {
    return (
        <Card className="gap-4">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>
                        {outlet.name}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">({outlet.code || 'No code'})</span>
                    </CardTitle>
                    <CardDescription>{outlet.outlet_type_label || 'No type'}</CardDescription>
                </div>
                <Badge
                    variant="outline"
                    className={
                        outlet.status === 'active'
                            ? 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }
                >
                    {outlet.status_label ?? '-'}
                </Badge>
            </CardHeader>

            <CardContent>
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Mobile:</span> {outlet.mobile}
                </div>
            </CardContent>

            <CardFooter className="justify-end gap-2">
                <Button size="sm" variant="outline" asChild title="Edit Outlet" aria-label="Edit Outlet">
                    <Link href={outletEdit({ business, outlet }).url}>
                        <SquarePen className="size-4" />
                        Edit
                    </Link>
                </Button>

                <Form
                    action={OutletController.destroy({ business, outlet })}
                    options={{ preserveScroll: true }}
                    onBefore={() => window.confirm(`Delete the outlet "${outlet.name}" from this business?`)}
                >
                    {({ processing }) => (
                        <Button
                            type="submit"
                            size="icon-sm"
                            variant="ghost"
                            disabled={processing}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Outlet"
                            aria-label="Delete Outlet"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </Form>
            </CardFooter>
        </Card>
    );
}
