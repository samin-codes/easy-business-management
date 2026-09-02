import { Head, Link, router, useForm } from '@inertiajs/react';
import { format, isValid, parseISO } from 'date-fns';
import { Plus, Save, Trash2 } from 'lucide-react';
import OpeningStockController from '@/actions/App/Http/Controllers/OpeningStockController';
import Heading from '@/components/heading';
import { Action } from '@/components/table-actions';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDecimal, formatQuantity } from '@/lib/utils';
import InventoryNavigation from '@/pages/inventory/components/inventory-navigation';
import { index as inventoryIndex } from '@/routes/inventory';
import { create, index } from '@/routes/opening-stocks';
import type { BreadcrumbItem, Outlet, Product } from '@/types';

type OpeningStockItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_cost: string;
    note: string;
};

type OpeningStockFormData = {
    outlet_id: string;
    opening_date: string;
    note: string;
    items: OpeningStockItemFormData[];
};

function createOpeningStockItem(): OpeningStockItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_variant_id: '',
        unit_of_measurement_id: '',
        quantity: '',
        unit_cost: '',
        note: '',
    };
}

export default function OpeningStocksCreate({
    outlets,
    products,
    selectedOutletId,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: Product[];
    selectedOutletId?: number | null;
}) {
    const form = useForm<OpeningStockFormData>({
        outlet_id: selectedOutletId?.toString() ?? '',
        opening_date: format(new Date(), 'yyyy-MM-dd'),
        note: '',
        items: [createOpeningStockItem()],
    });

    const variants = products.flatMap((product) => product.product_variants ?? []);

    const selectedDate = parseISO(form.data.opening_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Opening Stock', href: index().url },
        { title: 'Create', href: create().url },
    ];

    const total = form.data.items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
    }, 0);

    const updateItem = (uid: string, patch: Partial<OpeningStockItemFormData>) => {
        form.setData(
            'items',
            form.data.items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
        );
    };

    const handleOutletChange = (value: string) => {
        form.setData((data) => ({
            ...data,
            outlet_id: value,
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
                only: ['products', 'selectedOutletId'],
            },
        );
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            items: data.items.map(({ uid, ...item }) => {
                void uid;

                return item;
            }),
        }));

        form.submit(OpeningStockController.store(), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Opening Stock" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <InventoryNavigation active="opening" />

                    <Heading title="New Opening Stock" description="Record the initial inventory balance for products at an outlet." />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Opening Stock Information</SectionTitle>
                                <Separator />
                            </SectionHeader>

                            <SectionContent>
                                <FieldGroup className="grid gap-5 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel>Outlet *</FieldLabel>

                                        <Select value={form.data.outlet_id} onValueChange={handleOutletChange}>
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

                                    <Field>
                                        <FieldLabel>Opening Date *</FieldLabel>

                                        <DatePicker
                                            id="opening-date"
                                            value={isValid(selectedDate) ? selectedDate : undefined}
                                            onChange={(date) => form.setData('opening_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                            aria-invalid={Boolean(form.errors.opening_date)}
                                        />

                                        <FieldError>{form.errors.opening_date}</FieldError>
                                    </Field>

                                    <Field className="md:col-span-2">
                                        <FieldLabel>Note</FieldLabel>

                                        <Textarea
                                            value={form.data.note}
                                            onChange={(event) => form.setData('note', event.target.value)}
                                            placeholder="Optional note"
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
                                        onClick={() => form.setData('items', [...form.data.items, createOpeningStockItem()])}
                                    >
                                        <Plus />
                                        Add Item
                                    </Button>
                                </div>

                                <Separator />
                            </SectionHeader>

                            <SectionContent>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="table-hover table min-w-280">
                                        <thead>
                                            <tr>
                                                <th className="min-w-80">Product / Variant *</th>
                                                <th className="w-36">Unit *</th>
                                                <th className="w-28 text-right">Qty *</th>
                                                <th className="w-36 text-right">Unit Cost *</th>
                                                <th className="w-36 text-right">Base Qty</th>
                                                <th className="w-36 text-right">Value</th>
                                                <th className="min-w-56">Item Note</th>
                                                <th className="w-12">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {form.data.items.map((item, index) => {
                                                const variant =
                                                    variants.find((candidate) => candidate.id.toString() === item.product_variant_id) ??
                                                    null;

                                                const product = products.find((candidate) => candidate.id === variant?.product_id);

                                                const conversions = product?.active_unit_conversions ?? [];

                                                const conversion =
                                                    conversions.find(
                                                        (candidate) =>
                                                            candidate.unit_of_measurement_id.toString() === item.unit_of_measurement_id,
                                                    ) ?? null;

                                                const baseQuantity =
                                                    (Number(item.quantity) || 0) * (Number(conversion?.conversion_factor_to_base) || 0);

                                                const lineValue = (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);

                                                const isIneligible = variant?.has_inventory_history === true;

                                                return (
                                                    <tr key={item.uid}>
                                                        <td>
                                                            <Combobox
                                                                items={variants}
                                                                value={variant}
                                                                onValueChange={(value) => {
                                                                    const selectedProduct = products.find(
                                                                        (candidate) => candidate.id === value?.product_id,
                                                                    );

                                                                    updateItem(item.uid, {
                                                                        product_variant_id: value?.id.toString() ?? '',
                                                                        unit_of_measurement_id:
                                                                            selectedProduct?.default_purchase_unit_conversion?.unit_of_measurement_id.toString() ??
                                                                            selectedProduct?.base_unit_conversion?.unit_of_measurement_id.toString() ??
                                                                            '',
                                                                        quantity: '',
                                                                        unit_cost: '',
                                                                    });
                                                                }}
                                                                itemToStringLabel={(value) => value.purchase_label}
                                                                itemToStringValue={(value) => value.id.toString()}
                                                            >
                                                                <ComboboxInput
                                                                    placeholder="Select product / variant"
                                                                    showClear
                                                                    aria-invalid={Boolean(form.errors[`items.${index}.product_variant_id`])}
                                                                />

                                                                <ComboboxContent className="w-max min-w-(--anchor-width)">
                                                                    <ComboboxEmpty>No product variant found.</ComboboxEmpty>

                                                                    <ComboboxList>
                                                                        {(value) => (
                                                                            <ComboboxItem
                                                                                key={value.id}
                                                                                value={value}
                                                                                disabled={value.has_inventory_history}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <span>{value.purchase_label}</span>

                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        {value.has_inventory_history
                                                                                            ? 'Inventory history already exists'
                                                                                            : 'Eligible for opening stock'}
                                                                                    </span>
                                                                                </div>
                                                                            </ComboboxItem>
                                                                        )}
                                                                    </ComboboxList>
                                                                </ComboboxContent>
                                                            </Combobox>

                                                            <FieldError>{form.errors[`items.${index}.product_variant_id`]}</FieldError>

                                                            {isIneligible && (
                                                                <p className="mt-1 text-xs text-destructive">
                                                                    This variant already has inventory history at this outlet.
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td>
                                                            <Combobox
                                                                items={conversions}
                                                                value={conversion}
                                                                onValueChange={(value) =>
                                                                    updateItem(item.uid, {
                                                                        unit_of_measurement_id:
                                                                            value?.unit_of_measurement_id.toString() ?? '',
                                                                    })
                                                                }
                                                                itemToStringLabel={(value) => value.unit_of_measurement?.name ?? ''}
                                                                itemToStringValue={(value) => value.unit_of_measurement_id.toString()}
                                                                disabled={!variant}
                                                            >
                                                                <ComboboxInput
                                                                    placeholder="Unit"
                                                                    disabled={!variant}
                                                                    showClear
                                                                    aria-invalid={Boolean(
                                                                        form.errors[`items.${index}.unit_of_measurement_id`],
                                                                    )}
                                                                />

                                                                <ComboboxContent>
                                                                    <ComboboxEmpty>No unit found.</ComboboxEmpty>

                                                                    <ComboboxList>
                                                                        {(value) => (
                                                                            <ComboboxItem key={value.id} value={value}>
                                                                                {value.unit_of_measurement?.name}
                                                                            </ComboboxItem>
                                                                        )}
                                                                    </ComboboxList>
                                                                </ComboboxContent>
                                                            </Combobox>

                                                            <FieldError>{form.errors[`items.${index}.unit_of_measurement_id`]}</FieldError>
                                                        </td>

                                                        <td>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                value={item.quantity}
                                                                onChange={(event) =>
                                                                    updateItem(item.uid, {
                                                                        quantity: event.target.value,
                                                                    })
                                                                }
                                                                className="no-number-spinner text-right"
                                                                aria-invalid={Boolean(form.errors[`items.${index}.quantity`])}
                                                            />

                                                            <FieldError>{form.errors[`items.${index}.quantity`]}</FieldError>
                                                        </td>

                                                        <td>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                value={item.unit_cost}
                                                                onChange={(event) =>
                                                                    updateItem(item.uid, {
                                                                        unit_cost: event.target.value,
                                                                    })
                                                                }
                                                                onBlur={() =>
                                                                    updateItem(item.uid, {
                                                                        unit_cost: formatDecimal(item.unit_cost),
                                                                    })
                                                                }
                                                                className="no-number-spinner text-right"
                                                                aria-invalid={Boolean(form.errors[`items.${index}.unit_cost`])}
                                                            />

                                                            <FieldError>{form.errors[`items.${index}.unit_cost`]}</FieldError>
                                                        </td>

                                                        <td className="text-right tabular-nums">
                                                            {baseQuantity ? formatQuantity(baseQuantity) : '-'}
                                                        </td>

                                                        <td className="text-right font-medium tabular-nums">
                                                            {lineValue ? formatCurrency(lineValue) : '-'}
                                                        </td>

                                                        <td>
                                                            <Textarea
                                                                value={item.note}
                                                                onChange={(event) =>
                                                                    updateItem(item.uid, {
                                                                        note: event.target.value,
                                                                    })
                                                                }
                                                                rows={1}
                                                                placeholder="Optional"
                                                            />

                                                            <FieldError>{form.errors[`items.${index}.note`]}</FieldError>
                                                        </td>

                                                        <td>
                                                            {form.data.items.length > 1 && (
                                                                <Action
                                                                    name="remove"
                                                                    label="Remove item"
                                                                    icon={Trash2}
                                                                    color="danger"
                                                                    appearance="icon-button"
                                                                    onClick={() =>
                                                                        form.setData(
                                                                            'items',
                                                                            form.data.items.filter(
                                                                                (candidate) => candidate.uid !== item.uid,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>

                                        <tfoot>
                                            <tr className="table-light border-t">
                                                <td colSpan={5} className="text-right font-medium text-muted-foreground">
                                                    Total inventory value
                                                </td>

                                                <td className="text-right font-semibold tabular-nums">{formatCurrency(total)}</td>

                                                <td colSpan={2} />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <FieldError>{form.errors.items}</FieldError>
                            </SectionContent>
                        </Section>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" asChild>
                                <Link href={index()}>Cancel</Link>
                            </Button>

                            <Button type="submit" disabled={form.processing}>
                                <Save />
                                {form.processing ? 'Saving...' : 'Save Opening Stock'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
