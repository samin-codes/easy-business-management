import { useForm } from '@inertiajs/react';
import { format as formatDate, isValid, parseISO } from 'date-fns';
import { Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDecimal } from '@/lib/utils';
import { store } from '@/routes/purchases/payments';
import type { Option, PaymentMethod, Purchase } from '@/types';

type PaymentFormData = {
    payment_date: string;
    amount: string;
    payment_method: string;
    reference_no: string;
    note: string;
};

function createPaymentFormData(): PaymentFormData {
    return {
        payment_date: formatDate(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        note: '',
    };
}

function parseDateValue(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parsedDate = parseISO(value);

    return isValid(parsedDate) ? parsedDate : undefined;
}

type PaymentFormProps = {
    purchase: Pick<Purchase, 'id' | 'total_amount' | 'paid_amount' | 'due_amount' | 'payment_status'>;
    paymentMethods: Option<PaymentMethod>[];
};

export default function PaymentForm({ purchase, paymentMethods }: PaymentFormProps) {
    const form = useForm<PaymentFormData>(() => createPaymentFormData());

    const paymentDate = parseDateValue(form.data.payment_date);

    const totalAmount = Number(purchase.total_amount) || 0;
    const paidAmount = Number(purchase.paid_amount) || 0;
    const currentPaymentAmount = Number(form.data.amount) || 0;
    const totalAfterPayment = paidAmount + currentPaymentAmount;
    const dueAmount = Math.max(totalAmount - totalAfterPayment, 0);

    const paymentStatus = currentPaymentAmount <= 0 ? purchase.payment_status : totalAfterPayment >= totalAmount ? 'paid' : 'partial';

    function handlePaymentAmountBlur() {
        form.setData((data) => ({
            ...data,
            amount: formatDecimal(Math.max(0, Math.min(Number(data.amount) || 0, Number(purchase.due_amount) || 0))),
        }));
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        form.submit(store({ purchase: purchase.id }), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
                <form id="paymentForm" onSubmit={handleSubmit}>
                    <FieldGroup className="grid gap-4 md:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="payment_date">
                                Date <span className="-ml-1 text-red-500">*</span>
                            </FieldLabel>

                            <DatePicker
                                id="payment_date"
                                value={paymentDate}
                                onChange={(date) =>
                                    form.setData((data) => ({
                                        ...data,
                                        payment_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                    }))
                                }
                                aria-invalid={Boolean(form.errors.payment_date)}
                            />

                            <FieldError
                                errors={[
                                    {
                                        message: form.errors.payment_date,
                                    },
                                ]}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="payment_method">
                                Method <span className="-ml-1 text-red-500">*</span>
                            </FieldLabel>

                            <Select
                                value={form.data.payment_method}
                                onValueChange={(paymentMethod) =>
                                    form.setData((data) => ({
                                        ...data,
                                        payment_method: paymentMethod,
                                    }))
                                }
                            >
                                <SelectTrigger id="payment_method" className="w-full" aria-invalid={Boolean(form.errors.payment_method)}>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>

                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FieldError
                                errors={[
                                    {
                                        message: form.errors.payment_method,
                                    },
                                ]}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="payment_amount">
                                Amount <span className="-ml-1 text-red-500">*</span>
                            </FieldLabel>

                            <Input
                                id="payment_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.amount}
                                onChange={(event) => form.setData('amount', event.target.value)}
                                onBlur={handlePaymentAmountBlur}
                                className="no-number-spinner text-right"
                                aria-invalid={Boolean(form.errors.amount)}
                            />

                            <FieldError
                                errors={[
                                    {
                                        message: form.errors.amount,
                                    },
                                ]}
                            />
                        </Field>

                        <Field className="md:col-span-3">
                            <FieldLabel htmlFor="payment_reference_no">Reference No</FieldLabel>

                            <Input
                                id="payment_reference_no"
                                value={form.data.reference_no}
                                onChange={(event) => form.setData('reference_no', event.target.value)}
                                aria-invalid={Boolean(form.errors.reference_no)}
                                placeholder="Optional reference no."
                            />

                            <FieldError
                                errors={[
                                    {
                                        message: form.errors.reference_no,
                                    },
                                ]}
                            />
                        </Field>

                        <Field className="md:col-span-3">
                            <FieldLabel htmlFor="payment_note">Payment Note</FieldLabel>

                            <Textarea
                                id="payment_note"
                                value={form.data.note}
                                onChange={(event) => form.setData('note', event.target.value)}
                                aria-invalid={Boolean(form.errors.note)}
                                placeholder="Optional payment note"
                                className="min-h-20 resize-none"
                            />

                            <FieldError
                                errors={[
                                    {
                                        message: form.errors.note,
                                    },
                                ]}
                            />
                        </Field>
                    </FieldGroup>
                </form>

                <Card className="overflow-hidden p-0">
                    <CardContent className="space-y-1 p-4">
                        <div className="flex items-center justify-between gap-4 py-2">
                            <span className="text-sm font-medium">Total Amount</span>

                            <span className="w-36 pr-3 text-right text-base font-semibold tabular-nums">{formatCurrency(totalAmount)}</span>
                        </div>

                        <div className="my-2 border-t border-border" />

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Paid to Date</span>

                            <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">{formatCurrency(paidAmount)}</span>
                        </div>

                        {currentPaymentAmount > 0 && (
                            <div className="flex items-center justify-between gap-4 py-1">
                                <span className="text-sm text-muted-foreground">Payment Amount</span>

                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                    {formatCurrency(currentPaymentAmount)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Due Amount</span>

                            <span
                                className={
                                    'w-36 pr-3 text-right text-sm font-semibold tabular-nums ' +
                                    (paymentStatus === 'paid'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : paymentStatus === 'partial'
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-red-600 dark:text-red-400')
                                }
                            >
                                {formatCurrency(dueAmount)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Payment Status</span>

                            <span className="flex w-36 justify-end">
                                <Badge
                                    variant="outline"
                                    className={
                                        paymentStatus === 'paid'
                                            ? 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                            : paymentStatus === 'partial'
                                              ? 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                              : 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                                    }
                                >
                                    {paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                                </Badge>
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button type="submit" form="paymentForm" disabled={form.processing}>
                    <Save className="size-4" />
                    {form.processing ? 'Saving...' : 'Save Payment'}
                </Button>
            </div>
        </>
    );
}
