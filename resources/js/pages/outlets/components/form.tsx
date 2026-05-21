import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import OutletController from '@/actions/App/Http/Controllers/OutletController';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Business, Outlet } from '../types';

export default function OutletForm({
    business,
    outlet,
    outletTypeOptions,
    statusOptions,
    areaTypeOptions,
    cancelHref,
}: {
    business: Business;
    outlet?: Outlet;
    outletTypeOptions: Option[];
    statusOptions: Option[];
    areaTypeOptions: Option[];
    cancelHref: string;
}) {
    const [outletType, setOutletType] = useState(outlet?.outlet_type ?? '');
    const [status, setStatus] = useState(outlet?.status ?? 'active');
    const [areaType, setAreaType] = useState(outlet?.area_type ?? '');

    return (
        <Form
            action={outlet ? OutletController.update({ business, outlet }) : OutletController.store({ business })}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Outlet details</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <Field>
                                <FieldLabel htmlFor="name">
                                    Outlet name <span className="-ml-1 text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={outlet?.name ?? ''}
                                    aria-invalid={Boolean(errors.name)}
                                    placeholder="Banani Branch"
                                />
                                <FieldError errors={[{ message: errors.name }]} />
                            </Field>

                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="code">Outlet code</FieldLabel>
                                    <Input
                                        id="code"
                                        name="code"
                                        defaultValue={outlet?.code ?? ''}
                                        aria-invalid={Boolean(errors.code)}
                                        placeholder="BAN-01"
                                    />
                                    <FieldError errors={[{ message: errors.code }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="outlet_type">Outlet type</FieldLabel>
                                    <input type="hidden" name="outlet_type" value={outletType} readOnly />
                                    <Select value={outletType} onValueChange={setOutletType}>
                                        <SelectTrigger id="outlet_type" className="w-full" aria-invalid={Boolean(errors.outlet_type)}>
                                            <SelectValue placeholder="Select outlet type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {outletTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[{ message: errors.outlet_type }]} />
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
                                        defaultValue={outlet?.mobile ?? ''}
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
                                        defaultValue={outlet?.email ?? ''}
                                        aria-invalid={Boolean(errors.email)}
                                        placeholder="branch@example.com"
                                    />
                                    <FieldError errors={[{ message: errors.email }]} />
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
                                    defaultValue={outlet?.address_line ?? ''}
                                    aria-invalid={Boolean(errors.address_line)}
                                    placeholder="House, road, market or landmark"
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
                                        defaultValue={outlet?.district ?? ''}
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
                                        defaultValue={outlet?.postal_code ?? ''}
                                        aria-invalid={Boolean(errors.postal_code)}
                                        placeholder="1213"
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
                                        defaultValue={outlet?.area_name ?? ''}
                                        aria-invalid={Boolean(errors.area_name)}
                                        placeholder={areaType === 'thana' ? 'Gulshan' : 'Keraniganj'}
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
                            {processing ? 'Saving...' : outlet ? 'Update Outlet' : 'Create Outlet'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
