import { Form } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import ProductUnitConversionController from '@/actions/App/Http/Controllers/ProductUnitConversionController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Option, Product, ProductUnitConversion, UnitOfMeasurement } from '@/types';

export default function UnitConversionDialog({
    product,
    unitConversion,
    units,
    statusOptions,
    open,
    onClose,
}: {
    product: Product;
    unitConversion: ProductUnitConversion | null;
    units: Pick<UnitOfMeasurement, 'id' | 'name'>[];
    statusOptions: Option[];
    open: boolean;
    onClose: () => void;
}) {
    const isEditMode = Boolean(unitConversion);
    const isBaseConversion = unitConversion?.is_base_unit === true;

    const [selectedUnit, setSelectedUnit] = useState<Pick<UnitOfMeasurement, 'id' | 'name'> | null>(
        unitConversion?.unit_of_measurement ?? null,
    );

    const [selectedUnitQuantity, setSelectedUnitQuantity] = useState(unitConversion?.conversion_unit_quantity ?? '');

    const [baseUnitQuantity, setBaseUnitQuantity] = useState(unitConversion?.base_unit_quantity ?? '');

    const selectedUnitName = selectedUnit?.name ?? 'Unit';
    const baseUnitName = product.base_unit_of_measurement?.name ?? 'Base unit';

    const hasConversionQuantities =
        selectedUnitQuantity !== '' && baseUnitQuantity !== '' && Number(selectedUnitQuantity) > 0 && Number(baseUnitQuantity) > 0;

    const conversionFactor = hasConversionQuantities ? String(Number(baseUnitQuantity) / Number(selectedUnitQuantity)) : '';

    return (
        <Dialog
            modal={false}
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent
                className="sm:max-w-xl"
                onInteractOutside={(event) => {
                    if (event.target instanceof HTMLElement && event.target.closest('[data-slot="combobox-content"]')) {
                        event.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Unit Conversion' : 'Add Unit Conversion'}</DialogTitle>
                    <DialogDescription className="sr-only">Product unit conversion form.</DialogDescription>
                </DialogHeader>

                <Form
                    action={
                        unitConversion
                            ? ProductUnitConversionController.update({
                                  product,
                                  product_unit_conversion: unitConversion.id,
                              })
                            : ProductUnitConversionController.store({
                                  product,
                              })
                    }
                    options={{ preserveScroll: true }}
                    onSuccess={onClose}
                    disableWhileProcessing
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <FieldGroup className="gap-5">
                                <Field className="sm:w-1/2">
                                    <FieldLabel htmlFor="unit_of_measurement_id">
                                        Unit <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>

                                    <Combobox
                                        name="unit_of_measurement_id"
                                        items={units}
                                        value={selectedUnit}
                                        onValueChange={setSelectedUnit}
                                        itemToStringLabel={(unit) => unit.name}
                                        itemToStringValue={(unit) => unit.id.toString()}
                                        readOnly={isEditMode}
                                    >
                                        <ComboboxInput
                                            id="unit_of_measurement_id"
                                            placeholder="Select unit"
                                            disabled={isEditMode}
                                            aria-invalid={Boolean(errors.unit_of_measurement_id)}
                                            showClear={!isEditMode}
                                            className="w-full"
                                        />

                                        <ComboboxContent>
                                            <ComboboxEmpty>No unit found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(unit) => (
                                                    <ComboboxItem key={unit.id} value={unit}>
                                                        {unit.name}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>

                                    <FieldError
                                        errors={[
                                            {
                                                message: errors.unit_of_measurement_id ?? errors.product_unit_conversion,
                                            },
                                        ]}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>
                                        Conversion <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>

                                    <input type="hidden" name="conversion_factor_to_base" value={conversionFactor} readOnly />

                                    <div className="flex flex-col gap-3">
                                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                                            <div className="min-w-0">
                                                <FieldLabel htmlFor="selected_unit_quantity" className="sr-only">
                                                    Selected unit quantity
                                                </FieldLabel>

                                                <InputGroup data-disabled={isBaseConversion || undefined}>
                                                    <InputGroupInput
                                                        id="selected_unit_quantity"
                                                        type="number"
                                                        step="0.001"
                                                        min="0.001"
                                                        value={selectedUnitQuantity}
                                                        onChange={(event) => setSelectedUnitQuantity(event.target.value)}
                                                        onBlur={() => {
                                                            if (selectedUnitQuantity !== '') {
                                                                setSelectedUnitQuantity(formatNumber(selectedUnitQuantity));
                                                            }
                                                        }}
                                                        disabled={isBaseConversion}
                                                        aria-invalid={Boolean(errors.conversion_factor_to_base)}
                                                        className="no-number-spinner min-w-16 text-right"
                                                    />

                                                    <InputGroupAddon align="inline-end" className="max-w-28">
                                                        <InputGroupText className="truncate" title={selectedUnitName}>
                                                            {selectedUnitName}
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </div>

                                            <span className="text-center text-sm font-medium text-muted-foreground">=</span>

                                            <div className="min-w-0">
                                                <FieldLabel htmlFor="base_unit_quantity" className="sr-only">
                                                    Base unit quantity
                                                </FieldLabel>

                                                <InputGroup data-disabled={isBaseConversion || undefined}>
                                                    <InputGroupInput
                                                        id="base_unit_quantity"
                                                        type="number"
                                                        step="0.001"
                                                        min="0.001"
                                                        value={baseUnitQuantity}
                                                        onChange={(event) => setBaseUnitQuantity(event.target.value)}
                                                        onBlur={() => {
                                                            if (baseUnitQuantity !== '') {
                                                                setBaseUnitQuantity(formatNumber(baseUnitQuantity));
                                                            }
                                                        }}
                                                        disabled={isBaseConversion}
                                                        aria-invalid={Boolean(errors.conversion_factor_to_base)}
                                                        className="no-number-spinner min-w-16 text-right"
                                                    />

                                                    <InputGroupAddon align="inline-end" className="max-w-28">
                                                        <InputGroupText className="truncate" title={baseUnitName}>
                                                            {baseUnitName}
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </div>
                                        </div>

                                        <div className="text-left text-xs text-muted-foreground">
                                            {isBaseConversion
                                                ? `Base unit conversion is always 1 ${baseUnitName} = 1 ${baseUnitName}`
                                                : hasConversionQuantities
                                                  ? `Factor: ${formatNumber(baseUnitQuantity)} / ${formatNumber(selectedUnitQuantity)} = ${formatNumber(conversionFactor)}`
                                                  : 'Enter both quantities to calculate the conversion factor.'}
                                        </div>
                                    </div>

                                    <FieldError
                                        errors={[
                                            {
                                                message: errors.conversion_factor_to_base,
                                            },
                                        ]}
                                    />
                                </Field>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field className="gap-3">
                                        <FieldLabel>Default for</FieldLabel>

                                        <div className="grid gap-3">
                                            <Field className="gap-1">
                                                <input type="hidden" name="is_default_purchase_unit" value="0" />

                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id="is_default_purchase_unit"
                                                        name="is_default_purchase_unit"
                                                        value="1"
                                                        defaultChecked={unitConversion?.is_default_purchase_unit ?? false}
                                                        aria-invalid={Boolean(errors.is_default_purchase_unit)}
                                                        className="mt-0.5"
                                                    />

                                                    <FieldContent className="gap-1">
                                                        <FieldLabel htmlFor="is_default_purchase_unit">Purchases</FieldLabel>
                                                        <FieldError
                                                            errors={[
                                                                {
                                                                    message: errors.is_default_purchase_unit,
                                                                },
                                                            ]}
                                                        />
                                                    </FieldContent>
                                                </div>
                                            </Field>

                                            <Field className="gap-1">
                                                <input type="hidden" name="is_default_sale_unit" value="0" />

                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id="is_default_sale_unit"
                                                        name="is_default_sale_unit"
                                                        value="1"
                                                        defaultChecked={unitConversion?.is_default_sale_unit ?? false}
                                                        aria-invalid={Boolean(errors.is_default_sale_unit)}
                                                        className="mt-0.5"
                                                    />

                                                    <FieldContent className="gap-1">
                                                        <FieldLabel htmlFor="is_default_sale_unit">Sales</FieldLabel>
                                                        <FieldError
                                                            errors={[
                                                                {
                                                                    message: errors.is_default_sale_unit,
                                                                },
                                                            ]}
                                                        />
                                                    </FieldContent>
                                                </div>
                                            </Field>
                                        </div>
                                    </Field>

                                    <Field>
                                        <FieldLabel id="unit_conversion_status_label">
                                            Status <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>

                                        <RadioGroup
                                            name="status"
                                            defaultValue={unitConversion?.status ?? 'active'}
                                            aria-labelledby="unit_conversion_status_label"
                                            className="flex flex-row items-center gap-6 pt-2"
                                        >
                                            {statusOptions.map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value={option.value}
                                                        id={`unit_conversion_status_${option.value}`}
                                                        aria-invalid={Boolean(errors.status)}
                                                    />
                                                    <label
                                                        htmlFor={`unit_conversion_status_${option.value}`}
                                                        className="text-sm font-medium"
                                                    >
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        <FieldError
                                            errors={[
                                                {
                                                    message: errors.status,
                                                },
                                            ]}
                                        />
                                    </Field>
                                </div>
                            </FieldGroup>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        <X className="size-4" />
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    {processing ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Unit Conversion'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function formatNumber(value: string | number): string {
    return new Intl.NumberFormat('en', {
        maximumFractionDigits: 3,
        useGrouping: false,
    }).format(Number(value));
}
