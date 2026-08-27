import { Head, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import SalePaymentController from '@/actions/App/Http/Controllers/SalePaymentController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatInteger } from '@/lib/utils';
import { index, show } from '@/routes/sales';
import type { BreadcrumbItem } from '@/types';
import RecordPaymentSection from './components/record-payment-section';
import type { PaymentMethod, Sale } from './types';

export default function SalesShow({ sale, paymentMethods }: { sale: Sale; paymentMethods: PaymentMethod[] }) {
    const { flash } = usePage<{ flash: { status?: string } }>().props;

    const isDue = sale.payment_status !== 'paid';
    const payments = sale.payments ?? [];

    const deleteSale = () => {
        if (confirm(`Delete sale ${sale.sale_no}? This restores its inventory.`))
            router.delete(SaleController.destroy(sale.id), { onError: (errors) => alert(errors.sale ?? 'Unable to delete this sale.') });
    };

    const deletePayment = (id: number) => {
        if (confirm('Delete this payment?'))
            router.delete(SalePaymentController.destroy({ sale: sale.id, salePayment: id }), { preserveScroll: true });
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
                    <div className="flex items-center justify-between">
                        <Heading title={sale.sale_no} />
                        <Button variant="destructive" onClick={deleteSale}>
                            <Trash2 className="size-4" />
                            Delete Sale
                        </Button>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {flash.status}
                        </div>
                    )}

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Sale Information</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent className="gap-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <span className="text-sm text-muted-foreground">Sale Date</span>
                                    <p>{format(parseISO(sale.sale_date), 'MMMM d, yyyy')}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Outlet</span>
                                    <p>{sale.outlet?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Customer</span>
                                    <p>{sale.customer?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Created By</span>
                                    <p>{sale.createdBy?.name ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline">{sale.status_label ?? sale.status}</Badge>
                                <Badge variant="outline">{sale.payment_status_label ?? sale.payment_status}</Badge>
                            </div>
                            {sale.note && <p className="text-sm text-muted-foreground">{sale.note}</p>}
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Sale Items</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="table-hover table">
                                    <thead>
                                        <tr>
                                            <th>Product / Variant</th>
                                            <th>Unit</th>
                                            <th className="text-right">Qty</th>
                                            <th className="text-right">Unit Price</th>
                                            <th className="text-right">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sale.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="font-medium">{item.product_variant?.purchase_label ?? '-'}</td>
                                                <td>{item.unit_of_measurement?.name ?? '-'}</td>
                                                <td className="text-right tabular-nums">{formatInteger(item.quantity)}</td>
                                                <td className="text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                                                <td className="text-right font-medium tabular-nums">{formatCurrency(item.line_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end">
                                <Card className="w-full max-w-sm p-0">
                                    <CardContent className="space-y-2 p-4">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(sale.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Discount</span>
                                            <span>{formatCurrency(sale.discount_amount)}</span>
                                        </div>
                                        <div className="border-t" />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>{formatCurrency(sale.total_amount)}</span>
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
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="table-hover table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Method</th>
                                                <th className="text-right">Amount</th>
                                                <th>Reference</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{format(parseISO(item.payment_date), 'MMMM d, yyyy')}</td>
                                                    <td className="capitalize">{item.payment_method.replace('_', ' ')}</td>
                                                    <td className="text-right tabular-nums">{formatCurrency(item.amount)}</td>
                                                    <td>{item.reference_no || '-'}</td>
                                                    <td className="text-right">
                                                        <Button variant="ghost" size="icon-sm" onClick={() => deletePayment(item.id)}>
                                                            <Trash2 className="size-4" />
                                                            <span className="sr-only">Delete payment</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionContent>
                        </Section>
                    )}

                    {isDue && <RecordPaymentSection sale={sale} paymentMethods={paymentMethods} />}
                </div>
            </div>
        </AppLayout>
    );
}
