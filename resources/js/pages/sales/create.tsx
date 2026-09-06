import { Head, Link, useForm } from '@inertiajs/react';
import { format as formatDate, isValid, parseISO } from 'date-fns';
import { Plus, Save, X } from 'lucide-react';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDecimal } from '@/lib/utils';
import { create, index } from '@/routes/sales';
import type { BreadcrumbItem, Option, Outlet, Party, PaymentMethod, Product } from '@/types';
import SaleItemsTable from './components/sale-items-table';
import type { SaleItemFormData, SaleItemPatch } from './components/sale-items-table';

type PaymentFormData = {
    payment_date: string;
    amount: string;
    payment_method: string;
    reference_no: string;
    note: string;
};

type SaleFormData = {
    sale_date: string;
    outlet_id: string;
    customer_party_id: string;
    note: string;
    discount_amount: string;
    payment: PaymentFormData;
    items: SaleItemFormData[];
};

const createSaleItemFormData = (): SaleItemFormData => ({
    uid: crypto.randomUUID(),
    product_variant_id: '',
    unit_of_measurement_id: '',
    quantity: '',
    unit_price: '',
});

function createPaymentFormData(): PaymentFormData {
    return {
        payment_date: formatDate(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        note: '',
    };
}

const createSaleFormData = (): SaleFormData => ({
    sale_date: formatDate(new Date(), 'yyyy-MM-dd'),
    outlet_id: '',
    customer_party_id: '',
    note: '',
    discount_amount: '0.00',
    payment: createPaymentFormData(),
    items: [createSaleItemFormData()],
});

function parseDateValue(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parsedDate = parseISO(value);

    return isValid(parsedDate) ? parsedDate : undefined;
}

export default function SalesCreate({
    outlets,
    customers,
    products,
    paymentMethods,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    customers: Pick<Party, 'id' | 'name'>[];
    products: Product[];
    paymentMethods: Option<PaymentMethod>[];
}) {
    const form = useForm<SaleFormData>(() => createSaleFormData());

    const selectedOutlet = outlets.find((outlet) => outlet.id.toString() === form.data.outlet_id) ?? null;

    const selectedCustomer = customers.find((customer) => customer.id.toString() === form.data.customer_party_id) ?? null;

    const saleDate = parseDateValue(form.data.sale_date);

    const paymentDate = parseDateValue(form.data.payment.payment_date);

    const subtotal = form.data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

    const totalAmount = Math.max(subtotal - (Number(form.data.discount_amount) || 0), 0);

    const currentPaymentAmount = Number(form.data.payment.amount) || 0;

    const dueAmount = Math.max(totalAmount - currentPaymentAmount, 0);

    const hasPayment = currentPaymentAmount > 0;

    const paymentStatus = currentPaymentAmount <= 0 ? 'unpaid' : currentPaymentAmount >= totalAmount ? 'paid' : 'partial';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: index().url },
        { title: 'Create', href: create().url },
    ];

    function submit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            items: data.items.map(({ uid, ...item }) => {
                void uid;

                return item;
            }),
        }));

        form.submit(SaleController.store(), {
            preserveScroll: true,
        });
    }

    const patchItem = (uid: string, patch: SaleItemPatch) => {
        form.setData((data) => ({
            ...data,
            items: data.items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
        }));
    };

    const removeItem = (uid: string) => {
        form.setData((data) => ({
            ...data,
            items: data.items.filter((item) => item.uid !== uid),
        }));
    };

    function handlePaymentAmountBlur() {
        form.setData((data) => ({
            ...data,
            payment: {
                ...data.payment,
                amount: formatDecimal(Math.max(0, Math.min(Number(data.payment.amount) || 0, totalAmount))),
            },
        }));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Sale" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <Heading title="Create Sale" className="mb-8" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-6">
                            <Section>
                                <SectionContent>
                                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="sale_date">
                                                Sale Date <span className="-ml-1 text-red-500">*</span>
                                            </FieldLabel>

                                            <DatePicker
                                                id="sale_date"
                                                value={saleDate}
                                                onChange={(date) => form.setData('sale_date', date ? formatDate(date, 'yyyy-MM-dd') : '')}
                                                aria-invalid={Boolean(form.errors.sale_date)}
                                            />

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors.sale_date,
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <div className="hidden md:block" />

                                        <Field>
                                            <FieldLabel htmlFor="outlet_id">
                                                Outlet <span className="-ml-1 text-red-500">*</span>
                                            </FieldLabel>

                                            <Combobox
                                                items={outlets}
                                                value={selectedOutlet}
                                                onValueChange={(outlet) => form.setData('outlet_id', outlet?.id.toString() ?? '')}
                                                itemToStringLabel={(outlet) => outlet.name}
                                                itemToStringValue={(outlet) => outlet.id.toString()}
                                            >
                                                <ComboboxInput
                                                    id="outlet_id"
                                                    placeholder="Select outlet"
                                                    className="w-full"
                                                    showClear
                                                    aria-invalid={Boolean(form.errors.outlet_id)}
                                                />

                                                <ComboboxContent>
                                                    <ComboboxEmpty>No outlet found.</ComboboxEmpty>

                                                    <ComboboxList>
                                                        {(outlet) => (
                                                            <ComboboxItem key={outlet.id} value={outlet}>
                                                                {outlet.name}
                                                                {outlet.code ? ` (${outlet.code})` : ''}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors.outlet_id,
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="customer_party_id">
                                                Customer <span className="-ml-1 text-red-500">*</span>
                                            </FieldLabel>

                                            <Combobox
                                                items={customers}
                                                value={selectedCustomer}
                                                onValueChange={(customer) =>
                                                    form.setData('customer_party_id', customer?.id.toString() ?? '')
                                                }
                                                itemToStringLabel={(customer) => customer.name}
                                                itemToStringValue={(customer) => customer.id.toString()}
                                            >
                                                <ComboboxInput
                                                    id="customer_party_id"
                                                    placeholder="Select customer"
                                                    className="w-full"
                                                    showClear
                                                    aria-invalid={Boolean(form.errors.customer_party_id)}
                                                />

                                                <ComboboxContent>
                                                    <ComboboxEmpty>No customer found.</ComboboxEmpty>

                                                    <ComboboxList>
                                                        {(customer) => (
                                                            <ComboboxItem key={customer.id} value={customer}>
                                                                {customer.name}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors.customer_party_id,
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel htmlFor="note">Note</FieldLabel>

                                            <Textarea
                                                id="note"
                                                value={form.data.note}
                                                onChange={(event) => form.setData('note', event.target.value)}
                                                aria-invalid={Boolean(form.errors.note)}
                                                placeholder="Sale notes..."
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
                                </SectionContent>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Sale items</SectionTitle>
                                    <Separator />
                                </SectionHeader>

                                <SectionContent>
                                    <SaleItemsTable
                                        items={form.data.items}
                                        products={products}
                                        errors={form.errors}
                                        onItemChange={patchItem}
                                        onItemRemove={removeItem}
                                    />
                                </SectionContent>

                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            form.setData((data) => ({
                                                ...data,
                                                items: [...data.items, createSaleItemFormData()],
                                            }))
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Payment</SectionTitle>
                                    <Separator />
                                </SectionHeader>

                                <SectionContent className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
                                    <FieldError className="lg:col-span-2" errors={[{ message: form.errors.payment }]} />

                                    <FieldGroup className="grid gap-4 md:grid-cols-3">
                                        <Field>
                                            <FieldLabel htmlFor="payment_date">
                                                Date
                                                {hasPayment && <span className="-ml-1 text-red-500">*</span>}
                                            </FieldLabel>

                                            <DatePicker
                                                id="payment_date"
                                                value={paymentDate}
                                                onChange={(date) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        payment: {
                                                            ...data.payment,
                                                            payment_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                                        },
                                                    }))
                                                }
                                                aria-invalid={Boolean(form.errors['payment.payment_date'])}
                                            />

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors['payment.payment_date'],
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="payment_method">
                                                Method
                                                {hasPayment && <span className="-ml-1 text-red-500">*</span>}
                                            </FieldLabel>

                                            <Select
                                                value={form.data.payment.payment_method}
                                                onValueChange={(paymentMethod) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        payment: {
                                                            ...data.payment,
                                                            payment_method: paymentMethod,
                                                        },
                                                    }))
                                                }
                                            >
                                                <SelectTrigger
                                                    id="payment_method"
                                                    className="w-full"
                                                    aria-invalid={Boolean(form.errors['payment.payment_method'])}
                                                >
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
                                                        message: form.errors['payment.payment_method'],
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="payment_amount">Amount</FieldLabel>

                                            <Input
                                                id="payment_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={form.data.payment.amount}
                                                onChange={(event) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        payment: {
                                                            ...data.payment,
                                                            amount: event.target.value,
                                                        },
                                                    }))
                                                }
                                                onBlur={handlePaymentAmountBlur}
                                                className="no-number-spinner text-right"
                                                aria-invalid={Boolean(form.errors['payment.amount'])}
                                            />

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors['payment.amount'],
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <Field className="md:col-span-3">
                                            <FieldLabel htmlFor="payment_reference_no">Reference No</FieldLabel>

                                            <Input
                                                id="payment_reference_no"
                                                value={form.data.payment.reference_no}
                                                onChange={(event) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        payment: {
                                                            ...data.payment,
                                                            reference_no: event.target.value,
                                                        },
                                                    }))
                                                }
                                                aria-invalid={Boolean(form.errors['payment.reference_no'])}
                                                placeholder="Optional reference no."
                                            />

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors['payment.reference_no'],
                                                    },
                                                ]}
                                            />
                                        </Field>

                                        <Field className="md:col-span-3">
                                            <FieldLabel htmlFor="payment_note">Payment Note</FieldLabel>

                                            <Textarea
                                                id="payment_note"
                                                value={form.data.payment.note}
                                                onChange={(event) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        payment: {
                                                            ...data.payment,
                                                            note: event.target.value,
                                                        },
                                                    }))
                                                }
                                                aria-invalid={Boolean(form.errors['payment.note'])}
                                                placeholder="Optional payment note"
                                                className="min-h-20 resize-none"
                                            />

                                            <FieldError
                                                errors={[
                                                    {
                                                        message: form.errors['payment.note'],
                                                    },
                                                ]}
                                            />
                                        </Field>
                                    </FieldGroup>

                                    <Card className="overflow-hidden p-0">
                                        <CardContent className="space-y-1 p-4">
                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Subtotal</span>

                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(subtotal)}
                                                </span>
                                            </div>

                                            <div className="border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <label htmlFor="discount_amount" className="text-sm text-muted-foreground">
                                                    Discount Amount
                                                </label>

                                                <Input
                                                    id="discount_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={form.data.discount_amount}
                                                    onChange={(event) => form.setData('discount_amount', event.target.value)}
                                                    onBlur={(event) => form.setData('discount_amount', formatDecimal(event.target.value))}
                                                    className="no-number-spinner h-9 w-36 text-right"
                                                    aria-invalid={Boolean(form.errors.discount_amount)}
                                                />
                                            </div>

                                            {form.errors.discount_amount && (
                                                <div className="text-right text-xs text-red-500">{form.errors.discount_amount}</div>
                                            )}

                                            <div className="my-2 border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-2">
                                                <span className="text-sm font-medium">Total Amount</span>

                                                <span className="w-36 pr-3 text-right text-base font-semibold tabular-nums">
                                                    {formatCurrency(totalAmount)}
                                                </span>
                                            </div>

                                            <div className="my-2 border-t border-border" />

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Payment Amount</span>

                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(currentPaymentAmount)}
                                                </span>
                                            </div>

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
                                                        {paymentStatus === 'paid'
                                                            ? 'Paid'
                                                            : paymentStatus === 'partial'
                                                              ? 'Partial'
                                                              : 'Unpaid'}
                                                    </Badge>
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </SectionContent>
                            </Section>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index().url}>
                                        <X />
                                        Cancel
                                    </Link>
                                </Button>

                                <Button type="submit" disabled={form.processing}>
                                    <Save />
                                    {form.processing ? 'Saving...' : 'Create Sale'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
