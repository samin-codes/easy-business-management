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

type Props = {
    items: SaleItemFormData[];
    products: Product[];
    errors: Record<string, string>;
    onItemRemove: (uid: string) => void;
    onItemChange: (uid: string, patch: SaleItemPatch) => void;
};

export default function SaleItemsTable({ items, products, errors, onItemRemove, onItemChange }: Props) {
    const variants = products.flatMap((product) => product.product_variants ?? []);

    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="table-hover table min-w-240">
                <thead>
                    <tr>
                        <th className="min-w-90">
                            Product / Variant <span className="text-red-500">*</span>
                        </th>
                        <th className="w-36">
                            Unit <span className="text-red-500">*</span>
                        </th>
                        <th className="w-32 text-right">
                            Qty <span className="text-red-500">*</span>
                        </th>
                        <th className="w-32 text-right">
                            Unit Price <span className="text-red-500">*</span>
                        </th>
                        <th className="w-32 text-right whitespace-nowrap">Line Total</th>
                        <th className="w-12 text-center">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => {
                        const variant = variants.find((value) => value.id.toString() === item.product_variant_id) ?? null;

                        const product = products.find((value) => value.id === variant?.product_id);

                        const conversions = product?.active_unit_conversions ?? [];

                        const conversion =
                            conversions.find((value) => value.unit_of_measurement_id.toString() === item.unit_of_measurement_id) ?? null;

                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);

                        return (
                            <tr key={item.uid}>
                                <td className="min-w-[360px]">
                                    <Combobox
                                        items={variants}
                                        value={variant}
                                        onValueChange={(value) => {
                                            const nextProduct = products.find((current) => current.id === value?.product_id);

                                            onItemChange(item.uid, {
                                                product_variant_id: value?.id.toString() ?? '',
                                                unit_of_measurement_id:
                                                    nextProduct?.default_sale_unit_conversion?.unit_of_measurement_id.toString() ?? '',
                                                quantity: '',
                                                unit_price: '',
                                            });
                                        }}
                                        itemToStringLabel={(value) => value.purchase_label}
                                        itemToStringValue={(value) => value.id.toString()}
                                    >
                                        <ComboboxInput
                                            id={`items-${index}-product-variant-id`}
                                            placeholder="Select product / variant"
                                            className="w-full"
                                            showClear
                                            aria-invalid={Boolean(errors[`items.${index}.product_variant_id`])}
                                        />

                                        <ComboboxContent className="w-max min-w-(--anchor-width)">
                                            <ComboboxEmpty>No product variant found.</ComboboxEmpty>

                                            <ComboboxList>
                                                {(value) => (
                                                    <ComboboxItem key={value.id} value={value}>
                                                        <div className="flex min-w-0 flex-col">
                                                            <span className="text-sm whitespace-nowrap">{value.purchase_label}</span>

                                                            {value.sku && (
                                                                <span className="text-xs text-muted-foreground">SKU: {value.sku}</span>
                                                            )}
                                                        </div>
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </td>

                                <td className="w-36">
                                    <Combobox
                                        items={conversions}
                                        value={conversion}
                                        onValueChange={(value) =>
                                            onItemChange(item.uid, {
                                                unit_of_measurement_id: value?.unit_of_measurement_id.toString() ?? '',
                                            })
                                        }
                                        itemToStringLabel={(value) => value.unit_of_measurement?.name ?? ''}
                                        itemToStringValue={(value) => value.unit_of_measurement_id.toString()}
                                        disabled={!variant}
                                    >
                                        <ComboboxInput
                                            id={`items-${index}-unit-of-measurement-id`}
                                            placeholder="Select unit"
                                            className="w-full"
                                            showClear
                                            disabled={!variant}
                                            aria-invalid={Boolean(errors[`items.${index}.unit_of_measurement_id`])}
                                        />

                                        <ComboboxContent>
                                            <ComboboxEmpty>No unit found.</ComboboxEmpty>

                                            <ComboboxList>
                                                {(value) => (
                                                    <ComboboxItem key={value.id} value={value}>
                                                        {value.unit_of_measurement?.name ?? '-'}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </td>

                                <td className="w-32">
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(event) =>
                                            onItemChange(item.uid, {
                                                quantity: event.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            onItemChange(item.uid, {
                                                quantity: formatInteger(item.quantity),
                                            })
                                        }
                                        className="no-number-spinner text-right"
                                        disabled={!variant}
                                        aria-invalid={Boolean(errors[`items.${index}.quantity`])}
                                    />
                                </td>

                                <td className="w-32 px-3 py-2">
                                    <Input
                                        type="number"
                                        value={item.unit_price}
                                        onChange={(event) =>
                                            onItemChange(item.uid, {
                                                unit_price: event.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            onItemChange(item.uid, {
                                                unit_price: formatDecimal(item.unit_price),
                                            })
                                        }
                                        className="no-number-spinner text-right"
                                        disabled={!variant}
                                        aria-invalid={Boolean(errors[`items.${index}.unit_price`])}
                                    />
                                </td>

                                <td className="w-32 text-right">
                                    <span className="font-medium tabular-nums">{lineTotal > 0 ? formatCurrency(lineTotal) : '-'}</span>
                                </td>

                                <td className="w-12">
                                    {items.length > 1 && (
                                        <Action
                                            name="remove"
                                            label="Remove sale item"
                                            icon={Trash2}
                                            color="danger"
                                            appearance="icon-button"
                                            onClick={() => onItemRemove(item.uid)}
                                        />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

                <tfoot>
                    <tr className="table-light border-t">
                        <td colSpan={4} className="text-right font-medium text-muted-foreground">
                            Subtotal
                        </td>

                        <td className="w-32 text-right">
                            <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
                        </td>

                        <td className="w-12" />
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
