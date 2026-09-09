import { Trash2 } from 'lucide-react';
import { Action } from '@/components/table-actions';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDecimal, formatInteger } from '@/lib/utils';
import type { Product } from '@/types';

export type SaleItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_price: string;
};

export type SaleItemPatch = Partial<Pick<SaleItemFormData, 'product_variant_id' | 'unit_of_measurement_id' | 'quantity' | 'unit_price'>>;

export default function SaleItemsTable({
    items,
    products,
    errors,
    onItemRemove,
    onItemChange,
}: {
    items: SaleItemFormData[];
    products: Product[];
    errors: Record<string, string>;
    onItemRemove: (uid: string) => void;
    onItemChange: (uid: string, patch: SaleItemPatch) => void;
}) {
    const productVariants = products.flatMap((product) => product.product_variants ?? []);

    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
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
                            {items.map((saleItem, saleItemIndex) => {
                                const selectedProductVariant =
                                    productVariants.find(
                                        (productVariant) => productVariant.id.toString() === saleItem.product_variant_id,
                                    ) ?? null;

                                const selectedProduct = products.find((product) => product.id === selectedProductVariant?.product_id);

                                const availableConversions = selectedProduct?.active_unit_conversions ?? [];

                                const selectedUnitConversion =
                                    availableConversions.find(
                                        (conversion) => conversion.unit_of_measurement_id.toString() === saleItem.unit_of_measurement_id,
                                    ) ?? null;

                                const lineTotal = (Number(saleItem.quantity) || 0) * (Number(saleItem.unit_price) || 0);

                                return (
                                    <tr key={saleItem.uid} className="ui-table-row">
                                        <td className="ui-table-cell min-w-90">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Combobox
                                                        items={productVariants}
                                                        value={selectedProductVariant}
                                                        onValueChange={(productVariant) => {
                                                            const product = products.find(
                                                                (currentProduct) => currentProduct.id === productVariant?.product_id,
                                                            );

                                                            onItemChange(saleItem.uid, {
                                                                product_variant_id: productVariant?.id.toString() ?? '',
                                                                unit_of_measurement_id:
                                                                    product?.default_sale_unit_conversion?.unit_of_measurement_id.toString() ??
                                                                    '',
                                                                quantity: '',
                                                                unit_price: '',
                                                            });
                                                        }}
                                                        itemToStringLabel={(productVariant) => productVariant.purchase_label}
                                                        itemToStringValue={(productVariant) => productVariant.id.toString()}
                                                    >
                                                        <ComboboxInput
                                                            id={`items-${saleItemIndex}-product-variant-id`}
                                                            placeholder="Select product / variant"
                                                            className="w-full"
                                                            showClear
                                                            aria-invalid={Boolean(errors[`items.${saleItemIndex}.product_variant_id`])}
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
                                                            onItemChange(saleItem.uid, {
                                                                unit_of_measurement_id: conversion?.unit_of_measurement_id.toString() ?? '',
                                                            })
                                                        }
                                                        itemToStringLabel={(conversion) => conversion.unit_of_measurement?.name ?? ''}
                                                        itemToStringValue={(conversion) => conversion.unit_of_measurement_id.toString()}
                                                        disabled={!selectedProductVariant}
                                                    >
                                                        <ComboboxInput
                                                            id={`items-${saleItemIndex}-unit-of-measurement-id`}
                                                            placeholder="Select unit"
                                                            className="w-full"
                                                            showClear
                                                            disabled={!selectedProductVariant}
                                                            aria-invalid={Boolean(errors[`items.${saleItemIndex}.unit_of_measurement_id`])}
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
                                                        value={saleItem.quantity}
                                                        onChange={(event) =>
                                                            onItemChange(saleItem.uid, {
                                                                quantity: event.target.value,
                                                            })
                                                        }
                                                        onBlur={() =>
                                                            onItemChange(saleItem.uid, {
                                                                quantity: formatInteger(saleItem.quantity),
                                                            })
                                                        }
                                                        className="no-number-spinner text-right"
                                                        disabled={!selectedProductVariant}
                                                        aria-invalid={Boolean(errors[`items.${saleItemIndex}.quantity`])}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell w-32">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Input
                                                        type="number"
                                                        value={saleItem.unit_price}
                                                        onChange={(event) =>
                                                            onItemChange(saleItem.uid, {
                                                                unit_price: event.target.value,
                                                            })
                                                        }
                                                        onBlur={() =>
                                                            onItemChange(saleItem.uid, {
                                                                unit_price: formatDecimal(saleItem.unit_price),
                                                            })
                                                        }
                                                        className="no-number-spinner text-right"
                                                        disabled={!selectedProductVariant}
                                                        aria-invalid={Boolean(errors[`items.${saleItemIndex}.unit_price`])}
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
                                                        label="Remove sale item"
                                                        icon={Trash2}
                                                        color="danger"
                                                        appearance="icon-button"
                                                        onClick={() => onItemRemove(saleItem.uid)}
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
