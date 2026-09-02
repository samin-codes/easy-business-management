import { Trash2 } from 'lucide-react';
import { Action } from '@/components/table-actions';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDecimal, formatQuantity } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';

export type OperationVariant = ProductVariant & {
    available_quantity?: string;
    average_cost?: string;
    has_inventory_history?: boolean;
};

export type OperationProduct = Omit<Product, 'product_variants'> & { product_variants?: OperationVariant[] };

export type OperationItemFormData = {
    uid: string;
    product_variant_id: string;
    unit_of_measurement_id: string;
    quantity: string;
    unit_cost: string;
    note: string;
};

export default function OperationItemsTable({
    mode,
    items,
    products,
    errors,
    onChange,
    onRemove,
}: {
    mode: 'opening' | 'adjustment-in' | 'adjustment-out' | 'transfer';
    items: OperationItemFormData[];
    products: OperationProduct[];
    errors: Record<string, string>;
    onChange: (uid: string, patch: Partial<OperationItemFormData>) => void;
    onRemove: (uid: string) => void;
}) {
    const variants = products.flatMap((product) => product.product_variants ?? []);
    const isCostEditable = mode === 'opening' || mode === 'adjustment-in';
    const total = items.reduce((sum, item) => {
        const variant = variants.find((candidate) => candidate.id.toString() === item.product_variant_id);
        const cost = isCostEditable ? Number(item.unit_cost) : Number(variant?.average_cost);
        const product = products.find((candidate) => candidate.id === variant?.product_id);
        const conversion = product?.active_unit_conversions?.find(
            (candidate) => candidate.unit_of_measurement_id.toString() === item.unit_of_measurement_id,
        );
        const quantity = Number(item.quantity) || 0;
        const baseQuantity = quantity * (Number(conversion?.conversion_factor_to_base) || 0);

        return sum + (isCostEditable ? quantity : baseQuantity) * (cost || 0);
    }, 0);

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="table-hover table min-w-280">
                <thead>
                    <tr>
                        <th className="min-w-80">Product / Variant *</th>
                        <th className="w-36">Unit *</th>
                        <th className="w-28 text-right">Qty *</th>
                        <th className="w-36 text-right">{isCostEditable ? 'Unit Cost *' : 'Avg. Cost'}</th>
                        <th className="w-36 text-right">Base Qty</th>
                        <th className="w-36 text-right">Value</th>
                        <th className="min-w-56">Item Note</th>
                        <th className="w-12">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const variant = variants.find((candidate) => candidate.id.toString() === item.product_variant_id) ?? null;
                        const product = products.find((candidate) => candidate.id === variant?.product_id);
                        const conversions = product?.active_unit_conversions ?? [];
                        const conversion =
                            conversions.find((candidate) => candidate.unit_of_measurement_id.toString() === item.unit_of_measurement_id) ??
                            null;
                        const baseQuantity = (Number(item.quantity) || 0) * (Number(conversion?.conversion_factor_to_base) || 0);
                        const cost = isCostEditable ? Number(item.unit_cost) : Number(variant?.average_cost);
                        const lineValue = (isCostEditable ? Number(item.quantity) || 0 : baseQuantity) * (cost || 0);
                        const disabled =
                            mode === 'opening'
                                ? variant?.has_inventory_history === true
                                : Number(variant?.available_quantity) <= 0 && mode !== 'adjustment-in';

                        return (
                            <tr key={item.uid}>
                                <td>
                                    <Combobox
                                        items={variants}
                                        value={variant}
                                        onValueChange={(value) => {
                                            const selectedProduct = products.find((candidate) => candidate.id === value?.product_id);
                                            onChange(item.uid, {
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
                                            aria-invalid={Boolean(errors[`items.${index}.product_variant_id`])}
                                        />
                                        <ComboboxContent className="w-max min-w-(--anchor-width)">
                                            <ComboboxEmpty>No product variant found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(value) => (
                                                    <ComboboxItem
                                                        key={value.id}
                                                        value={value}
                                                        disabled={
                                                            mode === 'opening'
                                                                ? value.has_inventory_history
                                                                : mode !== 'adjustment-in' && Number(value.available_quantity) <= 0
                                                        }
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{value.purchase_label}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {mode === 'opening'
                                                                    ? value.has_inventory_history
                                                                        ? 'Inventory history already exists'
                                                                        : 'Eligible for opening stock'
                                                                    : `Available: ${formatQuantity(value.available_quantity ?? 0)} · Avg: ${formatCurrency(value.average_cost ?? 0)}`}
                                                            </span>
                                                        </div>
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <FieldError>{errors[`items.${index}.product_variant_id`]}</FieldError>
                                    {disabled && (
                                        <p className="mt-1 text-xs text-destructive">This variant is not eligible for this operation.</p>
                                    )}
                                </td>
                                <td>
                                    <Combobox
                                        items={conversions}
                                        value={conversion}
                                        onValueChange={(value) =>
                                            onChange(item.uid, { unit_of_measurement_id: value?.unit_of_measurement_id.toString() ?? '' })
                                        }
                                        itemToStringLabel={(value) => value.unit_of_measurement?.name ?? ''}
                                        itemToStringValue={(value) => value.unit_of_measurement_id.toString()}
                                        disabled={!variant}
                                    >
                                        <ComboboxInput
                                            placeholder="Unit"
                                            disabled={!variant}
                                            showClear
                                            aria-invalid={Boolean(errors[`items.${index}.unit_of_measurement_id`])}
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
                                    <FieldError>{errors[`items.${index}.unit_of_measurement_id`]}</FieldError>
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={item.quantity}
                                        onChange={(event) => onChange(item.uid, { quantity: event.target.value })}
                                        className="no-number-spinner text-right"
                                        aria-invalid={Boolean(errors[`items.${index}.quantity`])}
                                    />
                                    <FieldError>{errors[`items.${index}.quantity`]}</FieldError>
                                </td>
                                <td>
                                    {isCostEditable ? (
                                        <Input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={item.unit_cost}
                                            onChange={(event) => onChange(item.uid, { unit_cost: event.target.value })}
                                            onBlur={() => onChange(item.uid, { unit_cost: formatDecimal(item.unit_cost) })}
                                            className="no-number-spinner text-right"
                                            aria-invalid={Boolean(errors[`items.${index}.unit_cost`])}
                                        />
                                    ) : (
                                        <div className="text-right tabular-nums">
                                            {variant ? formatCurrency(variant.average_cost ?? 0) : '-'}
                                        </div>
                                    )}
                                    <FieldError>{errors[`items.${index}.unit_cost`]}</FieldError>
                                </td>
                                <td className="text-right tabular-nums">{baseQuantity ? formatQuantity(baseQuantity) : '-'}</td>
                                <td className="text-right font-medium tabular-nums">
                                    {baseQuantity && cost >= 0 ? formatCurrency(lineValue) : '-'}
                                </td>
                                <td>
                                    <Textarea
                                        value={item.note}
                                        onChange={(event) => onChange(item.uid, { note: event.target.value })}
                                        rows={1}
                                        placeholder="Optional"
                                    />
                                    <FieldError>{errors[`items.${index}.note`]}</FieldError>
                                </td>
                                <td>
                                    {items.length > 1 && (
                                        <Action
                                            name="remove"
                                            label="Remove item"
                                            icon={Trash2}
                                            color="danger"
                                            appearance="icon-button"
                                            onClick={() => onRemove(item.uid)}
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
    );
}
