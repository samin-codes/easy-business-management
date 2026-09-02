import { Head, Link, router, useForm } from '@inertiajs/react';
import { format, isValid, parseISO } from 'date-fns';
import { Plus, Save } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Option, Outlet } from '@/types';
import InventoryNavigation from './inventory-navigation';
import OperationItemsTable from './operation-items-table';
import type { OperationItemFormData, OperationProduct } from './operation-items-table';

type Kind = 'opening' | 'adjustment' | 'transfer';
type FormData = {
    outlet_id: string;
    source_outlet_id: string;
    destination_outlet_id: string;
    transaction_date: string;
    type: 'in' | 'out';
    reason: string;
    note: string;
    items: OperationItemFormData[];
};

const blankItem = (): OperationItemFormData => ({
    uid: crypto.randomUUID(),
    product_variant_id: '',
    unit_of_measurement_id: '',
    quantity: '',
    unit_cost: '',
    note: '',
});

export default function OperationCreateForm({
    kind,
    outlets,
    products,
    reasons = [],
    initialOutletId,
    storeHref,
    indexHref,
}: {
    kind: Kind;
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: OperationProduct[];
    reasons?: Array<Option & { types?: Array<'in' | 'out'>; allowed_types?: Array<'in' | 'out'> }>;
    initialOutletId?: number | null;
    storeHref: string;
    indexHref: string;
}) {
    const labels =
        kind === 'opening'
            ? { title: 'New Opening Stock', noun: 'Opening Stock' }
            : kind === 'adjustment'
              ? { title: 'New Stock Adjustment', noun: 'Adjustment' }
              : { title: 'New Stock Transfer', noun: 'Transfer' };
    const form = useForm<FormData>({
        outlet_id: initialOutletId?.toString() ?? '',
        source_outlet_id: initialOutletId?.toString() ?? '',
        destination_outlet_id: '',
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        type: 'in',
        reason: '',
        note: '',
        items: [blankItem()],
    });
    const selectedDate = parseISO(form.data.transaction_date);
    const submissionErrors = form.errors as Record<string, string>;
    const dateError =
        kind === 'opening'
            ? submissionErrors.opening_date
            : kind === 'adjustment'
              ? submissionErrors.adjustment_date
              : submissionErrors.transfer_date;
    const visibleReasons = reasons.filter((reason) => (reason.types ?? reason.allowed_types ?? ['in', 'out']).includes(form.data.type));
    const mode = kind === 'adjustment' ? (form.data.type === 'in' ? 'adjustment-in' : 'adjustment-out') : kind;

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        form.transform((data) => {
            const items = data.items.map((formItem) => {
                const item = { ...formItem };

                delete (item as Partial<OperationItemFormData>).uid;

                return item;
            });

            if (kind === 'opening') {
                return { outlet_id: data.outlet_id, opening_date: data.transaction_date, note: data.note, items };
            }

            if (kind === 'adjustment') {
                return {
                    outlet_id: data.outlet_id,
                    adjustment_date: data.transaction_date,
                    type: data.type,
                    reason: data.reason,
                    note: data.note,
                    items,
                };
            }

            return {
                source_outlet_id: data.source_outlet_id,
                destination_outlet_id: data.destination_outlet_id,
                transfer_date: data.transaction_date,
                note: data.note,
                items,
            };
        });
        form.post(storeHref, { preserveScroll: true });
    }

    const updateItem = (uid: string, patch: Partial<OperationItemFormData>) =>
        form.setData(
            'items',
            form.data.items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
        );

    const selectStockOutlet = (field: 'outlet_id' | 'source_outlet_id', value: string) => {
        form.setData((data) => ({
            ...data,
            [field]: value,
            items: data.items.map((item) => ({
                ...item,
                product_variant_id: '',
                unit_of_measurement_id: '',
                quantity: '',
                unit_cost: '',
            })),
        }));
        router.get(
            window.location.pathname,
            { outlet_id: Number(value) },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['products', field === 'outlet_id' ? 'selectedOutletId' : 'selectedSourceOutletId'],
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: indexHref },
        { title: labels.noun, href: indexHref },
        { title: 'Create', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={labels.title} />
            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <InventoryNavigation active={kind === 'opening' ? 'opening' : kind === 'adjustment' ? 'adjustments' : 'transfers'} />
                    <Heading title={labels.title} description="Stock and ledger movements are posted together when you save." />
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <Section>
                            <SectionHeader>
                                <SectionTitle>{labels.noun} Information</SectionTitle>
                                <Separator />
                            </SectionHeader>
                            <SectionContent>
                                <FieldGroup className="grid gap-5 md:grid-cols-2">
                                    {kind === 'transfer' ? (
                                        <>
                                            <Field>
                                                <FieldLabel>From Outlet *</FieldLabel>
                                                <Select
                                                    value={form.data.source_outlet_id}
                                                    onValueChange={(value) => selectStockOutlet('source_outlet_id', value)}
                                                >
                                                    <SelectTrigger aria-invalid={Boolean(form.errors.source_outlet_id)}>
                                                        <SelectValue placeholder="Select source outlet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {outlets.map((outlet) => (
                                                            <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                                {outlet.name} ({outlet.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>{form.errors.source_outlet_id}</FieldError>
                                            </Field>
                                            <Field>
                                                <FieldLabel>To Outlet *</FieldLabel>
                                                <Select
                                                    value={form.data.destination_outlet_id}
                                                    onValueChange={(value) => form.setData('destination_outlet_id', value)}
                                                >
                                                    <SelectTrigger aria-invalid={Boolean(form.errors.destination_outlet_id)}>
                                                        <SelectValue placeholder="Select destination outlet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {outlets
                                                            .filter((outlet) => outlet.id.toString() !== form.data.source_outlet_id)
                                                            .map((outlet) => (
                                                                <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                                    {outlet.name} ({outlet.code})
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>{form.errors.destination_outlet_id}</FieldError>
                                            </Field>
                                        </>
                                    ) : (
                                        <Field>
                                            <FieldLabel>Outlet *</FieldLabel>
                                            <Select
                                                value={form.data.outlet_id}
                                                onValueChange={(value) => selectStockOutlet('outlet_id', value)}
                                            >
                                                <SelectTrigger aria-invalid={Boolean(form.errors.outlet_id)}>
                                                    <SelectValue placeholder="Select outlet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {outlets.map((outlet) => (
                                                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                            {outlet.name} ({outlet.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError>{form.errors.outlet_id}</FieldError>
                                        </Field>
                                    )}
                                    <Field>
                                        <FieldLabel>Date *</FieldLabel>
                                        <DatePicker
                                            id="transaction-date"
                                            value={isValid(selectedDate) ? selectedDate : undefined}
                                            onChange={(date) => form.setData('transaction_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                            aria-invalid={Boolean(dateError)}
                                        />
                                        <FieldError>{dateError}</FieldError>
                                    </Field>
                                    {kind === 'adjustment' && (
                                        <>
                                            <Field>
                                                <FieldLabel>Type *</FieldLabel>
                                                <Select
                                                    value={form.data.type}
                                                    onValueChange={(value: 'in' | 'out') =>
                                                        form.setData((data) => ({
                                                            ...data,
                                                            type: value,
                                                            reason: '',
                                                            items: data.items.map((item) => ({ ...item, unit_cost: '' })),
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger aria-invalid={Boolean(form.errors.type)}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="in">Adjustment In</SelectItem>
                                                        <SelectItem value="out">Adjustment Out</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>{form.errors.type}</FieldError>
                                            </Field>
                                            <Field>
                                                <FieldLabel>Reason *</FieldLabel>
                                                <Select value={form.data.reason} onValueChange={(value) => form.setData('reason', value)}>
                                                    <SelectTrigger aria-invalid={Boolean(form.errors.reason)}>
                                                        <SelectValue placeholder="Select reason" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {visibleReasons.map((reason) => (
                                                            <SelectItem key={reason.value} value={String(reason.value)}>
                                                                {reason.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>{form.errors.reason}</FieldError>
                                            </Field>
                                        </>
                                    )}
                                    <Field className="md:col-span-2">
                                        <FieldLabel>Note</FieldLabel>
                                        <Textarea
                                            value={form.data.note}
                                            onChange={(event) => form.setData('note', event.target.value)}
                                            placeholder="Optional explanation"
                                        />
                                        <FieldError>{form.errors.note}</FieldError>
                                    </Field>
                                </FieldGroup>
                            </SectionContent>
                        </Section>
                        <Section>
                            <SectionHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <SectionTitle>Items</SectionTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => form.setData('items', [...form.data.items, blankItem()])}
                                    >
                                        <Plus />
                                        Add Item
                                    </Button>
                                </div>
                                <Separator />
                            </SectionHeader>
                            <SectionContent>
                                <OperationItemsTable
                                    mode={mode}
                                    items={form.data.items}
                                    products={products}
                                    errors={form.errors}
                                    onChange={updateItem}
                                    onRemove={(uid) =>
                                        form.setData(
                                            'items',
                                            form.data.items.filter((item) => item.uid !== uid),
                                        )
                                    }
                                />
                                <FieldError>{form.errors.items}</FieldError>
                            </SectionContent>
                        </Section>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" asChild>
                                <Link href={indexHref}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                <Save />
                                {form.processing ? 'Saving...' : `Save ${labels.noun}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
