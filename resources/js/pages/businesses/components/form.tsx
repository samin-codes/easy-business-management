import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import BusinessController from '@/actions/App/Http/Controllers/BusinessController';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Business } from '../types';

export default function BusinessForm({
    business,
    businessTypeOptions,
    statusOptions,
    areaTypeOptions,
    cancelHref,
}: {
    business: Business;
    businessTypeOptions: Option[];
    statusOptions: Option[];
    areaTypeOptions: Option[];
    cancelHref: string;
}) {
    const [businessType, setBusinessType] = useState(business.business_type);
    const [status, setStatus] = useState(business.status);
    const [areaType, setAreaType] = useState(business.area_type ?? '');

    return (
        <Form action={BusinessController.update()} options={{ preserveScroll: true }} disableWhileProcessing className="space-y-6">
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Business details</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <Field>
                                <FieldLabel htmlFor="name">
                                    Business name <span className="-ml-1 text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={business.name}
                                    aria-invalid={Boolean(errors.name)}
                                    placeholder="Rahman Trading Co."
                                />
                                <FieldError errors={[{ message: errors.name }]} />
                            </Field>

                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="trade_name">Trade name</FieldLabel>
                                    <Input
                                        id="trade_name"
                                        name="trade_name"
                                        defaultValue={business.trade_name ?? ''}
                                        aria-invalid={Boolean(errors.trade_name)}
                                        placeholder="Rahman Mart"
                                    />
                                    <FieldError errors={[{ message: errors.trade_name }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="business_type">
                                        Business type <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <input type="hidden" name="business_type" value={businessType} readOnly />
                                    <Select value={businessType} onValueChange={setBusinessType}>
                                        <SelectTrigger id="business_type" className="w-full" aria-invalid={Boolean(errors.business_type)}>
                                            <SelectValue placeholder="Select business type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {businessTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[{ message: errors.business_type }]} />
                                </Field>
                            </FieldGroup>

                            <Field>
                                <FieldLabel htmlFor="status">
                                    Status <span className="-ml-1 text-red-500">*</span>
                                </FieldLabel>
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
                                <FieldError errors={[{ message: errors.status }]} />
                            </Field>
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Contact</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="mobile">
                                        Mobile <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="mobile"
                                        name="mobile"
                                        defaultValue={business.mobile}
                                        aria-invalid={Boolean(errors.mobile)}
                                        placeholder="01XXXXXXXXX"
                                    />
                                    <FieldError errors={[{ message: errors.mobile }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={business.email ?? ''}
                                        aria-invalid={Boolean(errors.email)}
                                        placeholder="hello@business.com"
                                    />
                                    <FieldError errors={[{ message: errors.email }]} />
                                </Field>
                            </FieldGroup>
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Registration</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <Field>
                                <FieldLabel htmlFor="trade_license_no">Trade license no.</FieldLabel>
                                <Input
                                    id="trade_license_no"
                                    name="trade_license_no"
                                    defaultValue={business.trade_license_no ?? ''}
                                    aria-invalid={Boolean(errors.trade_license_no)}
                                />
                                <FieldError errors={[{ message: errors.trade_license_no }]} />
                            </Field>

                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="tin_no">TIN no.</FieldLabel>
                                    <Input
                                        id="tin_no"
                                        name="tin_no"
                                        defaultValue={business.tin_no ?? ''}
                                        aria-invalid={Boolean(errors.tin_no)}
                                    />
                                    <FieldError errors={[{ message: errors.tin_no }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="bin_no">BIN no.</FieldLabel>
                                    <Input
                                        id="bin_no"
                                        name="bin_no"
                                        defaultValue={business.bin_no ?? ''}
                                        aria-invalid={Boolean(errors.bin_no)}
                                    />
                                    <FieldError errors={[{ message: errors.bin_no }]} />
                                </Field>
                            </FieldGroup>
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Address</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <Field>
                                <FieldLabel htmlFor="address_line">Address line</FieldLabel>
                                <Textarea
                                    id="address_line"
                                    name="address_line"
                                    defaultValue={business.address_line ?? ''}
                                    aria-invalid={Boolean(errors.address_line)}
                                    placeholder="House, road, market, village or landmark"
                                    className="min-h-28 resize-none"
                                />
                                <FieldError errors={[{ message: errors.address_line }]} />
                            </Field>

                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="district">District</FieldLabel>
                                    <Input
                                        id="district"
                                        name="district"
                                        defaultValue={business.district ?? ''}
                                        aria-invalid={Boolean(errors.district)}
                                        placeholder="Dhaka"
                                    />
                                    <FieldError errors={[{ message: errors.district }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="postal_code">Postal code</FieldLabel>
                                    <Input
                                        id="postal_code"
                                        name="postal_code"
                                        defaultValue={business.postal_code ?? ''}
                                        aria-invalid={Boolean(errors.postal_code)}
                                        placeholder="1212"
                                    />
                                    <FieldError errors={[{ message: errors.postal_code }]} />
                                </Field>
                            </FieldGroup>

                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <div className="relative flex items-center">
                                        <FieldLabel htmlFor="area_type">Area type</FieldLabel>
                                        {areaType && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setAreaType('')}
                                                className="absolute right-0 h-auto px-2 py-1 text-xs"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                    <input type="hidden" name="area_type" value={areaType} readOnly />
                                    <RadioGroup value={areaType} onValueChange={setAreaType} className="flex flex-row gap-6">
                                        {areaTypeOptions.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`area_type_${option.value}`}
                                                    aria-invalid={Boolean(errors.area_type)}
                                                />
                                                <label htmlFor={`area_type_${option.value}`} className="text-sm font-medium">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <FieldError errors={[{ message: errors.area_type }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="area_name">
                                        Area name
                                        {areaType && <span className="-ml-1 text-red-500"> *</span>}
                                    </FieldLabel>
                                    <Input
                                        id="area_name"
                                        name="area_name"
                                        defaultValue={business.area_name ?? ''}
                                        aria-invalid={Boolean(errors.area_name)}
                                        placeholder={areaType === 'thana' ? 'Motijheel' : 'Savar'}
                                    />
                                    <FieldError errors={[{ message: errors.area_name }]} />
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
                            {processing ? 'Saving...' : 'Update Business'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
