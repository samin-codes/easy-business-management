import { Head, Link, useForm } from '@inertiajs/react';
import { format as formatDate, isValid, parseISO } from 'date-fns';
import { Plus, Save, X } from 'lucide-react';
import PurchaseController from '@/actions/App/Http/Controllers/PurchaseController';
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
import { create, index } from '@/routes/purchases';
import type { BreadcrumbItem } from '@/types';
import type { PurchaseItemPatch } from './components/purchase-items-table';
import PurchaseItemsTable from './components/purchase-items-table';
import type { Outlet, PaymentFormData, PaymentMethod, Product, PurchaseFormData, PurchaseItemFormData, Supplier } from './types';

function createPurchaseItemFormData(): PurchaseItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_variant_id: '',
        unit_of_measurement_id: '',
        quantity: '',
        unit_cost: '',
    };
}

function createPaymentFormData(): PaymentFormData {
    return {
        payment_date: formatDate(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        note: '',
    };
}

function createPurchaseFormData(): PurchaseFormData {
    return {
        purchase_date: formatDate(new Date(), 'yyyy-MM-dd'),
        status: 'draft',
        outlet_id: '',
        supplier_party_id: '',
        note: '',
        discount_amount: '0.00',
        transport_cost: '0.00',
        labour_cost: '0.00',
        other_cost: '0.00',
        paid_amount: '0.00',
        payment: createPaymentFormData(),
        items: [createPurchaseItemFormData()],
    };
}

function parseDateValue(value: string): Date | undefined {
    if (!value) return undefined;

    const parsedDate = parseISO(value);

    return isValid(parsedDate) ? parsedDate : undefined;
}

export default function PurchasesCreate({
    outlets,
    suppliers,
    products,
    paymentMethods,
}: {
    outlets: Outlet[];
    suppliers: Supplier[];
    products: Product[];
    paymentMethods: PaymentMethod[];
}) {
    const form = useForm<PurchaseFormData>(() => createPurchaseFormData());

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: 'Create', href: create().url },
    ];

    const selectedOutlet = outlets.find((outlet) => outlet.id.toString() === form.data.outlet_id) ?? null;
    const selectedSupplier = suppliers.find((supplier) => supplier.id.toString() === form.data.supplier_party_id) ?? null;
    const purchaseDate = parseDateValue(form.data.purchase_date);
    const paymentDate = parseDateValue(form.data.payment.payment_date);

    const subtotal = form.data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0), 0);
    const total =
        subtotal +
        (Number(form.data.transport_cost) || 0) +
        (Number(form.data.labour_cost) || 0) +
        (Number(form.data.other_cost) || 0) -
        (Number(form.data.discount_amount) || 0);
    const paidAmount = Number(form.data.payment.amount) || 0;
    const due = total - paidAmount;
    const paymentStatus = paidAmount <= 0 ? 'unpaid' : paidAmount >= total ? 'paid' : 'partial';
    const hasPayment = Number(form.data.payment.amount) > 0;

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            items: data.items.map(({ uid, ...item }) => {
                void uid;

                return item;
            }),
        }));

        form.submit(PurchaseController.store(), {
            preserveScroll: true,
        });
    }

    const handlePurchaseItemAdd = () => {
        form.setData((data) => ({
            ...data,
            items: [...data.items, createPurchaseItemFormData()],
        }));
    };

    const handlePurchaseItemRemove = (uid: string) => {
        form.setData((data) => ({
            ...data,
            items: data.items.filter((purchaseItem) => purchaseItem.uid !== uid),
        }));
    };

    const handlePurchaseItemChange = (uid: string, patch: PurchaseItemPatch) => {
        form.setData((data) => ({
            ...data,
            items: data.items.map((purchaseItem) => (purchaseItem.uid === uid ? { ...purchaseItem, ...patch } : purchaseItem)),
        }));
    };

    const handlePaymentAmountBlur = () => {
        form.setData((data) => {
            const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0), 0);
            const total =
                subtotal +
                (Number(data.transport_cost) || 0) +
                (Number(data.labour_cost) || 0) +
                (Number(data.other_cost) || 0) -
                (Number(data.discount_amount) || 0);
            const clamped = Math.min(Number(data.payment.amount) || 0, Math.max(total, 0));
            const formattedAmount = formatDecimal(clamped);

            return {
                ...data,
                paid_amount: formattedAmount,
                payment: {
                    ...data.payment,
                    amount: formattedAmount,
                },
            };
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <Heading title="Create Purchase" className="mb-8" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Purchase Information</SectionTitle>
                                    <Separator />
                                </SectionHeader>
                                <SectionContent>
                                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="purchase_date">
                                                Purchase Date <span className="-ml-1 text-red-500">*</span>
                                            </FieldLabel>
                                            <DatePicker
                                                id="purchase_date"
                                                value={purchaseDate}
                                                onChange={(date) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        purchase_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                                    }))
                                                }
                                                aria-invalid={Boolean(form.errors.purchase_date)}
                                            />
                                            <FieldError errors={[{ message: form.errors.purchase_date }]} />
                                        </Field>

                                        <div className="hidden md:block" />

                                        <Field>
                                            <FieldLabel htmlFor="outlet_id">
                                                Outlet <span className="-ml-1 text-red-500">*</span>
                                            </FieldLabel>
                                            <Combobox
                                                items={outlets}
                                                value={selectedOutlet}
                                                onValueChange={(outlet) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        outlet_id: outlet?.id.toString() ?? '',
                                                    }))
                                                }
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
                                            <FieldError errors={[{ message: form.errors.outlet_id }]} />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="supplier_party_id">
                                                Supplier <span className="-ml-1 text-red-500">*</span>
                                            </FieldLabel>
                                            <Combobox
                                                items={suppliers}
                                                value={selectedSupplier}
                                                onValueChange={(supplier) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        supplier_party_id: supplier?.id.toString() ?? '',
                                                    }))
                                                }
                                                itemToStringLabel={(supplier) => supplier.name}
                                                itemToStringValue={(supplier) => supplier.id.toString()}
                                            >
                                                <ComboboxInput
                                                    id="supplier_party_id"
                                                    placeholder="Select supplier"
                                                    className="w-full"
                                                    showClear
                                                    aria-invalid={Boolean(form.errors.supplier_party_id)}
                                                />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>No supplier found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(supplier) => (
                                                            <ComboboxItem key={supplier.id} value={supplier}>
                                                                {supplier.name}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            <FieldError errors={[{ message: form.errors.supplier_party_id }]} />
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel htmlFor="note">Note</FieldLabel>
                                            <Textarea
                                                id="note"
                                                value={form.data.note}
                                                onChange={(event) => form.setData('note', event.target.value)}
                                                aria-invalid={Boolean(form.errors.note)}
                                                placeholder="Purchase notes..."
                                                className="min-h-20 resize-none"
                                            />
                                            <FieldError errors={[{ message: form.errors.note }]} />
                                        </Field>
                                    </FieldGroup>
                                </SectionContent>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Purchase Items</SectionTitle>
                                    <Separator />
                                </SectionHeader>

                                <SectionContent>
                                    <PurchaseItemsTable
                                        items={form.data.items}
                                        products={products}
                                        errors={form.errors}
                                        onItemRemove={handlePurchaseItemRemove}
                                        onItemChange={handlePurchaseItemChange}
                                    />
                                </SectionContent>

                                <div className="flex justify-center">
                                    <Button type="button" variant="outline" size="sm" onClick={handlePurchaseItemAdd}>
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
                                    <FieldGroup className="grid gap-4 md:grid-cols-3">
                                        <Field>
                                            <FieldLabel htmlFor="payment_date">
                                                Payment Date{hasPayment && <span className="-ml-1 text-red-500">*</span>}
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
                                            <FieldError errors={[{ message: form.errors['payment.payment_date'] }]} />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="payment_method">
                                                Method{hasPayment && <span className="-ml-1 text-red-500">*</span>}
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
                                            <FieldError errors={[{ message: form.errors['payment.payment_method'] }]} />
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
                                                        paid_amount: event.target.value,
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
                                            <FieldError errors={[{ message: form.errors['payment.amount'] }]} />
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
                                            <FieldError errors={[{ message: form.errors['payment.reference_no'] }]} />
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
                                            <FieldError errors={[{ message: form.errors['payment.note'] }]} />
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
                                                <label htmlFor="transport_cost" className="text-sm text-muted-foreground">
                                                    Transport Cost
                                                </label>
                                                <Input
                                                    id="transport_cost"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={form.data.transport_cost}
                                                    onChange={(event) => form.setData('transport_cost', event.target.value)}
                                                    onBlur={(event) => form.setData('transport_cost', formatDecimal(event.target.value))}
                                                    className="no-number-spinner h-9 w-36 text-right"
                                                    aria-invalid={Boolean(form.errors.transport_cost)}
                                                />
                                            </div>
                                            {form.errors.transport_cost && (
                                                <div className="text-right text-xs text-red-500">{form.errors.transport_cost}</div>
                                            )}

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <label htmlFor="labour_cost" className="text-sm text-muted-foreground">
                                                    Labour Cost
                                                </label>
                                                <Input
                                                    id="labour_cost"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={form.data.labour_cost}
                                                    onChange={(event) => form.setData('labour_cost', event.target.value)}
                                                    onBlur={(event) => form.setData('labour_cost', formatDecimal(event.target.value))}
                                                    className="no-number-spinner h-9 w-36 text-right"
                                                    aria-invalid={Boolean(form.errors.labour_cost)}
                                                />
                                            </div>
                                            {form.errors.labour_cost && (
                                                <div className="text-right text-xs text-red-500">{form.errors.labour_cost}</div>
                                            )}

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <label htmlFor="other_cost" className="text-sm text-muted-foreground">
                                                    Other Cost
                                                </label>
                                                <Input
                                                    id="other_cost"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={form.data.other_cost}
                                                    onChange={(event) => form.setData('other_cost', event.target.value)}
                                                    onBlur={(event) => form.setData('other_cost', formatDecimal(event.target.value))}
                                                    className="no-number-spinner h-9 w-36 text-right"
                                                    aria-invalid={Boolean(form.errors.other_cost)}
                                                />
                                            </div>
                                            {form.errors.other_cost && (
                                                <div className="text-right text-xs text-red-500">{form.errors.other_cost}</div>
                                            )}

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
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Paid Amount</span>
                                                <span className="w-36 pr-3 text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(paidAmount)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Due Amount</span>
                                                <span
                                                    className={
                                                        'w-36 pr-3 text-right text-sm font-semibold tabular-nums ' +
                                                        (paymentStatus === 'paid'
                                                            ? 'text-emerald-600'
                                                            : paymentStatus === 'partial'
                                                              ? 'text-amber-600'
                                                              : 'text-red-600')
                                                    }
                                                >
                                                    {formatCurrency(due)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <span className="text-sm text-muted-foreground">Payment Status</span>
                                                <span className="flex w-36 justify-end">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            paymentStatus === 'paid'
                                                                ? 'border-transparent bg-emerald-100 text-emerald-800'
                                                                : paymentStatus === 'partial'
                                                                  ? 'border-transparent bg-amber-100 text-amber-800'
                                                                  : 'border-transparent bg-red-100 text-red-800'
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
                                    {form.processing ? 'Saving...' : 'Create Purchase'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
