import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import type { Product, PurchaseItemFormData } from '../types';
import { formatCurrency, numberValue } from './form-helpers';

export type PurchaseItemPatch = Partial<
    Pick<PurchaseItemFormData, 'product_variant_id' | 'unit_of_measurement_id' | 'quantity' | 'unit_cost'>
>;

type PurchaseItemsTableProps = {
    items: PurchaseItemFormData[];
    products: Product[];
    errors: Record<string, string>;
    onItemAdd: () => void;
    onItemRemove: (uid: string) => void;
    onItemChange: (uid: string, patch: PurchaseItemPatch) => void;
};

export default function PurchaseItemsTable({ items, products, errors, onItemAdd, onItemRemove, onItemChange }: PurchaseItemsTableProps) {
    const productVariants = products.flatMap((product) => product.product_variants);

    return (
        <div>
            <div className="mb-3">
                <div className="text-base font-medium">Purchase Items</div>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[960px] caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b">
                            <th className="h-10 min-w-[360px] px-3 text-left align-middle font-medium">
                                Product / Variant <span className="text-red-500">*</span>
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
                            <th className="h-10 w-32 px-3 text-right align-middle font-medium whitespace-nowrap">Line Total</th>
                            <th className="h-10 w-12 px-3 text-center align-middle font-medium">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {items.map((purchaseItem, purchaseItemIndex) => {
                            const selectedProductVariant =
                                productVariants.find(
                                    (productVariant) => productVariant.id.toString() === purchaseItem.product_variant_id,
                                ) ?? null;

                            const selectedProduct = products.find((product) => product.id === selectedProductVariant?.product_id);

                            const availableConversions = selectedProduct ? selectedProduct.active_unit_conversions : [];

                            const selectedUnitConversion =
                                availableConversions.find(
                                    (conversion) => conversion.unit_of_measurement_id.toString() === purchaseItem.unit_of_measurement_id,
                                ) ?? null;

                            const lineTotal = numberValue(purchaseItem.quantity) * numberValue(purchaseItem.unit_cost);

                            return (
                                <tr key={purchaseItem.uid} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="min-w-[360px] px-3 py-2">
                                        <Combobox
                                            name={`items[${purchaseItemIndex}][product_variant_id]`}
                                            items={productVariants}
                                            value={selectedProductVariant}
                                            onValueChange={(productVariant) => {
                                                const product = products.find(
                                                    (currentProduct) => currentProduct.id === productVariant?.product_id,
                                                );

                                                onItemChange(purchaseItem.uid, {
                                                    product_variant_id: productVariant?.id.toString() ?? '',
                                                    unit_of_measurement_id:
                                                        product?.default_purchase_unit_conversion?.unit_of_measurement_id?.toString() ?? '',
                                                    quantity: '',
                                                    unit_cost: '',
                                                });
                                            }}
                                            itemToStringLabel={(productVariant) => productVariant.purchase_label}
                                            itemToStringValue={(productVariant) => productVariant.id.toString()}
                                        >
                                            <ComboboxInput
                                                id={`items-${purchaseItemIndex}-product-variant-id`}
                                                placeholder="Select product / variant"
                                                className="w-full"
                                                showClear
                                                aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.product_variant_id`])}
                                            />
                                            <ComboboxContent className="w-max min-w-(--anchor-width)">
                                                <ComboboxEmpty>No product variant found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(productVariant) => (
                                                        <ComboboxItem key={productVariant.id} value={productVariant}>
                                                            <div className="flex min-w-0 flex-col">
                                                                <span className="text-sm whitespace-nowrap">
                                                                    {productVariant.purchase_label}
                                                                </span>
                                                                {productVariant.sku && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        SKU: {productVariant.sku}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    </td>
                                    <td className="w-36 px-3 py-2">
                                        <Combobox
                                            name={`items[${purchaseItemIndex}][unit_of_measurement_id]`}
                                            items={availableConversions}
                                            value={selectedUnitConversion}
                                            onValueChange={(conversion) =>
                                                onItemChange(purchaseItem.uid, {
                                                    unit_of_measurement_id: conversion?.unit_of_measurement_id.toString() ?? '',
                                                })
                                            }
                                            itemToStringLabel={(conversion) => conversion.unit_of_measurement.name}
                                            itemToStringValue={(conversion) => conversion.unit_of_measurement_id.toString()}
                                            disabled={purchaseItem.product_variant_id === ''}
                                        >
                                            <ComboboxInput
                                                id={`items-${purchaseItemIndex}-unit-of-measurement-id`}
                                                placeholder="Select unit"
                                                className="w-full"
                                                showClear
                                                disabled={purchaseItem.product_variant_id === ''}
                                                aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.unit_of_measurement_id`])}
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>No unit found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(conversion) => (
                                                        <ComboboxItem key={conversion.id} value={conversion}>
                                                            {conversion.unit_of_measurement.name}
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
                                                onItemChange(purchaseItem.uid, {
                                                    quantity: event.target.value,
                                                })
                                            }
                                            className="no-number-spinner text-right"
                                            disabled={purchaseItem.product_variant_id === ''}
                                            aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.quantity`])}
                                        />
                                    </td>
                                    <td className="w-32 px-3 py-2">
                                        <Input
                                            type="number"
                                            name={`items[${purchaseItemIndex}][unit_cost]`}
                                            value={purchaseItem.unit_cost}
                                            onChange={(event) =>
                                                onItemChange(purchaseItem.uid, {
                                                    unit_cost: event.target.value,
                                                })
                                            }
                                            className="no-number-spinner text-right"
                                            disabled={purchaseItem.product_variant_id === ''}
                                            aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.unit_cost`])}
                                        />
                                    </td>
                                    <td className="w-32 px-3 py-2 text-right align-middle">
                                        <span className="font-medium tabular-nums">{lineTotal > 0 ? formatCurrency(lineTotal) : '-'}</span>
                                    </td>
                                    <td className="w-12 px-3 py-2 align-middle">
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onItemRemove(purchaseItem.uid)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                                <span className="sr-only">Remove purchase item</span>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center">
                <Button type="button" variant="outline" size="sm" onClick={onItemAdd}>
                    <Plus className="size-4" />
                    Add Item
                </Button>
            </div>
        </div>
    );
}
