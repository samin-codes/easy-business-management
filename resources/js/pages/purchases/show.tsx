import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index as purchaseIndex, show as purchaseShow, edit as purchaseEdit } from '@/routes/purchases';
import type { BreadcrumbItem } from '@/types';
import type { Purchase } from './types';

function formatCurrency(value: string | number) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function PurchasesShow({ purchase }: { purchase: Purchase }) {
    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const items = purchase.items ?? [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: purchaseIndex().url },
        {
            title: purchase.purchase_no,
            href: purchaseShow(purchase.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={purchase.purchase_no} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading title={purchase.purchase_no} />

                        <Button asChild variant="outline">
                            <Link href={purchaseEdit(purchase.id).url}>
                                <Pencil className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <div className="mb-3 text-base font-medium">Purchase Information</div>
                            <div className="space-y-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Purchase Date" value={formatDate(purchase.purchase_date)} />
                                    <TextEntry label="Outlet" value={purchase.outlet?.name} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Supplier" value={purchase.supplier?.name} />
                                    <TextEntry label="Created By" value={purchase.user?.name} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry
                                        label="Status"
                                        value={purchase.status_label}
                                        badge
                                        color={
                                            purchase.status === 'confirmed'
                                                ? 'success'
                                                : purchase.status === 'cancelled'
                                                  ? 'danger'
                                                  : 'gray'
                                        }
                                    />
                                    <TextEntry
                                        label="Payment Status"
                                        value={purchase.payment_status_label}
                                        badge
                                        color={
                                            purchase.payment_status === 'paid'
                                                ? 'success'
                                                : purchase.payment_status === 'partial'
                                                  ? 'warning'
                                                  : 'danger'
                                        }
                                    />
                                </div>
                                {purchase.note && <TextEntry label="Note" value={purchase.note} />}
                            </div>
                        </div>

                        <hr className="border-t" />

                        <div>
                            <div className="mb-3 text-base font-medium">Purchase Items ({items.length})</div>

                            <div className="overflow-hidden rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr>
                                                <th className="h-10 px-3 text-left align-middle font-medium">Product / Variant</th>
                                                <th className="h-10 px-3 text-left align-middle font-medium">Unit</th>
                                                <th className="h-10 px-3 text-right align-middle font-medium">Qty</th>
                                                <th className="h-10 px-3 text-right align-middle font-medium">Unit Cost</th>
                                                <th className="h-10 px-3 text-right align-middle font-medium">Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {items.map((item) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="px-3 py-2 font-medium">{item.product_variant?.purchase_label ?? '-'}</td>
                                                    <td className="px-3 py-2 text-muted-foreground">
                                                        {item.unit_of_measurement?.name ?? '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(item.unit_cost)}</td>
                                                    <td className="px-3 py-2 text-right font-medium tabular-nums">
                                                        {formatCurrency(item.line_total ?? 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <hr className="border-t" />

                        <div>
                            <div className="mb-3 text-base font-medium">Summary</div>
                            <div className="space-y-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Subtotal" value={formatCurrency(purchase.subtotal)} />
                                    <TextEntry label="Discount" value={formatCurrency(purchase.discount_amount)} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-3">
                                    <TextEntry label="Transport Cost" value={formatCurrency(purchase.transport_cost)} />
                                    <TextEntry label="Labour Cost" value={formatCurrency(purchase.labour_cost)} />
                                    <TextEntry label="Other Cost" value={formatCurrency(purchase.other_cost)} />
                                </div>
                                <hr />
                                <div className="grid gap-3 md:grid-cols-3">
                                    <TextEntry label="Total Amount" value={formatCurrency(purchase.total_amount)} />
                                    <TextEntry label="Paid Amount" value={formatCurrency(purchase.paid_amount)} />
                                    <TextEntry label="Due Amount" value={formatCurrency(purchase.due_amount)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

type TextEntryColor = 'gray' | 'blue' | 'success' | 'danger' | 'warning';

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
