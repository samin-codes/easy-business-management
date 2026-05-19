import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import OutletController from '@/actions/App/Http/Controllers/OutletController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { edit as businessEdit, show as businessShow } from '@/routes/business';
import { create as outletCreate, edit as outletEdit } from '@/routes/businesses/outlets';
import type { BreadcrumbItem } from '@/types';
import type { Business, Outlet } from './types';
import { Separator } from '@/components/ui/separator';

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
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

                    <div className="space-y-6">
                        <div>
                            <div className="mb-3 text-base font-medium">Business details</div>
                            <div className="space-y-3">
                                <TextEntry label="Business name" value={business.name} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Trade name" value={business.trade_name} />
                                    <TextEntry label="Business type" value={business.business_type_label} />
                                </div>
                                <TextEntry
                                    label="Status"
                                    value={business.status_label}
                                    badge
                                    color={business.status === 'active' ? 'success' : 'gray'}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="mb-3 text-base font-medium">Contact</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <TextEntry label="Mobile" value={business.mobile} />
                                <TextEntry label="Email" value={business.email} />
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="mb-3 text-base font-medium">Registration</div>
                            <div className="space-y-3">
                                <TextEntry label="Trade license no." value={business.trade_license_no} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="TIN no." value={business.tin_no} />
                                    <TextEntry label="BIN no." value={business.bin_no} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="mb-3 text-base font-medium">Address</div>
                            <div className="space-y-3">
                                <TextEntry label="Address line" value={business.address_line} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="District" value={business.district} />
                                    <TextEntry label="Postal code" value={business.postal_code} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Area type" value={business.area_type_label} />
                                    <TextEntry label="Area name" value={business.area_name} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-base font-medium">Outlets ({outlets.length})</div>
                                <Button asChild size="sm">
                                    <Link href={outletCreate(business.id).url}>
                                        <Plus className="size-4" />
                                        New Outlet
                                    </Link>
                                </Button>
                            </div>

                            {outlets.length === 0 ? (
                                <div className="py-4 text-sm text-muted-foreground">No outlets yet.</div>
                            ) : (
                                <div className="divide-y">
                                    {outlets.map((outlet) => (
                                        <OutletListItem key={outlet.id} business={business} outlet={outlet} />
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

function OutletListItem({ business, outlet }: { business: Business; outlet: Outlet }) {
    return (
        <div className="space-y-2 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{outlet.name}</span>
                    <span className="text-sm text-muted-foreground">({outlet.code || 'No code'})</span>
                    <span className="text-sm text-muted-foreground">{outlet.outlet_type_label || 'No type'}</span>
                </div>
                <Badge
                    variant="outline"
                    className={
                        outlet.status === 'active'
                            ? 'border-transparent bg-blue-100 text-blue-800'
                            : 'border-transparent bg-gray-300 text-gray-800'
                    }
                >
                    {outlet.status_label ?? '-'}
                </Badge>
            </div>

            <div className="text-sm text-muted-foreground">Mobile: {outlet.mobile}</div>

            <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
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
    color?: 'gray' | 'blue' | 'success' | 'danger' | 'warning';
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
            <div className="text-sm text-muted-foreground sm:w-32 sm:shrink-0">{label}</div>
            <div className="text-sm font-medium">{content}</div>
        </div>
    );
}
