import { Head, Link, router, useForm } from '@inertiajs/react';
import { format as formatDate, parseISO } from 'date-fns';
import { Plus, Save, Trash2, X } from 'lucide-react';
import StockAdjustmentController from '@/actions/App/Http/Controllers/StockAdjustmentController';
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
import { index as inventoryIndex } from '@/routes/inventory';
import { create, index } from '@/routes/stock-adjustments';
import type { BreadcrumbItem, Option, Outlet, Product, StockAdjustmentReason, StockAdjustmentType } from '@/types';

type AdjustmentItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_cost: string;
    note: string;
};

type AdjustmentFormData = {
    adjustment_date: string;
    outlet_id: string;
    type: StockAdjustmentType;
    reason: StockAdjustmentReason | '';
    note: string;
    items: AdjustmentItemFormData[];
};

type AdjustmentReasonOption = Option<StockAdjustmentReason> & {
    types: StockAdjustmentType[];
};

function createItemFormData(): AdjustmentItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_variant_id: '',
        unit_of_measurement_id: '',
        quantity: '',
        unit_cost: '',
        note: '',
    };
}

export default function AdjustmentsCreate({
    outlets,
    products,
    adjustmentTypes,
    adjustmentReasons,
    selectedOutletId,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: Product[];
    adjustmentTypes: Option<StockAdjustmentType>[];
    adjustmentReasons: AdjustmentReasonOption[];
    selectedOutletId?: number | null;
}) {
    const form = useForm<AdjustmentFormData>(() => ({
        adjustment_date: formatDate(new Date(), 'yyyy-MM-dd'),
        outlet_id: selectedOutletId?.toString() ?? '',
        type: 'in',
        reason: '',
        note: '',
        items: [createItemFormData()],
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Adjustments', href: index().url },
        { title: 'Create', href: create().url },
    ];

    const selectedOutlet = outlets.find((outlet) => outlet.id.toString() === form.data.outlet_id) ?? null;

    const productVariants = products.flatMap((product) => product.product_variants ?? []);

    const adjustmentDate = form.data.adjustment_date ? parseISO(form.data.adjustment_date) : undefined;

    const isInbound = form.data.type === 'in';

    const availableReasons = adjustmentReasons.filter((reason) => reason.types.includes(form.data.type));

    const totalAmount = form.data.items.reduce((sum, item) => {
        const selectedProductVariant = productVariants.find((productVariant) => productVariant.id.toString() === item.product_variant_id);

        const selectedProduct = products.find((product) => product.id === selectedProductVariant?.product_id);

        const selectedUnitConversion = selectedProduct?.active_unit_conversions?.find(
            (conversion) => conversion.unit_of_measurement_id.toString() === item.unit_of_measurement_id,
        );

        const quantity = Number(item.quantity) || 0;
        const baseQuantity = quantity * (Number(selectedUnitConversion?.conversion_factor_to_base) || 0);

        const unitCost = isInbound ? Number(item.unit_cost) : Number(selectedProductVariant?.average_cost);

        return sum + (isInbound ? quantity : baseQuantity) * (unitCost || 0);
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

        form.submit(StockAdjustmentController.store(), {
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

    const updateItem = (uid: string, patch: Partial<AdjustmentItemFormData>) => {
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

    const handleTypeChange = (adjustmentType: StockAdjustmentType) => {
        form.setData((data) => ({
            ...data,
            type: adjustmentType,
            reason: '',
            items: data.items.map((item) => ({
                ...item,
                unit_cost: '',
            })),
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Stock Adjustment" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Heading title="Create Stock Adjustment" className="mb-8" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Section>
                            <SectionContent>
                                <FieldGroup className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="adjustment_date">
                                            Adjustment Date <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <DatePicker
                                            id="adjustment_date"
                                            value={adjustmentDate}
                                            onChange={(date) =>
                                                form.setData((data) => ({
                                                    ...data,
                                                    adjustment_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                                }))
                                            }
                                            aria-invalid={Boolean(form.errors.adjustment_date)}
                                        />

                                        <FieldError
                                            errors={[
                                                {
                                                    message: form.errors.adjustment_date,
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

                                    <Field>
                                        <FieldLabel htmlFor="type">
                                            Type <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <Select
                                            value={form.data.type}
                                            onValueChange={(adjustmentType) => handleTypeChange(adjustmentType as StockAdjustmentType)}
                                        >
                                            <SelectTrigger id="type" className="w-full" aria-invalid={Boolean(form.errors.type)}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {adjustmentTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FieldError errors={[{ message: form.errors.type }]} />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="reason">
                                            Reason <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <Select
                                            value={form.data.reason}
                                            onValueChange={(reason) => form.setData('reason', reason as StockAdjustmentReason)}
                                        >
                                            <SelectTrigger id="reason" className="w-full" aria-invalid={Boolean(form.errors.reason)}>
                                                <SelectValue placeholder="Select reason" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {availableReasons.map((reason) => (
                                                    <SelectItem key={reason.value} value={reason.value}>
                                                        {reason.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FieldError errors={[{ message: form.errors.reason }]} />
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
                                <SectionTitle>Items</SectionTitle>

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
                                                            {isInbound ? (
                                                                <>
                                                                    Unit Cost <span className="text-red-500">*</span>
                                                                </>
                                                            ) : (
                                                                'Avg. Cost'
                                                            )}
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

                                                        const unitCost = isInbound
                                                            ? Number(item.unit_cost)
                                                            : Number(selectedProductVariant?.average_cost);

                                                        const lineTotal =
                                                            (isInbound ? Number(item.quantity) || 0 : baseQuantity) * (unitCost || 0);

                                                        const hasNoAvailableStock =
                                                            !isInbound && Number(selectedProductVariant?.available_quantity) <= 0;

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
                                                                                                    !isInbound &&
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
                                                                                                        {isInbound
                                                                                                            ? 'Available for adjustment in'
                                                                                                            : `Available: ${formatQuantity(productVariant.available_quantity ?? 0)} · Avg: ${formatCurrency(productVariant.average_cost ?? 0)}`}
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

                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {isInbound ? (
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
                                                                            ) : (
                                                                                <div className="text-right tabular-nums">
                                                                                    {selectedProductVariant
                                                                                        ? formatCurrency(
                                                                                              selectedProductVariant.average_cost ?? 0,
                                                                                          )
                                                                                        : '-'}
                                                                                </div>
                                                                            )}

                                                                            <FieldError>
                                                                                {form.errors[`items.${itemIndex}.unit_cost`]}
                                                                            </FieldError>
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
                                                                            {baseQuantity && unitCost >= 0
                                                                                ? formatCurrency(lineTotal)
                                                                                : '-'}
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
                                    Add Item
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
