import { Head, Link, router, useForm } from '@inertiajs/react';
import { format as formatDate, parseISO } from 'date-fns';
import { Plus, Save, Trash2, X } from 'lucide-react';
import StockTransferController from '@/actions/App/Http/Controllers/StockTransferController';
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
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index as inventoryIndex } from '@/routes/inventory';
import { create, index } from '@/routes/stock-transfers';
import type { BreadcrumbItem, Outlet, Product } from '@/types';

type TransferItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    note: string;
};

type TransferFormData = {
    transfer_date: string;
    source_outlet_id: string;
    destination_outlet_id: string;
    note: string;
    items: TransferItemFormData[];
};

function createItemFormData(): TransferItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_variant_id: '',
        unit_of_measurement_id: '',
        quantity: '',
        note: '',
    };
}

export default function TransfersCreate({
    outlets,
    products,
    selectedSourceOutletId,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: Product[];
    selectedSourceOutletId?: number | null;
}) {
    const form = useForm<TransferFormData>(() => ({
        transfer_date: formatDate(new Date(), 'yyyy-MM-dd'),
        source_outlet_id: selectedSourceOutletId?.toString() ?? '',
        destination_outlet_id: '',
        note: '',
        items: [createItemFormData()],
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Transfers', href: index().url },
        { title: 'Create', href: create().url },
    ];

    const selectedSourceOutlet = outlets.find((outlet) => outlet.id.toString() === form.data.source_outlet_id) ?? null;

    const availableDestinationOutlets = outlets.filter((outlet) => outlet.id.toString() !== form.data.source_outlet_id);

    const selectedDestinationOutlet =
        availableDestinationOutlets.find((outlet) => outlet.id.toString() === form.data.destination_outlet_id) ?? null;

    const productVariants = products.flatMap((product) => product.product_variants ?? []);

    const transferDate = form.data.transfer_date ? parseISO(form.data.transfer_date) : undefined;

    const totalAmount = form.data.items.reduce((sum, item) => {
        const selectedProductVariant = productVariants.find((productVariant) => productVariant.id.toString() === item.product_variant_id);

        const selectedProduct = products.find((product) => product.id === selectedProductVariant?.product_id);

        const selectedUnitConversion = selectedProduct?.active_unit_conversions?.find(
            (conversion) => conversion.unit_of_measurement_id.toString() === item.unit_of_measurement_id,
        );

        const baseQuantity = (Number(item.quantity) || 0) * (Number(selectedUnitConversion?.conversion_factor_to_base) || 0);

        return sum + baseQuantity * (Number(selectedProductVariant?.average_cost) || 0);
    }, 0);

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            items: data.items.map(({ uid, ...item }) => {
                void uid;

                return item;
            }),
        }));

        form.submit(StockTransferController.store(), {
            preserveScroll: true,
        });
    }

    const addItem = () => {
        form.setData((data) => ({
            ...data,
            items: [...data.items, createItemFormData()],
        }));
    };

    const removeItem = (uid: string) => {
        form.setData((data) => ({
            ...data,
            items: data.items.filter((item) => item.uid !== uid),
        }));
    };

    const updateItem = (uid: string, patch: Partial<TransferItemFormData>) => {
        form.setData((data) => ({
            ...data,
            items: data.items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
        }));
    };

    const handleSourceOutletChange = (sourceOutletId: string) => {
        form.setData((data) => ({
            ...data,
            source_outlet_id: sourceOutletId,
            destination_outlet_id: data.destination_outlet_id === sourceOutletId ? '' : data.destination_outlet_id,
            items: data.items.map((item) => ({
                ...item,
                product_variant_id: '',
                unit_of_measurement_id: '',
                quantity: '',
            })),
        }));

        router.get(
            create().url,
            {
                outlet_id: Number(sourceOutletId),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['products', 'selectedSourceOutletId'],
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Stock Transfer" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Heading title="Create Stock Transfer" className="mb-8" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Section>
                            <SectionContent>
                                <FieldGroup className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="transfer_date">
                                            Transfer Date <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <DatePicker
                                            id="transfer_date"
                                            value={transferDate}
                                            onChange={(date) =>
                                                form.setData((data) => ({
                                                    ...data,
                                                    transfer_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                                }))
                                            }
                                            aria-invalid={Boolean(form.errors.transfer_date)}
                                        />

                                        <FieldError
                                            errors={[
                                                {
                                                    message: form.errors.transfer_date,
                                                },
                                            ]}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="source_outlet_id">
                                            From Outlet <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <Combobox
                                            items={outlets}
                                            value={selectedSourceOutlet}
                                            onValueChange={(outlet) => handleSourceOutletChange(outlet?.id.toString() ?? '')}
                                            itemToStringLabel={(outlet) => outlet.name}
                                            itemToStringValue={(outlet) => outlet.id.toString()}
                                        >
                                            <ComboboxInput
                                                id="source_outlet_id"
                                                placeholder="Select source outlet"
                                                className="w-full"
                                                showClear
                                                aria-invalid={Boolean(form.errors.source_outlet_id)}
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
                                                    message: form.errors.source_outlet_id,
                                                },
                                            ]}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="destination_outlet_id">
                                            To Outlet <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <Combobox
                                            items={availableDestinationOutlets}
                                            value={selectedDestinationOutlet}
                                            onValueChange={(outlet) =>
                                                form.setData((data) => ({ ...data, destination_outlet_id: outlet?.id.toString() ?? '' }))
                                            }
                                            itemToStringLabel={(outlet) => outlet.name}
                                            itemToStringValue={(outlet) => outlet.id.toString()}
                                        >
                                            <ComboboxInput
                                                id="destination_outlet_id"
                                                placeholder="Select destination outlet"
                                                className="w-full"
                                                showClear
                                                aria-invalid={Boolean(form.errors.destination_outlet_id)}
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
                                                    message: form.errors.destination_outlet_id,
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
                                            <table className="ui-table-element min-w-260">
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

                                                        <th className="ui-table-header-cell w-36 text-right">Avg. Cost</th>
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

                                                        const averageCost = Number(selectedProductVariant?.average_cost) || 0;

                                                        const lineTotal = baseQuantity * averageCost;

                                                        const hasNoAvailableStock = Number(selectedProductVariant?.available_quantity) <= 0;

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
                                                                                                    Number(
                                                                                                        productVariant.available_quantity,
                                                                                                    ) <= 0
                                                                                                }
                                                                                            >
                                                                                                <div className="flex flex-col">
                                                                                                    <span>
                                                                                                        {productVariant.purchase_label}
                                                                                                    </span>

                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        {`Available: ${formatQuantity(
                                                                                                            productVariant.available_quantity ??
                                                                                                                0,
                                                                                                        )} · Avg: ${formatCurrency(
                                                                                                            productVariant.average_cost ??
                                                                                                                0,
                                                                                                        )}`}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </ComboboxItem>
                                                                                        )}
                                                                                    </ComboboxList>
                                                                                </ComboboxContent>
                                                                            </Combobox>

                                                                            <FieldError>
                                                                                {form.errors[`items.${itemIndex}.product_variant_id`]}
                                                                            </FieldError>

                                                                            {hasNoAvailableStock && (
                                                                                <p className="mt-1 text-xs text-destructive">
                                                                                    This variant has no available stock.
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

                                                                            <FieldError>
                                                                                {form.errors[`items.${itemIndex}.unit_of_measurement_id`]}
                                                                            </FieldError>
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

                                                                            <FieldError>
                                                                                {form.errors[`items.${itemIndex}.quantity`]}
                                                                            </FieldError>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right tabular-nums">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {selectedProductVariant
                                                                                ? formatCurrency(selectedProductVariant.average_cost ?? 0)
                                                                                : '-'}
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
                                                                            {baseQuantity ? formatCurrency(lineTotal) : '-'}
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

                                                                            <FieldError>
                                                                                {form.errors[`items.${itemIndex}.note`]}
                                                                            </FieldError>
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
