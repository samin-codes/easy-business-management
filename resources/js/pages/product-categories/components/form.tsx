import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import ProductCategoryController from '@/actions/App/Http/Controllers/ProductCategoryController';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Section, SectionContent } from '@/components/ui/section';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { ProductCategory } from '../types';

export default function ProductCategoryForm({
    productCategory,
    statusOptions,
    cancelHref,
}: {
    productCategory?: ProductCategory;
    statusOptions: Option[];
    cancelHref: string;
}) {
    return (
        <Form
            action={productCategory ? ProductCategoryController.update(productCategory.id) : ProductCategoryController.store()}
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
                                    <FieldLabel htmlFor="name">
                                        Category name <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={productCategory?.name ?? ''}
                                        aria-invalid={Boolean(errors.name)}
                                        placeholder="Electronics"
                                    />
                                    <FieldError errors={[{ message: errors.name }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={productCategory?.description ?? ''}
                                        aria-invalid={Boolean(errors.description)}
                                        placeholder="Brief description of this category"
                                        className="min-h-24 resize-none"
                                    />
                                    <FieldError errors={[{ message: errors.description }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="status">
                                        Status <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <RadioGroup name="status" defaultValue={productCategory?.status ?? 'active'} className="flex flex-row gap-6">
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
                            {processing ? 'Saving...' : productCategory ? 'Update Category' : 'Create Category'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
