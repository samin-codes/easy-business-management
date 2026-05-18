import { format as formatDate, parseISO } from 'date-fns';
import { Form, Link } from '@inertiajs/react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { store, update } from '@/actions/App/Http/Controllers/PurchaseController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Outlet, Product, Purchase, PurchaseFormData, PurchaseItemFormData, Supplier } from './types';

type PurchaseItemPatch = Partial<
    Pick<PurchaseItemFormData, 'product_id' | 'unit_of_measurement_id' | 'quantity' | 'unit_cost'>
>;

function createPurchaseItem(): PurchaseItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_id: '',
        unit_of_measurement_id: '',
        quantity: '',
        unit_cost: '',
    };
}

function parseDateValue(value: string): Date | undefined {
    if (value === '') {
        return undefined;
    }

    const parsedDate = parseISO(value);

    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

function numberValue(value: string): number {
    return Number(value) || 0;
}

function formatCurrency(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function PurchaseForm({
    purchase,
    outlets,
    suppliers,
    products,
    purchaseStatusOptions,
    cancelHref,
}: {
    purchase?: Purchase;
    outlets: Outlet[];
    suppliers: Supplier[];
    products: Product[];
    purchaseStatusOptions?: Option[];
    purchasePaymentStatusOptions?: Option[];
    cancelHref: string;
}) {
    const [formData, setFormData] = useState<PurchaseFormData>(() => ({
        purchase_date: purchase?.purchase_date ?? formatDate(new Date(), 'yyyy-MM-dd'),
        status: purchase?.status ?? 'draft',
        outlet_id: purchase?.outlet_id?.toString() ?? '',
        supplier_party_id: purchase?.supplier_party_id?.toString() ?? '',
        note: purchase?.note ?? '',
        discount_amount: purchase?.discount_amount ?? '0',
        transport_cost: purchase?.transport_cost ?? '0',
        labour_cost: purchase?.labour_cost ?? '0',
        other_cost: purchase?.other_cost ?? '0',
        paid_amount: purchase?.paid_amount ?? '0',
        items:
            purchase?.items && purchase.items.length > 0
                ? purchase.items.map((item) => ({
                      uid: crypto.randomUUID(),
                      product_id: item.product_id.toString(),
                      unit_of_measurement_id: item.unit_of_measurement_id.toString(),
                      quantity: item.quantity,
                      unit_cost: item.unit_cost,
                  }))
                : [createPurchaseItem()],
    }));

    const supplierOptions: Option[] = suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id.toString(),
    }));
    const selectedSupplier = supplierOptions.find((supplier) => supplier.value === formData.supplier_party_id) ?? null;
    const purchaseDate = parseDateValue(formData.purchase_date);

    const discountAmountValue = numberValue(formData.discount_amount);
    const transportCostValue = numberValue(formData.transport_cost);
    const labourCostValue = numberValue(formData.labour_cost);
    const otherCostValue = numberValue(formData.other_cost);
    const paidAmountValue = numberValue(formData.paid_amount);
    const subtotal = formData.items.reduce((sum, item) => {
        return sum + numberValue(item.quantity) * numberValue(item.unit_cost);
    }, 0);
    const total = subtotal + transportCostValue + labourCostValue + otherCostValue - discountAmountValue;
    const due = total - paidAmountValue;
    const paymentStatus = paidAmountValue <= 0 ? 'unpaid' : paidAmountValue >= total ? 'paid' : 'partial';

    const addPurchaseItem = () => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            items: [...currentFormData.items, createPurchaseItem()],
        }));
    };

    const removePurchaseItem = (uid: string) => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            items: currentFormData.items.filter((purchaseItem) => purchaseItem.uid !== uid),
        }));
    };

    const updatePurchaseItem = (uid: string, patch: PurchaseItemPatch) => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            items: currentFormData.items.map((purchaseItem) =>
                purchaseItem.uid === uid ? { ...purchaseItem, ...patch } : purchaseItem,
            ),
        }));
    };

    return (
        <Form
            action={purchase ? update(purchase.id) : store()}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <div>
                        <div className="mb-3 text-base font-medium">Purchase Information</div>
                        <div className="flex flex-col gap-7">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="purchase_date" className="text-sm font-medium">
                                        Purchase Date <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        id="purchase_date"
                                        name="purchase_date"
                                        value={purchaseDate}
                                        onChange={(date) =>
                                            setFormData((currentFormData) => ({
                                                ...currentFormData,
                                                purchase_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                            }))
                                        }
                                        aria-invalid={Boolean(errors.purchase_date)}
                                    />
                                    <InputError message={errors.purchase_date} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="outlet_id" className="text-sm font-medium">
                                        Outlet <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        name="outlet_id"
                                        value={formData.outlet_id || undefined}
                                        onValueChange={(value) =>
                                            setFormData((currentFormData) => ({
                                                ...currentFormData,
                                                outlet_id: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger
                                            id="outlet_id"
                                            className="w-full"
                                            aria-invalid={Boolean(errors.outlet_id)}
                                        >
                                            <SelectValue placeholder="Select outlet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {outlets.map((outlet) => (
                                                <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                    {outlet.name}
                                                    {outlet.code ? ` (${outlet.code})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.outlet_id} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="supplier_party_id" className="text-sm font-medium">
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <Combobox
                                        name="supplier_party_id"
                                        items={supplierOptions}
                                        value={selectedSupplier}
                                        onValueChange={(supplier) =>
                                            setFormData((currentFormData) => ({
                                                ...currentFormData,
                                                supplier_party_id: supplier?.value ?? '',
                                            }))
                                        }
                                        itemToStringValue={(supplier) => supplier.value}
                                    >
                                        <ComboboxInput
                                            id="supplier_party_id"
                                            placeholder="Select supplier"
                                            className="w-full"
                                            aria-invalid={Boolean(errors.supplier_party_id)}
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No supplier found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(supplier) => (
                                                    <ComboboxItem key={supplier.value} value={supplier}>
                                                        {supplier.label}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError message={errors.supplier_party_id} />
                                </div>
                            </div>

                            <input type="hidden" name="status" value={formData.status} />

                            {purchase && purchaseStatusOptions && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    status: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger id="status" className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {purchaseStatusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label htmlFor="note" className="text-sm font-medium">
                                    Note
                                </label>
                                <Textarea
                                    id="note"
                                    name="note"
                                    value={formData.note}
                                    onChange={(event) =>
                                        setFormData((currentFormData) => ({
                                            ...currentFormData,
                                            note: event.target.value,
                                        }))
                                    }
                                    aria-invalid={Boolean(errors.note)}
                                    placeholder="Purchase notes..."
                                    className="min-h-20 resize-none"
                                />
                                <InputError message={errors.note} />
                            </div>
                        </div>
                    </div>

                    <hr className="border-t" />

                    <div>
                        <div className="mb-3">
                            <div className="text-base font-medium">Purchase Items</div>
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b">
                                        <th className="h-10 px-3 text-left align-middle font-medium">
                                            Product <span className="text-red-500">*</span>
                                        </th>
                                        <th className="h-10 w-36 px-3 text-left align-middle font-medium">
                                            Unit <span className="text-red-500">*</span>
                                        </th>
                                        <th className="h-10 w-32 px-3 text-right align-middle font-medium">
                                            Qty <span className="text-red-500">*</span>
                                        </th>
                                        <th className="h-10 w-32 px-3 text-right align-middle font-medium">
                                            Unit Price <span className="text-red-500">*</span>
                                        </th>
                                        <th className="h-10 w-32 px-3 text-right align-middle font-medium whitespace-nowrap">
                                            Line Total
                                        </th>
                                        <th className="h-10 w-12 px-3 text-center align-middle font-medium">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {formData.items.map((purchaseItem, index) => (
                                        <PurchaseItemRow
                                            key={purchaseItem.uid}
                                            purchaseItem={purchaseItem}
                                            purchaseItemIndex={index}
                                            products={products}
                                            errors={errors}
                                            updatePurchaseItem={(patch) => updatePurchaseItem(purchaseItem.uid, patch)}
                                            onRemove={() => removePurchaseItem(purchaseItem.uid)}
                                            canRemove={formData.items.length > 1}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <Button type="button" variant="outline" size="sm" onClick={addPurchaseItem}>
                                <Plus className="size-4" />
                                Add Item
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-end">
                            <div className="w-full max-w-sm">
                                <div className="mb-3 text-base font-medium">Summary</div>
                                <div className="space-y-1 overflow-hidden rounded-lg border bg-card p-4">
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-sm text-muted-foreground">Subtotal</span>
                                        <span className="text-sm font-medium tabular-nums">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>

                                    <div className="border-t border-border" />

                                    <div className="flex items-center justify-between gap-4 py-1">
                                        <span className="text-sm text-muted-foreground">Transport Cost</span>
                                        <Input
                                            id="transport_cost"
                                            name="transport_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.transport_cost}
                                            onChange={(event) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    transport_cost: event.target.value,
                                                }))
                                            }
                                            className="no-number-spinner h-9 w-36 text-right"
                                            aria-invalid={Boolean(errors.transport_cost)}
                                        />
                                    </div>
                                    {errors.transport_cost && (
                                        <div className="text-right text-xs text-red-500">{errors.transport_cost}</div>
                                    )}

                                    <div className="flex items-center justify-between gap-4 py-1">
                                        <span className="text-sm text-muted-foreground">Labour Cost</span>
                                        <Input
                                            id="labour_cost"
                                            name="labour_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.labour_cost}
                                            onChange={(event) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    labour_cost: event.target.value,
                                                }))
                                            }
                                            className="no-number-spinner h-9 w-36 text-right"
                                            aria-invalid={Boolean(errors.labour_cost)}
                                        />
                                    </div>
                                    {errors.labour_cost && (
                                        <div className="text-right text-xs text-red-500">{errors.labour_cost}</div>
                                    )}

                                    <div className="flex items-center justify-between gap-4 py-1">
                                        <span className="text-sm text-muted-foreground">Other Cost</span>
                                        <Input
                                            id="other_cost"
                                            name="other_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.other_cost}
                                            onChange={(event) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    other_cost: event.target.value,
                                                }))
                                            }
                                            className="no-number-spinner h-9 w-36 text-right"
                                            aria-invalid={Boolean(errors.other_cost)}
                                        />
                                    </div>
                                    {errors.other_cost && (
                                        <div className="text-right text-xs text-red-500">{errors.other_cost}</div>
                                    )}

                                    <div className="flex items-center justify-between gap-4 py-1">
                                        <span className="text-sm text-muted-foreground">Discount Amount</span>
                                        <Input
                                            id="discount_amount"
                                            name="discount_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.discount_amount}
                                            onChange={(event) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    discount_amount: event.target.value,
                                                }))
                                            }
                                            className="no-number-spinner h-9 w-36 text-right"
                                            aria-invalid={Boolean(errors.discount_amount)}
                                        />
                                    </div>
                                    {errors.discount_amount && (
                                        <div className="text-right text-xs text-red-500">{errors.discount_amount}</div>
                                    )}

                                    <div className="border-t border-border" />
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-sm font-medium">Total Amount</span>
                                        <span className="text-lg font-semibold tabular-nums">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                    <div className="border-t border-border" />

                                    <div className="flex items-center justify-between gap-4 py-1">
                                        <span className="text-sm text-muted-foreground">Paid Amount</span>
                                        <Input
                                            id="paid_amount"
                                            name="paid_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.paid_amount}
                                            onChange={(event) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    paid_amount: event.target.value,
                                                }))
                                            }
                                            className="no-number-spinner h-9 w-36 text-right"
                                            aria-invalid={Boolean(errors.paid_amount)}
                                        />
                                    </div>
                                    {errors.paid_amount && (
                                        <div className="text-right text-xs text-red-500">{errors.paid_amount}</div>
                                    )}

                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-sm text-muted-foreground">Due Amount</span>
                                        <span
                                            className={
                                                'text-sm font-semibold tabular-nums ' +
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

                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-sm text-muted-foreground">Payment Status</span>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={cancelHref}>
                                <X />
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save />
                            {processing ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}

function PurchaseItemRow({
    purchaseItem,
    purchaseItemIndex,
    products,
    errors,
    updatePurchaseItem,
    onRemove,
    canRemove,
}: {
    purchaseItem: PurchaseItemFormData;
    purchaseItemIndex: number;
    products: Product[];
    errors: Record<string, string>;
    updatePurchaseItem: (patch: PurchaseItemPatch) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const selectedProduct = products.find((product) => product.id.toString() === purchaseItem.product_id);
    const availableConversions = selectedProduct?.active_unit_conversions ?? [];
    const productOptions: Option[] = products.map((product) => ({
        label: product.name,
        value: product.id.toString(),
    }));
    const unitOptions: Option[] = availableConversions.map((conversion) => ({
        label: conversion.unit_of_measurement?.name ?? `ID: ${conversion.unit_of_measurement_id}`,
        value: conversion.unit_of_measurement_id.toString(),
    }));
    const selectedProductOption = productOptions.find((product) => product.value === purchaseItem.product_id) ?? null;
    const selectedUnitOption = unitOptions.find((unit) => unit.value === purchaseItem.unit_of_measurement_id) ?? null;
    const quantityValue = numberValue(purchaseItem.quantity);
    const unitCostValue = numberValue(purchaseItem.unit_cost);
    const lineTotal = quantityValue * unitCostValue;

    const updateProduct = (productOption: Option | null) => {
        const productId = productOption?.value ?? '';
        const product = products.find((currentProduct) => currentProduct.id.toString() === productId);

        updatePurchaseItem({
            product_id: productId,
            unit_of_measurement_id: product?.default_purchase_unit_conversion?.unit_of_measurement_id?.toString() ?? '',
            quantity: '',
            unit_cost: '',
        });
    };

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="px-3 py-2">
                <Combobox
                    name={`items[${purchaseItemIndex}][product_id]`}
                    items={productOptions}
                    value={selectedProductOption}
                    onValueChange={updateProduct}
                    itemToStringValue={(product) => product.value}
                >
                    <ComboboxInput
                        id={`items-${purchaseItemIndex}-product-id`}
                        placeholder="Select product"
                        className="w-full"
                        aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.product_id`])}
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>No product found.</ComboboxEmpty>
                        <ComboboxList>
                            {(product) => (
                                <ComboboxItem key={product.value} value={product}>
                                    {product.label}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </td>
            <td className="w-36 px-3 py-2">
                <Combobox
                    name={`items[${purchaseItemIndex}][unit_of_measurement_id]`}
                    items={unitOptions}
                    value={selectedUnitOption}
                    onValueChange={(unit) =>
                        updatePurchaseItem({
                            unit_of_measurement_id: unit?.value ?? '',
                        })
                    }
                    itemToStringValue={(unit) => unit.value}
                    disabled={purchaseItem.product_id === ''}
                >
                    <ComboboxInput
                        id={`items-${purchaseItemIndex}-unit-of-measurement-id`}
                        placeholder="Select unit"
                        className="w-full"
                        disabled={purchaseItem.product_id === ''}
                        aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.unit_of_measurement_id`])}
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>No unit found.</ComboboxEmpty>
                        <ComboboxList>
                            {(unit) => (
                                <ComboboxItem key={unit.value} value={unit}>
                                    {unit.label}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </td>
            <td className="w-32 px-3 py-2">
                <Input
                    type="number"
                    name={`items[${purchaseItemIndex}][quantity]`}
                    value={purchaseItem.quantity}
                    onChange={(event) =>
                        updatePurchaseItem({
                            quantity: event.target.value,
                        })
                    }
                    className="no-number-spinner text-right"
                    disabled={purchaseItem.product_id === ''}
                    aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.quantity`])}
                />
            </td>
            <td className="w-32 px-3 py-2">
                <Input
                    type="number"
                    name={`items[${purchaseItemIndex}][unit_cost]`}
                    value={purchaseItem.unit_cost}
                    onChange={(event) =>
                        updatePurchaseItem({
                            unit_cost: event.target.value,
                        })
                    }
                    className="no-number-spinner text-right"
                    disabled={purchaseItem.product_id === ''}
                    aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.unit_cost`])}
                />
            </td>
            <td className="w-32 px-3 py-2 text-right align-middle">
                <span className="font-medium tabular-nums">{lineTotal > 0 ? formatCurrency(lineTotal) : '-'}</span>
            </td>
            <td className="w-12 px-3 py-2 align-middle">
                {canRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={onRemove}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Remove purchase item</span>
                    </Button>
                )}
            </td>
        </tr>
    );
}
