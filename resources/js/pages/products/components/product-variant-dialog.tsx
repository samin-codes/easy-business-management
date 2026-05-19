import { Form } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import ProductVariantController from '@/actions/App/Http/Controllers/ProductVariantController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Option } from '@/types';
import type { Brand, Product, ProductGradeUnit, ProductSizeUnit, ProductVariant } from '../types';

export default function ProductVariantDialog({
    product,
    productVariant,
    brands,
    productGradeUnits,
    productSizeUnits,
    statusOptions,
    open,
    onClose,
}: {
    product: Product;
    productVariant: ProductVariant | null;
    brands: Brand[];
    productGradeUnits: ProductGradeUnit[];
    productSizeUnits: ProductSizeUnit[];
    statusOptions: Option[];
    open: boolean;
    onClose: () => void;
}) {
    const isEditMode = Boolean(productVariant);

    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(productVariant?.brand ?? null);
    const [selectedGradeUnit, setSelectedGradeUnit] = useState<ProductGradeUnit | null>(productVariant?.grade_unit ?? null);
    const [selectedSizeUnit, setSelectedSizeUnit] = useState<ProductSizeUnit | null>(productVariant?.size_unit ?? null);

    const [isPlaceholderVariant, setIsPlaceholderVariant] = useState(productVariant?.is_placeholder_variant ?? false);
    const [status, setStatus] = useState(productVariant?.status ?? 'active');

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
                className="sm:max-w-3xl"
                onInteractOutside={(event) => {
                    if (event.target instanceof HTMLElement && event.target.closest('[data-slot="combobox-content"]')) {
                        event.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Product Variant' : 'Add Product Variant'}</DialogTitle>
                    <DialogDescription className="sr-only">Product variant form.</DialogDescription>
                </DialogHeader>

                <Form
                    action={
                        productVariant
                            ? ProductVariantController.update({
                                  product,
                                  product_variant: productVariant.id,
                              })
                            : ProductVariantController.store({ product })
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
                                    <label htmlFor="variant_name" className="text-sm font-medium">
                                        Variant name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="variant_name"
                                        name="variant_name"
                                        defaultValue={productVariant?.variant_name ?? ''}
                                        aria-invalid={Boolean(errors.variant_name)}
                                        placeholder="Local Mill / 80 GSM / 23x36"
                                    />
                                    <InputError message={errors.variant_name} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="sku" className="text-sm font-medium">
                                        SKU <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="sku"
                                        name="sku"
                                        defaultValue={productVariant?.sku ?? ''}
                                        aria-invalid={Boolean(errors.sku)}
                                        placeholder="OFF-80-2336-001"
                                    />
                                    <InputError message={errors.sku} />
                                </div>

                                <div className="flex flex-col gap-1 md:col-span-2">
                                    <input type="hidden" name="is_placeholder_variant" value={isPlaceholderVariant ? '1' : '0'} readOnly />
                                    <label
                                        htmlFor="is_placeholder_variant"
                                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                                    >
                                        <Checkbox
                                            id="is_placeholder_variant"
                                            checked={isPlaceholderVariant}
                                            onCheckedChange={(checked) => setIsPlaceholderVariant(checked === true)}
                                            aria-invalid={Boolean(errors.is_placeholder_variant)}
                                        />
                                        Use as default variant
                                    </label>
                                    <div className="pl-6 text-xs leading-5 text-muted-foreground">
                                        Use when this product does not need separate brand, grade, or size variants.
                                    </div>
                                    <InputError message={errors.is_placeholder_variant} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="brand_id" className="text-sm font-medium">
                                        Brand
                                    </label>
                                    <input type="hidden" name="brand_id" value={selectedBrand?.id ?? ''} readOnly />
                                    <Combobox
                                        items={brands}
                                        value={selectedBrand}
                                        onValueChange={setSelectedBrand}
                                        itemToStringLabel={(brand) => brand.name}
                                        itemToStringValue={(brand) => brand.id.toString()}
                                    >
                                        <ComboboxInput
                                            id="brand_id"
                                            placeholder="Select brand"
                                            aria-invalid={Boolean(errors.brand_id)}
                                            showClear
                                            className="w-full"
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No brand found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(brand) => (
                                                    <ComboboxItem key={brand.id} value={brand}>
                                                        {brand.name}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError message={errors.brand_id} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="grade_value" className="text-sm font-medium">
                                        Grade value
                                    </label>
                                    <Input
                                        id="grade_value"
                                        name="grade_value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={productVariant?.grade_value ?? ''}
                                        aria-invalid={Boolean(errors.grade_value)}
                                        placeholder="80"
                                    />
                                    <InputError message={errors.grade_value} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="grade_unit_id" className="text-sm font-medium">
                                        Grade unit
                                    </label>
                                    <input type="hidden" name="grade_unit_id" value={selectedGradeUnit?.id ?? ''} readOnly />
                                    <Combobox
                                        items={productGradeUnits}
                                        value={selectedGradeUnit}
                                        onValueChange={setSelectedGradeUnit}
                                        itemToStringLabel={(gradeUnit) => gradeUnit.code}
                                        itemToStringValue={(gradeUnit) => gradeUnit.id.toString()}
                                    >
                                        <ComboboxInput
                                            id="grade_unit_id"
                                            placeholder="Select grade unit"
                                            aria-invalid={Boolean(errors.grade_unit_id)}
                                            showClear
                                            className="w-full"
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No grade unit found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(gradeUnit) => (
                                                    <ComboboxItem key={gradeUnit.id} value={gradeUnit}>
                                                        {gradeUnit.code}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError message={errors.grade_unit_id} />
                                </div>

                                <div className="grid gap-5 md:col-span-2 md:grid-cols-3">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="width" className="text-sm font-medium">
                                            Width
                                        </label>
                                        <Input
                                            id="width"
                                            name="width"
                                            type="number"
                                            min="1"
                                            defaultValue={productVariant?.width ?? ''}
                                            aria-invalid={Boolean(errors.width)}
                                            placeholder="23"
                                        />
                                        <InputError message={errors.width} />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="height" className="text-sm font-medium">
                                            Height
                                        </label>
                                        <Input
                                            id="height"
                                            name="height"
                                            type="number"
                                            min="1"
                                            defaultValue={productVariant?.height ?? ''}
                                            aria-invalid={Boolean(errors.height)}
                                            placeholder="36"
                                        />
                                        <InputError message={errors.height} />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="size_unit_id" className="text-sm font-medium">
                                            Size unit
                                        </label>
                                        <input type="hidden" name="size_unit_id" value={selectedSizeUnit?.id ?? ''} readOnly />
                                        <Combobox
                                            items={productSizeUnits}
                                            value={selectedSizeUnit}
                                            onValueChange={setSelectedSizeUnit}
                                            itemToStringLabel={(sizeUnit) => sizeUnit.code}
                                            itemToStringValue={(sizeUnit) => sizeUnit.id.toString()}
                                        >
                                            <ComboboxInput
                                                id="size_unit_id"
                                                placeholder="Select size unit"
                                                aria-invalid={Boolean(errors.size_unit_id)}
                                                showClear
                                                className="w-full"
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>No size unit found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(sizeUnit) => (
                                                        <ComboboxItem key={sizeUnit.id} value={sizeUnit}>
                                                            {sizeUnit.code}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        <InputError message={errors.size_unit_id} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="size_label" className="text-sm font-medium">
                                        Size label
                                    </label>
                                    <Input
                                        id="size_label"
                                        name="size_label"
                                        defaultValue={productVariant?.size_label ?? ''}
                                        aria-invalid={Boolean(errors.size_label)}
                                        placeholder="A4 or 23x36"
                                    />
                                    <InputError message={errors.size_label} />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label htmlFor="status" className="text-sm font-medium">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <input type="hidden" name="status" value={status} readOnly />
                                    <RadioGroup
                                        value={status}
                                        onValueChange={setStatus}
                                        className="flex min-h-9 flex-row items-center gap-6"
                                    >
                                        {statusOptions.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`variant_status_${option.value}`}
                                                    aria-invalid={Boolean(errors.status)}
                                                />
                                                <label htmlFor={`variant_status_${option.value}`} className="text-sm font-medium">
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
                                    {processing ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Variant'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
