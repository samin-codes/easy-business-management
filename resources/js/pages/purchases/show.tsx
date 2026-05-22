import { Head, usePage } from '@inertiajs/react';
import { format as formatDate } from 'date-fns';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatInteger } from '@/lib/utils';
import { index , show } from '@/routes/purchases';
import type { BreadcrumbItem } from '@/types';
import RecordPaymentSection from './components/record-payment-section';
import type { PaymentMethod, Purchase } from './types';

export default function PurchasesShow({ purchase, paymentMethods }: { purchase: Purchase; paymentMethods: PaymentMethod[] }) {
    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const payments = purchase.payments ?? [];
    const items = purchase.items ?? [];
    const isDue = purchase.payment_status !== 'paid';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: purchase.purchase_no, href: show(purchase.id).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={purchase.purchase_no} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-8">
                    <Heading title={purchase.purchase_no} />

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}

                    <div className="space-y-8">
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Purchase Information</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Purchase No" value={purchase.purchase_no} />
                                    <TextEntry label="Purchase Date" value={formatDate(new Date(purchase.purchase_date), 'MMMM d, yyyy')} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Outlet" value={purchase.outlet?.name} />
                                    <TextEntry label="Supplier" value={purchase.supplier?.name} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Created By" value={purchase.createdBy?.name} />
                                    {purchase.note && <TextEntry label="Note" value={purchase.note} />}
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
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Purchase Items</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent className="gap-6">
                                <div className="overflow-hidden rounded-md border">
                                    <div className="overflow-x-auto">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Product / Variant</th>
                                                    <th>Unit</th>
                                                    <th className="text-right">Qty</th>
                                                    <th className="text-right">Unit Cost</th>
                                                    <th className="text-right">Line Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="font-medium">{item.product_variant?.purchase_label ?? '-'}</td>
                                                        <td className="text-muted-foreground">{item.unit_of_measurement?.name ?? '-'}</td>
                                                        <td className="text-right tabular-nums">{formatInteger(item.quantity)}</td>
                                                        <td className="text-right tabular-nums">{formatCurrency(item.unit_cost)}</td>
                                                        <td className="text-right font-medium tabular-nums">
                                                            {formatCurrency(item.line_total ?? 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="table-light border-t">
                                                    <td colSpan={4} className="text-right font-medium text-muted-foreground">
                                                        Subtotal
                                                    </td>
                                                    <td className="text-right">
                                                        <span className="font-semibold tabular-nums">{formatCurrency(purchase.subtotal)}</span>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Card className="w-full max-w-sm overflow-hidden p-0">
                                        <CardContent className="space-y-1 p-4">
                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Subtotal</span>
                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(purchase.subtotal)}
                                                </span>
                                            </div>

                                            <div className="border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Transport Cost</span>
                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(purchase.transport_cost)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Labour Cost</span>
                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(purchase.labour_cost)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Other Cost</span>
                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(purchase.other_cost)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Discount Amount</span>
                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(purchase.discount_amount)}
                                                </span>
                                            </div>

                                            <div className="my-2 border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-2">
                                                <span className="text-sm font-medium">Total Cost</span>
                                                <span className="w-36 pr-3 text-right text-base font-semibold tabular-nums">
                                                    {formatCurrency(purchase.total_amount)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </SectionContent>
                        </Section>

                        {payments.length > 0 && (
                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Payment History</SectionTitle>
                                    <Separator />
                                </SectionHeader>
                                <SectionContent>
                                    <div className="overflow-hidden rounded-md border">
                                        <div className="overflow-x-auto">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Method</th>
                                                        <th className="text-right">Amount</th>
                                                        <th>Reference</th>
                                                        <th>Note</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payments.map((payment) => (
                                                        <tr key={payment.id}>
                                                            <td>{formatDate(new Date(payment.payment_date), 'MMMM d, yyyy')}</td>
                                                            <td className="text-muted-foreground capitalize">
                                                                {payment.payment_method.replace('_', ' ')}
                                                            </td>
                                                            <td className="text-right font-medium tabular-nums">
                                                                {formatCurrency(payment.amount)}
                                                            </td>
                                                            <td className="text-muted-foreground">{payment.reference_no || '-'}</td>
                                                            <td className="text-muted-foreground">{payment.note || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </SectionContent>
                            </Section>
                        )}

                        {isDue && (
                            <RecordPaymentSection purchase={purchase} paymentMethods={paymentMethods} />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
