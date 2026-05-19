import { Form } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import ProductUnitConversionController from '@/actions/App/Http/Controllers/ProductUnitConversionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Option } from '@/types';
import type { Product, ProductUnitConversion, UnitOfMeasurement } from '../types';

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
    units: UnitOfMeasurement[];
    statusOptions: Option[];
    open: boolean;
    onClose: () => void;
}) {
    const isEditMode = Boolean(unitConversion);
    const isBaseConversion = unitConversion?.is_base_unit === true;

    const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasurement | null>(unitConversion?.unit_of_measurement ?? null);
    const [selectedUnitQuantity, setSelectedUnitQuantity] = useState(unitConversion?.conversion_unit_quantity ?? '');
    const [baseUnitQuantity, setBaseUnitQuantity] = useState(unitConversion?.base_unit_quantity ?? '');
    const [isDefaultPurchaseUnit, setIsDefaultPurchaseUnit] = useState(unitConversion?.is_default_purchase_unit ?? false);
    const [isDefaultSaleUnit, setIsDefaultSaleUnit] = useState(unitConversion?.is_default_sale_unit ?? false);
    const [status, setStatus] = useState(unitConversion?.status ?? 'active');

    const selectedUnitName = selectedUnit?.name ?? 'N/A';
    const baseUnitName = product.base_unit_of_measurement.name;

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
                className="sm:max-w-2xl"
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
                            : ProductUnitConversionController.store({ product })
                    }
                    options={{ preserveScroll: true }}
                    onSuccess={onClose}
                    disableWhileProcessing
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="unit_of_measurement_id" className="text-sm font-medium">
                                        Unit <span className="text-red-500">*</span>
                                    </label>

                                    <input type="hidden" name="unit_of_measurement_id" value={selectedUnit?.id ?? ''} readOnly />

                                    <Combobox
                                        items={units}
                                        value={selectedUnit}
                                        onValueChange={setSelectedUnit}
                                        itemToStringLabel={(unit) => unit.name}
                                        itemToStringValue={(unit) => unit.id.toString()}
                                        disabled={isEditMode}
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

                                    <InputError message={errors.unit_of_measurement_id ?? errors.product_unit_conversion} />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label htmlFor="selected_unit_quantity" className="text-sm font-medium">
                                        Conversion <span className="text-red-500">*</span>
                                    </label>
                                    <input type="hidden" name="conversion_factor_to_base" value={conversionFactor} readOnly />

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-end justify-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-muted-foreground">Selected unit quantity</span>
                                                <div className="flex items-center gap-2">
                                                    <Input
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
                                                        className="no-number-spinner w-28 text-right"
                                                    />
                                                    <span className="text-sm text-muted-foreground">{selectedUnitName}</span>
                                                </div>
                                            </div>

                                            <span className="pb-1.5 text-sm text-muted-foreground">=</span>

                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-muted-foreground">Base unit quantity</span>
                                                <div className="flex items-center gap-2">
                                                    <Input
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
                                                        className="no-number-spinner w-28 text-right"
                                                    />
                                                    <span className="text-sm text-muted-foreground">{baseUnitName}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center text-xs text-muted-foreground">
                                            {isBaseConversion
                                                ? `Base unit conversion is always 1 ${baseUnitName} = 1 ${baseUnitName}`
                                                : hasConversionQuantities
                                                  ? `Factor: ${formatNumber(baseUnitQuantity)} / ${formatNumber(selectedUnitQuantity)} = ${formatNumber(conversionFactor)}`
                                                  : 'Enter both quantities to calculate the conversion factor.'}
                                        </div>
                                    </div>

                                    <InputError message={errors.conversion_factor_to_base} />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <input
                                        type="hidden"
                                        name="is_default_purchase_unit"
                                        value={isDefaultPurchaseUnit ? '1' : '0'}
                                        readOnly
                                    />
                                    <label
                                        htmlFor="is_default_purchase_unit"
                                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                                    >
                                        <Checkbox
                                            id="is_default_purchase_unit"
                                            checked={isDefaultPurchaseUnit}
                                            onCheckedChange={(checked) => setIsDefaultPurchaseUnit(checked === true)}
                                            aria-invalid={Boolean(errors.is_default_purchase_unit)}
                                        />
                                        Use for purchases by default
                                    </label>
                                    <InputError message={errors.is_default_purchase_unit} />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <input type="hidden" name="is_default_sale_unit" value={isDefaultSaleUnit ? '1' : '0'} readOnly />
                                    <label
                                        htmlFor="is_default_sale_unit"
                                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                                    >
                                        <Checkbox
                                            id="is_default_sale_unit"
                                            checked={isDefaultSaleUnit}
                                            onCheckedChange={(checked) => setIsDefaultSaleUnit(checked === true)}
                                            aria-invalid={Boolean(errors.is_default_sale_unit)}
                                        />
                                        Use for sales by default
                                    </label>
                                    <InputError message={errors.is_default_sale_unit} />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label htmlFor="unit_conversion_status" className="text-sm font-medium">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <input type="hidden" name="status" value={status} readOnly />
                                    <RadioGroup value={status} onValueChange={setStatus} className="flex flex-row items-center gap-6">
                                        {statusOptions.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`unit_conversion_status_${option.value}`}
                                                    aria-invalid={Boolean(errors.status)}
                                                />
                                                <label htmlFor={`unit_conversion_status_${option.value}`} className="text-sm font-medium">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

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
