import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Section, SectionContent } from '@/components/ui/section';
import type { Option } from '@/types';
import type { Product, ProductCategory, UnitOfMeasurement } from '../types';

export default function ProductForm({
    product,
    productCategories,
    unitOfMeasurements,
    statusOptions,
    cancelHref,
}: {
    product?: Product;
    productCategories: ProductCategory[];
    unitOfMeasurements: UnitOfMeasurement[];
    statusOptions: Option[];
    cancelHref: string;
}) {
    const categoryOptions: Option[] = productCategories.map((category) => ({
        label: category.name,
        value: category.id.toString(),
    }));

    const unitOptions: Option[] = unitOfMeasurements.map((unit) => ({
        label: unit.name,
        value: unit.id.toString(),
    }));

    const selectedCategory = categoryOptions.find((category) => category.value === product?.product_category_id?.toString()) ?? null;

    const selectedUnit = unitOptions.find((unit) => unit.value === product?.base_unit_of_measurement_id?.toString()) ?? null;

    return (
        <Form
            action={product ? ProductController.update(product.id) : ProductController.store()}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <Section>
                        <SectionContent>
                            <FieldGroup className="grid gap-6 xl:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="product_category_id">
                                        Product Category <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Combobox
                                        name="product_category_id"
                                        items={categoryOptions}
                                        defaultValue={selectedCategory}
                                        itemToStringValue={(category) => category.value}
                                    >
                                        <ComboboxInput
                                            id="product_category_id"
                                            placeholder="Select category"
                                            aria-invalid={Boolean(errors.product_category_id)}
                                            className="w-full"
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No category found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(category) => (
                                                    <ComboboxItem key={category.value} value={category}>
                                                        {category.label}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <FieldError errors={[{ message: errors.product_category_id }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="base_unit_of_measurement_id">
                                        Base Unit of Measurement <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Combobox
                                        name="base_unit_of_measurement_id"
                                        items={unitOptions}
                                        defaultValue={selectedUnit}
                                        itemToStringValue={(unit) => unit.value}
                                    >
                                        <ComboboxInput
                                            id="base_unit_of_measurement_id"
                                            placeholder="Select unit"
                                            aria-invalid={Boolean(errors.base_unit_of_measurement_id)}
                                            className="w-full"
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
                                    <FieldError errors={[{ message: errors.base_unit_of_measurement_id }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Product name <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={product?.name ?? ''}
                                        aria-invalid={Boolean(errors.name)}
                                        placeholder="Cotton T-Shirt"
                                    />
                                    <FieldError errors={[{ message: errors.name }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="status">
                                        Status <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <RadioGroup name="status" defaultValue={product?.status ?? 'active'} className="flex flex-row gap-6">
                                        {statusOptions.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`status_${option.value}`}
                                                    aria-invalid={Boolean(errors.status)}
                                                />
                                                <label htmlFor={`status_${option.value}`} className="text-sm font-medium">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <FieldError errors={[{ message: errors.status }]} />
                                </Field>
                            </FieldGroup>
                        </SectionContent>
                    </Section>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={cancelHref}>
                                <X />
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save />
                            {processing ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
