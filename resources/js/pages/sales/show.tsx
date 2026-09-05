import { Head, router, usePage } from '@inertiajs/react';
import { format as formatDate } from 'date-fns';
import { Trash2 } from 'lucide-react';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import SalePaymentController from '@/actions/App/Http/Controllers/SalePaymentController';
import Heading from '@/components/heading';
import { DeleteAction } from '@/components/table-actions';
import { TextEntry } from '@/components/text-entry';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatInteger } from '@/lib/utils';
import { index, show } from '@/routes/sales';
import type { BreadcrumbItem, Option, PaymentMethod, Sale } from '@/types';
import RecordPaymentSection from './components/record-payment-section';

export default function SalesShow({ sale, paymentMethods }: { sale: Sale; paymentMethods: Option<PaymentMethod>[] }) {
    const { flash } = usePage<{
        flash: {
            status?: string;
        };
    }>().props;

    const isDue = sale.payment_status !== 'paid';
    const payments = sale.payments ?? [];
    const items = sale.items ?? [];

    const deleteSale = () => {
        if (confirm(`Delete sale ${sale.sale_no}? This restores its inventory.`)) {
            router.delete(SaleController.destroy(sale.id), {
                onError: (errors) => alert(errors.sale ?? 'Unable to delete this sale.'),
            });
        }
    };

    const deletePayment = (id: number) => {
        if (confirm('Delete this payment?')) {
            router.delete(
                SalePaymentController.destroy({
                    sale: sale.id,
                    salePayment: id,
                }),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: index().url },
        { title: sale.sale_no, href: show(sale.id).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={sale.sale_no} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading title={sale.sale_no} />

                        <Button variant="destructive" onClick={deleteSale}>
                            <Trash2 className="size-4" />
                            Delete Sale
                        </Button>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}

                    <div className="space-y-8">
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Sale information</SectionTitle>
                                <Separator />
                            </SectionHeader>

                            <SectionContent className="gap-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Sale No" value={sale.sale_no} />

                                    <TextEntry label="Sale Date" value={formatDate(new Date(sale.sale_date), 'MMMM d, yyyy')} />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Outlet" value={sale.outlet?.name} />

                                    <TextEntry label="Customer" value={sale.customer?.name} />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry label="Created By" value={sale.createdBy?.name} />

                                    {sale.note && <TextEntry label="Note" value={sale.note} />}
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <TextEntry
                                        label="Status"
                                        value={sale.status_label}
                                        badge
                                        color={sale.status === 'confirmed' ? 'success' : sale.status === 'cancelled' ? 'danger' : 'gray'}
                                    />

                                    <TextEntry
                                        label="Payment Status"
                                        value={sale.payment_status_label}
                                        badge
                                        color={
                                            sale.payment_status === 'paid'
                                                ? 'success'
                                                : sale.payment_status === 'partial'
                                                  ? 'warning'
                                                  : 'danger'
                                        }
                                    />
                                </div>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <SectionTitle>Sale items</SectionTitle>
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
                                                        <th className="ui-table-header-cell text-right">Unit Price</th>
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
                                                                    <div className="ui-table-text">{formatCurrency(item.unit_price)}</div>
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
                                                                        {formatCurrency(sale.subtotal)}
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
                                                    {formatCurrency(sale.subtotal)}
                                                </span>
                                            </div>

                                            <div className="border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Discount Amount</span>

                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(sale.discount_amount)}
                                                </span>
                                            </div>

                                            <div className="my-2 border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-2">
                                                <span className="text-sm font-medium">Total Amount</span>

                                                <span className="w-36 pr-3 text-right text-base font-semibold tabular-nums">
                                                    {formatCurrency(sale.total_amount)}
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
                                                            <th className="ui-table-header-cell ui-table-empty-header-cell">
                                                                <span className="sr-only">Actions</span>
                                                            </th>
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

                                                                <td className="ui-table-cell text-right">
                                                                    <div className="ui-table-actions">
                                                                        <DeleteAction
                                                                            appearance="icon-button"
                                                                            label={`Delete payment from ${formatDate(
                                                                                new Date(payment.payment_date),
                                                                                'MMMM d, yyyy',
                                                                            )}`}
                                                                            onClick={() => deletePayment(payment.id)}
                                                                        />
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

                        {isDue && <RecordPaymentSection sale={sale} paymentMethods={paymentMethods} />}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
