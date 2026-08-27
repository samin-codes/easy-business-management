import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import SalePaymentController from '@/actions/App/Http/Controllers/SalePaymentController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentFormData, PaymentMethod, Sale } from '../types';

export default function RecordPaymentSection({
    sale,
    paymentMethods,
}: {
    sale: Pick<Sale, 'id' | 'due_amount'>;
    paymentMethods: PaymentMethod[];
}) {
    const form = useForm<PaymentFormData>({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        note: '',
    });

    function submit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        form.submit(SalePaymentController.store({ sale: sale.id }), { preserveScroll: true, onSuccess: () => form.reset() });
    }

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>Record Payment</SectionTitle>
                <Separator />
            </SectionHeader>
            <SectionContent>
                <form onSubmit={submit} className="grid gap-4 md:grid-cols-4">
                    <div>
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={form.data.payment_date}
                            onChange={(event) => form.setData('payment_date', event.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Method</label>
                        <select
                            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                            value={form.data.payment_method}
                            onChange={(event) => form.setData('payment_method', event.target.value)}
                        >
                            {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                            type="number"
                            min="0.01"
                            max={sale.due_amount}
                            step="0.01"
                            value={form.data.amount}
                            onChange={(event) => form.setData('amount', event.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            Record Payment
                        </Button>
                    </div>
                    <div className="md:col-span-4">
                        <label className="text-sm font-medium">Reference / Note</label>
                        <Textarea
                            value={form.data.reference_no}
                            onChange={(event) => form.setData('reference_no', event.target.value)}
                            placeholder="Optional reference"
                        />
                    </div>
                </form>
            </SectionContent>
        </Section>
    );
}
