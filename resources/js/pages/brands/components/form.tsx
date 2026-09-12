import { Form, Link, usePage } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { store, update } from '@/actions/App/Http/Controllers/BrandController';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Section, SectionContent } from '@/components/ui/section';
import { index } from '@/routes/brands';
import type { Brand, Option } from '@/types';

export default function BrandForm({ brand, statusOptions }: { brand?: Brand; statusOptions: Option[] }) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const queryString = {
        page: params.get('page'),
        search: params.get('search'),
        sort: params.get('sort'),
        direction: params.get('direction'),
    };

    return (
        <Form
            action={brand ? update(brand.id, { query: queryString }) : store({ query: queryString })}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <>
                    <Section>
                        <SectionContent>
                            <FieldGroup className="grid gap-6 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Brand name <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={brand?.name ?? ''}
                                        maxLength={255}
                                        aria-invalid={Boolean(errors.name)}
                                        placeholder="Enter brand name"
                                    />
                                    <FieldError errors={[{ message: errors.name }]} />
                                </Field>
                                <Field>
                                    <FieldLabel>
                                        Status <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <RadioGroup
                                        name="status"
                                        defaultValue={brand?.status ?? 'active'}
                                        aria-label="Status"
                                        className="flex flex-row gap-6"
                                    >
                                        {statusOptions.map((option) => (
                                            <div key={option.value} className="flex items-center gap-2">
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
                            <Link href={index({ query: queryString })}>
                                <X />
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save />
                            {processing ? 'Saving...' : brand ? 'Update Brand' : 'Create Brand'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
