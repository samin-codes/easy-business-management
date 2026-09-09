import { Head, Link, router, useForm } from '@inertiajs/react';
import { format as formatDate, parseISO } from 'date-fns';
import { Plus, Save, Trash2, X } from 'lucide-react';
import OpeningStockController from '@/actions/App/Http/Controllers/OpeningStockController';
import Heading from '@/components/heading';
import { Action } from '@/components/table-actions';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDecimal, formatQuantity } from '@/lib/utils';
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
    opening_date: string;
    outlet_id: string;
    note: string;
    items: OpeningStockItemFormData[];
};

function createItemFormData(): OpeningStockItemFormData {
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
    const form = useForm<OpeningStockFormData>(() => ({
        opening_date: formatDate(new Date(), 'yyyy-MM-dd'),
        outlet_id: selectedOutletId?.toString() ?? '',
        note: '',
        items: [createItemFormData()],
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Opening Stock', href: index().url },
        { title: 'Create', href: create().url },
    ];

    const selectedOutlet = outlets.find((outlet) => outlet.id.toString() === form.data.outlet_id) ?? null;

    const productVariants = products.flatMap((product) => product.product_variants ?? []);

    const openingDate = form.data.opening_date ? parseISO(form.data.opening_date) : undefined;

    const totalAmount = form.data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0), 0);

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
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
    }

    const addItem = () => {
        form.setData((data) => ({
            ...data,
            items: [...data.items,  createItemFormData()],
        }));
    };

    const removeItem = (uid: string) => {
        form.setData((data) => ({
            ...data,
            items: data.items.filter((item) => item.uid !== uid),
        }));
    };

    const updateItem = (uid: string, patch: Partial<OpeningStockItemFormData>) => {
        form.setData((data) => ({
            ...data,
            items: data.items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
        }));
    };

    const handleOutletChange = (outletId: string) => {
        form.setData((data) => ({
            ...data,
            outlet_id: outletId,
            items: data.items.map((item) => ({
                ...item,
                product_variant_id: '',
                unit_of_measurement_id: '',
                quantity: '',
                unit_cost: '',
            })),
        }));

        router.get(
            create().url,
            { outlet_id: Number(outletId) },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['products', 'selectedOutletId'],
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Opening Stock" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Heading title="Create Opening Stock" className="mb-8" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Section>
                            <SectionContent>
                                <FieldGroup className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="opening_date">
                                            Opening Date <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <DatePicker
                                            id="opening_date"
                                            value={openingDate}
                                            onChange={(date) =>
                                                form.setData((data) => ({
                                                    ...data,
                                                    opening_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                                }))
                                            }
                                            aria-invalid={Boolean(form.errors.opening_date)}
                                        />

                                        <FieldError
                                            errors={[
                                                {
                                                    message: form.errors.opening_date,
                                                },
                                            ]}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="outlet_id">
                                            Outlet <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <Combobox
                                            items={outlets}
                                            value={selectedOutlet}
                                            onValueChange={(outlet) => handleOutletChange(outlet?.id.toString() ?? '')}
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

                                    <Field className="md:col-span-2">
                                        <FieldLabel htmlFor="note">Note</FieldLabel>

                                        <Textarea
                                            id="note"
                                            value={form.data.note}
                                            onChange={(event) => form.setData('note', event.target.value)}
                                            aria-invalid={Boolean(form.errors.note)}
                                            placeholder="Optional note"
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
                                <SectionTitle>Products</SectionTitle>

                                <Separator />
                            </SectionHeader>

                            <SectionContent>
                                <div className="ui-table">
                                    <div className="ui-table-main">
                                        <div className="ui-table-content">
                                            <table className="ui-table-element min-w-280">
                                                <thead>
                                                    <tr className="ui-table-row">
                                                        <th className="ui-table-header-cell min-w-80">
                                                            Product / Variant <span className="text-red-500">*</span>
                                                        </th>

                                                        <th className="ui-table-header-cell w-36">
                                                            Unit <span className="text-red-500">*</span>
                                                        </th>

                                                        <th className="ui-table-header-cell w-28 text-right">
                                                            Qty <span className="text-red-500">*</span>
                                                        </th>

                                                        <th className="ui-table-header-cell w-36 text-right">
                                                            Unit Cost <span className="text-red-500">*</span>
                                                        </th>

                                                        <th className="ui-table-header-cell w-36 text-right">Base Qty</th>
                                                        <th className="ui-table-header-cell w-36 text-right">Value</th>
                                                        <th className="ui-table-header-cell min-w-56">Item Note</th>
                                                        <th className="ui-table-header-cell ui-table-empty-header-cell w-12 text-center">
                                                            <span className="sr-only">Actions</span>
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {form.data.items.map((item, itemIndex) => {
                                                        const selectedProductVariant =
                                                            productVariants.find(
                                                                (productVariant) =>
                                                                    productVariant.id.toString() === item.product_variant_id,
                                                            ) ?? null;

                                                        const selectedProduct = products.find(
                                                            (product) => product.id === selectedProductVariant?.product_id,
                                                        );

                                                        const availableConversions = selectedProduct?.active_unit_conversions ?? [];

                                                        const selectedUnitConversion =
                                                            availableConversions.find(
                                                                (conversion) =>
                                                                    conversion.unit_of_measurement_id.toString() ===
                                                                    item.unit_of_measurement_id,
                                                            ) ?? null;

                                                        const baseQuantity =
                                                            (Number(item.quantity) || 0) *
                                                            (Number(selectedUnitConversion?.conversion_factor_to_base) || 0);

                                                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);

                                                        const hasInventoryHistory = selectedProductVariant?.has_inventory_history === true;

                                                        return (
                                                            <tr key={item.uid} className="ui-table-row">
                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            <Combobox
                                                                                items={productVariants}
                                                                                value={selectedProductVariant}
                                                                                onValueChange={(productVariant) => {
                                                                                    const product = products.find(
                                                                                        (currentProduct) =>
                                                                                            currentProduct.id ===
                                                                                            productVariant?.product_id,
                                                                                    );

                                                                                    updateItem(item.uid, {
                                                                                        product_variant_id:
                                                                                            productVariant?.id.toString() ?? '',
                                                                                        unit_of_measurement_id:
                                                                                            product?.default_purchase_unit_conversion?.unit_of_measurement_id.toString() ??
                                                                                            product?.base_unit_conversion?.unit_of_measurement_id.toString() ??
                                                                                            '',
                                                                                        quantity: '',
                                                                                        unit_cost: '',
                                                                                    });
                                                                                }}
                                                                                itemToStringLabel={(productVariant) =>
                                                                                    productVariant.purchase_label
                                                                                }
                                                                                itemToStringValue={(productVariant) =>
                                                                                    productVariant.id.toString()
                                                                                }
                                                                            >
                                                                                <ComboboxInput
                                                                                    placeholder="Select product / variant"
                                                                                    showClear
                                                                                    aria-invalid={Boolean(
                                                                                        form.errors[
                                                                                            `items.${itemIndex}.product_variant_id`
                                                                                        ],
                                                                                    )}
                                                                                />

                                                                                <ComboboxContent className="w-max min-w-(--anchor-width)">
                                                                                    <ComboboxEmpty>No product variant found.</ComboboxEmpty>

                                                                                    <ComboboxList>
                                                                                        {(productVariant) => (
                                                                                            <ComboboxItem
                                                                                                key={productVariant.id}
                                                                                                value={productVariant}
                                                                                                disabled={
                                                                                                    productVariant.has_inventory_history
                                                                                                }
                                                                                            >
                                                                                                <div className="flex flex-col">
                                                                                                    <span>
                                                                                                        {productVariant.purchase_label}
                                                                                                    </span>

                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        {productVariant.has_inventory_history
                                                                                                            ? 'Inventory history already exists'
                                                                                                            : 'Eligible for opening stock'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </ComboboxItem>
                                                                                        )}
                                                                                    </ComboboxList>
                                                                                </ComboboxContent>
                                                                            </Combobox>

                                                                            {hasInventoryHistory && (
                                                                                <p className="mt-1 text-xs text-destructive">
                                                                                    This variant already has inventory history at this
                                                                                    outlet.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            <Combobox
                                                                                items={availableConversions}
                                                                                value={selectedUnitConversion}
                                                                                onValueChange={(conversion) =>
                                                                                    updateItem(item.uid, {
                                                                                        unit_of_measurement_id:
                                                                                            conversion?.unit_of_measurement_id.toString() ??
                                                                                            '',
                                                                                    })
                                                                                }
                                                                                itemToStringLabel={(conversion) =>
                                                                                    conversion.unit_of_measurement?.name ?? ''
                                                                                }
                                                                                itemToStringValue={(conversion) =>
                                                                                    conversion.unit_of_measurement_id.toString()
                                                                                }
                                                                                disabled={!selectedProductVariant}
                                                                            >
                                                                                <ComboboxInput
                                                                                    placeholder="Unit"
                                                                                    disabled={!selectedProductVariant}
                                                                                    showClear
                                                                                    aria-invalid={Boolean(
                                                                                        form.errors[
                                                                                            `items.${itemIndex}.unit_of_measurement_id`
                                                                                        ],
                                                                                    )}
                                                                                />

                                                                                <ComboboxContent>
                                                                                    <ComboboxEmpty>No unit found.</ComboboxEmpty>

                                                                                    <ComboboxList>
                                                                                        {(conversion) => (
                                                                                            <ComboboxItem
                                                                                                key={conversion.id}
                                                                                                value={conversion}
                                                                                            >
                                                                                                {conversion.unit_of_measurement?.name}
                                                                                            </ComboboxItem>
                                                                                        )}
                                                                                    </ComboboxList>
                                                                                </ComboboxContent>
                                                                            </Combobox>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
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
                                                                                aria-invalid={Boolean(
                                                                                    form.errors[`items.${itemIndex}.quantity`],
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
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
                                                                                aria-invalid={Boolean(
                                                                                    form.errors[`items.${itemIndex}.unit_cost`],
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right tabular-nums">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {baseQuantity ? formatQuantity(baseQuantity) : '-'}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right font-medium tabular-nums">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {lineTotal ? formatCurrency(lineTotal) : '-'}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            <Textarea
                                                                                value={item.note}
                                                                                onChange={(event) =>
                                                                                    updateItem(item.uid, {
                                                                                        note: event.target.value,
                                                                                    })
                                                                                }
                                                                                rows={1}
                                                                                placeholder="Optional note"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right">
                                                                    <div className="ui-table-actions">
                                                                        {form.data.items.length > 1 && (
                                                                            <Action
                                                                                name="remove"
                                                                                label="Remove item"
                                                                                icon={Trash2}
                                                                                color="danger"
                                                                                appearance="icon-button"
                                                                                onClick={() => removeItem(item.uid)}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>

                                                <tfoot>
                                                    <tr className="ui-table-row bg-muted/30">
                                                        <td
                                                            colSpan={5}
                                                            className="ui-table-cell text-right font-medium text-muted-foreground"
                                                        >
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text py-2">Total inventory value</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right font-semibold tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text py-2">{formatCurrency(totalAmount)}</div>
                                                            </div>
                                                        </td>

                                                        <td colSpan={2} className="ui-table-cell" />
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <FieldError>{form.errors.items}</FieldError>
                            </SectionContent>

                            <div className="flex justify-center">
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="size-4" />
                                    Add Product
                                </Button>
                            </div>
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

                                {form.processing ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
