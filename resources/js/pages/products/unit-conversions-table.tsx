import { router, useForm } from '@inertiajs/react';
import { Check, Plus, SquarePen, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import ProductUnitConversionController from '@/actions/App/Http/Controllers/ProductUnitConversionController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Option } from '@/types';
import type { Product, ProductUnitConversion, ProductUnitConversionFormData, UnitOfMeasurement } from './types';

type ActiveRow = { mode: 'view' } | { mode: 'create' } | { mode: 'edit'; conversionId: number };

function createUnitConversionFormData(unitConversion?: ProductUnitConversion): ProductUnitConversionFormData {
    if (!unitConversion) {
        return {
            unit_of_measurement_id: '',
            conversion_factor_to_base: '',
            is_default_purchase_unit: false,
            is_default_sale_unit: false,
            status: 'active',
        };
    }

    return {
        id: unitConversion.id,
        unit_of_measurement_id: unitConversion.unit_of_measurement_id.toString(),
        conversion_factor_to_base: Number(unitConversion.conversion_factor_to_base).toFixed(2),
        is_default_purchase_unit: unitConversion.is_default_purchase_unit,
        is_default_sale_unit: unitConversion.is_default_sale_unit,
        status: unitConversion.status,
    };
}

export default function UnitConversionsTable({
    product,
    unitOfMeasurements,
    statusOptions,
}: {
    product: Product;
    unitOfMeasurements: UnitOfMeasurement[];
    statusOptions: Option[];
}) {
    const [activeRow, setActiveRow] = useState<ActiveRow>({ mode: 'view' });

    const unitConversions = product.unit_conversions ?? [];

    const baseUnitName = product.base_unit_of_measurement.name;

    const baseUnitConversion = unitConversions.find((unitConversion) => unitConversion.is_base_unit) ?? null;
    const hasAlternateUnitConversions = unitConversions.some((unitConversion) => !unitConversion.is_base_unit);

    const getAvailableUnitOptions = (currentUnitOfMeasurementId?: number): Option[] =>
        unitOfMeasurements
            .filter((unitOfMeasurement) => {
                if (currentUnitOfMeasurementId === unitOfMeasurement.id) {
                    return true;
                }

                return !unitConversions
                    .map((unitConversion) => unitConversion.unit_of_measurement_id)
                    .includes(unitOfMeasurement.id);
            })
            .map((unitOfMeasurement) => ({
                label: unitOfMeasurement.name,
                value: unitOfMeasurement.id.toString(),
            }));

    const handleCreate = () => {
        setActiveRow({ mode: 'create' });
    };

    const handleEdit = (conversion: ProductUnitConversion) => {
        setActiveRow({
            mode: 'edit',
            conversionId: conversion.id,
        });
    };

    const handleCancel = () => {
        setActiveRow({ mode: 'view' });
    };

    return (
        <div className="space-y-4">
            <div className="text-base font-medium">Unit Conversions</div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b">
                            <th className="h-10 px-3 text-left align-middle font-medium">Unit</th>
                            <th className="h-10 w-48 px-3 text-left align-middle font-medium">Factor</th>
                            <th className="h-10 w-16 px-3 text-center align-middle font-medium">Base</th>
                            <th className="h-10 w-24 px-3 text-center align-middle font-medium">D.Pur</th>
                            <th className="h-10 w-24 px-3 text-center align-middle font-medium">D.Sal</th>
                            <th className="h-10 w-28 px-3 text-left align-middle font-medium">Status</th>
                            <th className="h-10 w-24 px-3 text-right align-middle font-medium">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {unitConversions.map((conversion) => {
                            const isBaseConversion = baseUnitConversion?.id === conversion.id;

                            if (activeRow.mode === 'edit' && activeRow.conversionId === conversion.id) {
                                return isBaseConversion ? (
                                    <BaseUnitConversionFormRow
                                        key={conversion.id}
                                        product={product}
                                        unitConversion={conversion}
                                        baseUnitName={baseUnitName}
                                        onCancel={handleCancel}
                                        onSave={handleCancel}
                                    />
                                ) : (
                                    <UnitConversionFormRow
                                        key={conversion.id}
                                        product={product}
                                        baseUnitName={baseUnitName}
                                        availableUnitOptions={getAvailableUnitOptions(
                                            conversion.unit_of_measurement_id,
                                        )}
                                        statusOptions={statusOptions}
                                        unitConversion={conversion}
                                        isEditMode
                                        onCancel={handleCancel}
                                        onSave={handleCancel}
                                    />
                                );
                            }

                            return (
                                <UnitConversionRow
                                    key={conversion.id}
                                    product={product}
                                    conversion={conversion}
                                    baseUnitName={baseUnitName}
                                    isBaseConversion={isBaseConversion}
                                    onEdit={() => handleEdit(conversion)}
                                />
                            );
                        })}

                        {activeRow.mode === 'create' && (
                            <UnitConversionFormRow
                                key="create"
                                product={product}
                                baseUnitName={baseUnitName}
                                availableUnitOptions={getAvailableUnitOptions()}
                                statusOptions={statusOptions}
                                isEditMode={false}
                                onCancel={handleCancel}
                                onSave={handleCancel}
                            />
                        )}
                    </tbody>
                </table>
            </div>

            {!hasAlternateUnitConversions && activeRow.mode !== 'create' && (
                <div className="text-sm text-muted-foreground">
                    No alternate units defined. Add one to use this product in other quantities.
                </div>
            )}

            <div className="flex justify-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreate}
                    disabled={activeRow.mode !== 'view'}
                >
                    <Plus className="size-4" />
                    Add Unit Conversion
                </Button>
            </div>
        </div>
    );
}

function UnitConversionRow({
    product,
    conversion,
    baseUnitName,
    isBaseConversion,
    onEdit,
}: {
    product: Product;
    conversion: ProductUnitConversion;
    baseUnitName: string;
    isBaseConversion: boolean;
    onEdit?: () => void;
}) {
    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this unit conversion?')) {
            return;
        }

        router.delete(
            ProductUnitConversionController.destroy({
                product,
                product_unit_conversion: conversion.id,
            }),
            {
                preserveScroll: true,
                errorBag: 'productUnitConversion',
                onError: (errors: Record<string, string>) => {
                    alert(errors.product_unit_conversion ?? 'Unable to delete this unit conversion.');
                },
            },
        );
    };

    return (
        <tr
            className={
                isBaseConversion ? 'border-b bg-muted/30 font-semibold' : 'border-b transition-colors hover:bg-muted/50'
            }
        >
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">{conversion.unit_of_measurement.name}</div>
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">
                    {`1 ${conversion.unit_of_measurement.name} = ${Number(conversion.conversion_factor_to_base).toFixed(2)} ${baseUnitName}`}
                </div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">{isBaseConversion ? 'Yes' : '-'}</div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">
                    {conversion.is_default_purchase_unit ? 'Yes' : '-'}
                </div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">
                    {conversion.is_default_sale_unit ? 'Yes' : '-'}
                </div>
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">
                    <Badge
                        variant="outline"
                        className={
                            conversion.status === 'active'
                                ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                        }
                    >
                        {conversion.status_label}
                    </Badge>
                </div>
            </td>
            <td className="px-3 py-3 text-right align-top">
                <div className="flex min-h-9 items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit}>
                        <SquarePen className="size-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    {!isBaseConversion && (
                        <Button type="button" variant="ghost" size="icon-sm" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

function BaseUnitConversionFormRow({
    product,
    unitConversion,
    baseUnitName,
    onCancel,
    onSave,
}: {
    product: Product;
    unitConversion: ProductUnitConversion;
    baseUnitName: string;
    onCancel: () => void;
    onSave: () => void;
}) {
    const form = useForm<ProductUnitConversionFormData>(createUnitConversionFormData(unitConversion));

    const handleSubmit = () => {
        if (!form.data.id) {
            return;
        }

        form.submit(
            ProductUnitConversionController.update({
                product,
                product_unit_conversion: form.data.id,
            }),
            {
                preserveScroll: true,
                errorBag: 'productUnitConversion',
                onSuccess: onSave,
            },
        );
    };

    return (
        <tr className="border-b bg-muted/30 font-semibold">
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">{unitConversion.unit_of_measurement.name}</div>
                <InputError message={form.errors.product_unit_conversion} />
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center text-sm">{`1 ${unitConversion.unit_of_measurement.name} = 1 ${baseUnitName}`}</div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">Yes</div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">
                    <Checkbox
                        checked={form.data.is_default_purchase_unit}
                        onCheckedChange={(checked) => form.setData('is_default_purchase_unit', checked === true)}
                    />
                </div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">
                    <Checkbox
                        checked={form.data.is_default_sale_unit}
                        onCheckedChange={(checked) => form.setData('is_default_sale_unit', checked === true)}
                    />
                </div>
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">
                    <Badge
                        variant="outline"
                        className={
                            form.data.status === 'active'
                                ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                        }
                    >
                        {unitConversion.status_label}
                    </Badge>
                </div>
            </td>
            <td className="px-3 py-3 text-right align-top">
                <div className="flex min-h-9 items-center justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleSubmit}
                        disabled={form.processing}
                    >
                        <Check className="size-4" />
                        <span className="sr-only">Save</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel}>
                        <X className="size-4" />
                        <span className="sr-only">Cancel</span>
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function UnitConversionFormRow({
    product,
    baseUnitName,
    availableUnitOptions,
    statusOptions,
    unitConversion,
    isEditMode,
    onCancel,
    onSave,
}: {
    product: Product;
    baseUnitName: string;
    availableUnitOptions: Option[];
    statusOptions: Option[];
    unitConversion?: ProductUnitConversion;
    isEditMode: boolean;
    onCancel: () => void;
    onSave: () => void;
}) {
    const form = useForm<ProductUnitConversionFormData>(createUnitConversionFormData(unitConversion));

    const selectedUnitOption = availableUnitOptions.find(
        (unitOption) => unitOption.value === form.data.unit_of_measurement_id,
    );
    const selectedUnitName = selectedUnitOption?.label ?? 'Selected Unit';

    const handleSubmit = () => {
        if (isEditMode) {
            if (!form.data.id) {
                return;
            }

            form.submit(
                ProductUnitConversionController.update({
                    product,
                    product_unit_conversion: form.data.id,
                }),
                {
                    preserveScroll: true,
                    errorBag: 'productUnitConversion',
                    onSuccess: onSave,
                },
            );

            return;
        }

        form.submit(ProductUnitConversionController.store({ product }), {
            preserveScroll: true,
            errorBag: 'productUnitConversion',
            onSuccess: onSave,
        });
    };

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">
                    <Combobox
                        items={availableUnitOptions}
                        value={selectedUnitOption}
                        onValueChange={(unitOption) => form.setData('unit_of_measurement_id', unitOption?.value ?? '')}
                        itemToStringValue={(unitOption) => unitOption.value}
                        disabled={isEditMode}
                    >
                        <ComboboxInput
                            placeholder="Select unit"
                            className="w-full"
                            disabled={isEditMode}
                            aria-invalid={Boolean(form.errors.unit_of_measurement_id)}
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>No unit found.</ComboboxEmpty>
                            <ComboboxList>
                                {(unitOption) => (
                                    <ComboboxItem key={unitOption.value} value={unitOption}>
                                        {unitOption.label}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
                <InputError message={form.errors.unit_of_measurement_id ?? form.errors.product_unit_conversion} />
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">
                    <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.data.conversion_factor_to_base}
                        onChange={(event) => form.setData('conversion_factor_to_base', event.target.value)}
                        aria-invalid={Boolean(form.errors.conversion_factor_to_base)}
                        className="no-number-spinner text-right"
                    />
                </div>
                <InputError message={form.errors.conversion_factor_to_base} />
                <div className="mt-1 text-xs text-muted-foreground">
                    {`1 ${selectedUnitName} = ${Number(form.data.conversion_factor_to_base || '0').toFixed(2)} ${baseUnitName}`}
                </div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">-</div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">
                    <Checkbox
                        checked={form.data.is_default_purchase_unit}
                        onCheckedChange={(checked) => form.setData('is_default_purchase_unit', checked === true)}
                    />
                </div>
            </td>
            <td className="px-3 py-3 text-center align-top">
                <div className="flex min-h-9 items-center justify-center">
                    <Checkbox
                        checked={form.data.is_default_sale_unit}
                        onCheckedChange={(checked) => form.setData('is_default_sale_unit', checked === true)}
                    />
                </div>
            </td>
            <td className="px-3 py-3 align-top">
                <div className="flex min-h-9 items-center">
                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                        <SelectTrigger className="w-full" aria-invalid={Boolean(form.errors.status)}>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((statusOption) => (
                                <SelectItem key={statusOption.value} value={statusOption.value}>
                                    {statusOption.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <InputError message={form.errors.status} />
            </td>
            <td className="px-3 py-3 text-right align-top">
                <div className="flex min-h-9 items-center justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleSubmit}
                        disabled={form.processing}
                    >
                        <Check className="size-4" />
                        <span className="sr-only">Save</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel}>
                        <X className="size-4" />
                        <span className="sr-only">Cancel</span>
                    </Button>
                </div>
            </td>
        </tr>
    );
}
