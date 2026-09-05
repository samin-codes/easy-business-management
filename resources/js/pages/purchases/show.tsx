import { Head, usePage } from '@inertiajs/react';
import { format as formatDate } from 'date-fns';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatInteger } from '@/lib/utils';
import { index, show } from '@/routes/purchases';
import type { BreadcrumbItem, Option, PaymentMethod, Purchase } from '@/types';
import RecordPaymentSection from './components/record-payment-section';

export default function PurchasesShow({ purchase, paymentMethods }: { purchase: Purchase; paymentMethods: Option<PaymentMethod>[] }) {
    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const payments = purchase.payments ?? [];
    const items = purchase.items ?? [];
    const isDue = purchase.payment_status !== 'paid';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        {
            title: purchase.purchase_no,
            href: show(purchase.id).url,
        },
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
                                <SectionTitle>Purchase information</SectionTitle>
                                <Separator />
                            </SectionHeader>

                            <SectionContent className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                                <TextEntry label="Purchase No" value={purchase.purchase_no} />
                                <TextEntry label="Purchase Date" value={formatDate(new Date(purchase.purchase_date), 'MMMM d, yyyy')} />

                                <TextEntry label="Outlet" value={purchase.outlet?.name} />
                                <TextEntry label="Supplier" value={purchase.supplier?.name} />

                                <TextEntry
                                    label="Status"
                                    value={purchase.status_label}
                                    badge
                                    color={
                                        purchase.status === 'confirmed' ? 'success' : purchase.status === 'cancelled' ? 'danger' : 'gray'
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

                                <TextEntry label="Created By" value={purchase.createdBy?.name} />

                                {purchase.note && <TextEntry label="Note" value={purchase.note} className="md:col-span-2" />}
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Purchase items</SectionTitle>
                                <Separator />
                            </SectionHeader>

                            <SectionContent className="gap-6">
                                <div className="ui-table">
                                    <div className="ui-table-main">
                                        <div className="ui-table-content">
                                            <table className="ui-table-element">
                                                <thead>
                                                    <tr>
                                                        <th className="ui-table-header-cell">Product / Variant</th>
                                                        <th className="ui-table-header-cell">Unit</th>
                                                        <th className="ui-table-header-cell text-right">Qty</th>
                                                        <th className="ui-table-header-cell text-right">Unit Cost</th>
                                                        <th className="ui-table-header-cell text-right">Line Total</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {items.map((item) => (
                                                        <tr key={item.id} className="ui-table-row">
                                                            <td className="ui-table-cell font-medium">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">
                                                                        {item.product_variant?.purchase_label ?? '-'}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="ui-table-cell text-muted-foreground">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">
                                                                        {item.unit_of_measurement?.name ?? '-'}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="ui-table-cell text-right tabular-nums">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">{formatInteger(item.quantity)}</div>
                                                                </div>
                                                            </td>

                                                            <td className="ui-table-cell text-right tabular-nums">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">{formatCurrency(item.unit_cost)}</div>
                                                                </div>
                                                            </td>

                                                            <td className="ui-table-cell text-right font-medium tabular-nums">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">
                                                                        {formatCurrency(item.line_total ?? 0)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>

                                                <tfoot>
                                                    <tr className="ui-table-row bg-muted/50">
                                                        <td
                                                            colSpan={4}
                                                            className="ui-table-cell text-right font-medium text-muted-foreground"
                                                        >
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text py-2">Subtotal</div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell text-right">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text py-2">
                                                                    <span className="font-semibold tabular-nums">
                                                                        {formatCurrency(purchase.subtotal)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
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
                                    <SectionTitle>Payment history</SectionTitle>
                                    <Separator />
                                </SectionHeader>

                                <SectionContent>
                                    <div className="ui-table">
                                        <div className="ui-table-main">
                                            <div className="ui-table-content">
                                                <table className="ui-table-element">
                                                    <thead>
                                                        <tr>
                                                            <th className="ui-table-header-cell">Date</th>
                                                            <th className="ui-table-header-cell">Method</th>
                                                            <th className="ui-table-header-cell text-right">Amount</th>
                                                            <th className="ui-table-header-cell">Reference</th>
                                                            <th className="ui-table-header-cell">Note</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {payments.map((payment) => (
                                                            <tr key={payment.id} className="ui-table-row">
                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {formatDate(new Date(payment.payment_date), 'MMMM d, yyyy')}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-muted-foreground capitalize">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {payment.payment_method.replace('_', ' ')}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right font-medium tabular-nums">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {formatCurrency(payment.amount)}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-muted-foreground">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">{payment.reference_no || '-'}</div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-muted-foreground">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">{payment.note || '-'}</div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </SectionContent>
                            </Section>
                        )}

                        {isDue && <RecordPaymentSection purchase={purchase} paymentMethods={paymentMethods} />}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
