import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import ProductCategoryController from '@/actions/App/Http/Controllers/ProductCategoryController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    const [status, setStatus] = useState(productCategory?.status ?? 'active');

    return (
        <Form
            action={productCategory ? ProductCategoryController.update(productCategory.id) : ProductCategoryController.store()}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <div className="flex flex-col gap-7">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Category name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={productCategory?.name ?? ''}
                                aria-invalid={Boolean(errors.name)}
                                placeholder="Electronics"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={productCategory?.description ?? ''}
                                aria-invalid={Boolean(errors.description)}
                                placeholder="Brief description of this category"
                                className="min-h-24 resize-none"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="status" className="text-sm font-medium">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <input type="hidden" name="status" value={status} readOnly />
                            <RadioGroup value={status} onValueChange={setStatus} className="flex flex-row gap-6">
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
                            <InputError message={errors.status} />
                        </div>
                    </div>

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
