import { Trash2 } from 'lucide-react';
import { Action } from '@/components/table-actions';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDecimal, formatInteger } from '@/lib/utils';
import type { Product } from '@/types';

export type PurchaseItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_cost: string;
};

export type PurchaseItemPatch = Partial<
    Pick<PurchaseItemFormData, 'product_variant_id' | 'unit_of_measurement_id' | 'quantity' | 'unit_cost'>
>;

export default function PurchaseItemsTable({
    items,
    products,
    errors,
    onItemRemove,
    onItemChange,
}: {
    items: PurchaseItemFormData[];
    products: Product[];
    errors: Record<string, string>;
    onItemRemove: (uid: string) => void;
    onItemChange: (uid: string, patch: PurchaseItemPatch) => void;
}) {
    const productVariants = products.flatMap((product) => product.product_variants ?? []);

    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
    }, 0);

    return (
        <div className="ui-table">
            <div className="ui-table-main">
                <div className="ui-table-content">
                    <table className="ui-table-element min-w-240">
                        <thead>
                            <tr className="ui-table-row">
                                <th className="ui-table-header-cell min-w-90">
                                    Product / Variant <span className="text-red-500">*</span>
                                </th>

                                <th className="ui-table-header-cell w-36">
                                    Unit <span className="text-red-500">*</span>
                                </th>

                                <th className="ui-table-header-cell w-32 text-right">
                                    Qty <span className="text-red-500">*</span>
                                </th>

                                <th className="ui-table-header-cell w-32 text-right">
                                    Unit Price <span className="text-red-500">*</span>
                                </th>

                                <th className="ui-table-header-cell w-32 text-right whitespace-nowrap">Line Total</th>

                                <th className="ui-table-header-cell ui-table-empty-header-cell w-12 text-center">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((purchaseItem, purchaseItemIndex) => {
                                const selectedProductVariant =
                                    productVariants.find(
                                        (productVariant) => productVariant.id.toString() === purchaseItem.product_variant_id,
                                    ) ?? null;

                                const selectedProduct = products.find((product) => product.id === selectedProductVariant?.product_id);

                                const availableConversions = selectedProduct?.active_unit_conversions ?? [];

                                const selectedUnitConversion =
                                    availableConversions.find(
                                        (conversion) =>
                                            conversion.unit_of_measurement_id.toString() === purchaseItem.unit_of_measurement_id,
                                    ) ?? null;

                                const lineTotal = (Number(purchaseItem.quantity) || 0) * (Number(purchaseItem.unit_cost) || 0);

                                return (
                                    <tr key={purchaseItem.uid} className="ui-table-row">
                                        <td className="ui-table-cell min-w-[360px]">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Combobox
                                                        items={productVariants}
                                                        value={selectedProductVariant}
                                                        onValueChange={(productVariant) => {
                                                            const product = products.find(
                                                                (currentProduct) => currentProduct.id === productVariant?.product_id,
                                                            );

                                                            onItemChange(purchaseItem.uid, {
                                                                product_variant_id: productVariant?.id.toString() ?? '',
                                                                unit_of_measurement_id:
                                                                    product?.default_purchase_unit_conversion?.unit_of_measurement_id?.toString() ??
                                                                    '',
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
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell w-36">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Combobox
                                                        items={availableConversions}
                                                        value={selectedUnitConversion}
                                                        onValueChange={(conversion) =>
                                                            onItemChange(purchaseItem.uid, {
                                                                unit_of_measurement_id: conversion?.unit_of_measurement_id.toString() ?? '',
                                                            })
                                                        }
                                                        itemToStringLabel={(conversion) => conversion.unit_of_measurement?.name ?? ''}
                                                        itemToStringValue={(conversion) => conversion.unit_of_measurement_id.toString()}
                                                        disabled={purchaseItem.product_variant_id === ''}
                                                    >
                                                        <ComboboxInput
                                                            id={`items-${purchaseItemIndex}-unit-of-measurement-id`}
                                                            placeholder="Select unit"
                                                            className="w-full"
                                                            showClear
                                                            disabled={purchaseItem.product_variant_id === ''}
                                                            aria-invalid={Boolean(
                                                                errors[`items.${purchaseItemIndex}.unit_of_measurement_id`],
                                                            )}
                                                        />

                                                        <ComboboxContent>
                                                            <ComboboxEmpty>No unit found.</ComboboxEmpty>

                                                            <ComboboxList>
                                                                {(conversion) => (
                                                                    <ComboboxItem key={conversion.id} value={conversion}>
                                                                        {conversion.unit_of_measurement?.name ?? '-'}
                                                                    </ComboboxItem>
                                                                )}
                                                            </ComboboxList>
                                                        </ComboboxContent>
                                                    </Combobox>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell w-32">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Input
                                                        type="number"
                                                        value={purchaseItem.quantity}
                                                        onChange={(event) =>
                                                            onItemChange(purchaseItem.uid, {
                                                                quantity: event.target.value,
                                                            })
                                                        }
                                                        onBlur={() =>
                                                            onItemChange(purchaseItem.uid, {
                                                                quantity: formatInteger(purchaseItem.quantity),
                                                            })
                                                        }
                                                        className="no-number-spinner text-right"
                                                        disabled={purchaseItem.product_variant_id === ''}
                                                        aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.quantity`])}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell w-32">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Input
                                                        type="number"
                                                        value={purchaseItem.unit_cost}
                                                        onChange={(event) =>
                                                            onItemChange(purchaseItem.uid, {
                                                                unit_cost: event.target.value,
                                                            })
                                                        }
                                                        onBlur={() =>
                                                            onItemChange(purchaseItem.uid, {
                                                                unit_cost: formatDecimal(purchaseItem.unit_cost),
                                                            })
                                                        }
                                                        className="no-number-spinner text-right"
                                                        disabled={purchaseItem.product_variant_id === ''}
                                                        aria-invalid={Boolean(errors[`items.${purchaseItemIndex}.unit_cost`])}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell w-32 text-right">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <span className="font-medium tabular-nums">
                                                        {lineTotal > 0 ? formatCurrency(lineTotal) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell w-12">
                                            <div className="ui-table-actions">
                                                {items.length > 1 && (
                                                    <Action
                                                        name="remove"
                                                        label="Remove purchase item"
                                                        icon={Trash2}
                                                        color="danger"
                                                        appearance="icon-button"
                                                        onClick={() => onItemRemove(purchaseItem.uid)}
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
                                <td colSpan={4} className="ui-table-cell text-right font-medium text-muted-foreground">
                                    <div className="ui-table-column">
                                        <div className="ui-table-text py-2">Subtotal</div>
                                    </div>
                                </td>

                                <td className="ui-table-cell w-32 text-right">
                                    <div className="ui-table-column">
                                        <div className="ui-table-text py-2">
                                            <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="ui-table-cell w-12" />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
