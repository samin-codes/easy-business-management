import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import BusinessController from '@/actions/App/Http/Controllers/BusinessController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Business } from '../types';
import { Separator } from '@/components/ui/separator';

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
                    <div>
                        <div className="mb-3 text-base font-medium">Business details</div>
                        <div className="flex flex-col gap-7">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Business name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={business.name}
                                    aria-invalid={Boolean(errors.name)}
                                    placeholder="Rahman Trading Co."
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="trade_name" className="text-sm font-medium">
                                        Trade name
                                    </label>
                                    <Input
                                        id="trade_name"
                                        name="trade_name"
                                        defaultValue={business.trade_name ?? ''}
                                        aria-invalid={Boolean(errors.trade_name)}
                                        placeholder="Rahman Mart"
                                    />
                                    <InputError message={errors.trade_name} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="business_type" className="text-sm font-medium">
                                        Business type <span className="text-red-500">*</span>
                                    </label>
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
                                    <InputError message={errors.business_type} />
                                </div>
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
                    </div>

                    <Separator />

                    <div>
                        <div className="mb-3 text-base font-medium">Contact</div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="mobile" className="text-sm font-medium">
                                    Mobile <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="mobile"
                                    name="mobile"
                                    defaultValue={business.mobile}
                                    aria-invalid={Boolean(errors.mobile)}
                                    placeholder="01XXXXXXXXX"
                                />
                                <InputError message={errors.mobile} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={business.email ?? ''}
                                    aria-invalid={Boolean(errors.email)}
                                    placeholder="hello@business.com"
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="mb-3 text-base font-medium">Registration</div>

                        <div className="flex flex-col gap-7">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="trade_license_no" className="text-sm font-medium">
                                    Trade license no.
                                </label>
                                <Input
                                    id="trade_license_no"
                                    name="trade_license_no"
                                    defaultValue={business.trade_license_no ?? ''}
                                    aria-invalid={Boolean(errors.trade_license_no)}
                                />
                                <InputError message={errors.trade_license_no} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="tin_no" className="text-sm font-medium">
                                        TIN no.
                                    </label>
                                    <Input
                                        id="tin_no"
                                        name="tin_no"
                                        defaultValue={business.tin_no ?? ''}
                                        aria-invalid={Boolean(errors.tin_no)}
                                    />
                                    <InputError message={errors.tin_no} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="bin_no" className="text-sm font-medium">
                                        BIN no.
                                    </label>
                                    <Input
                                        id="bin_no"
                                        name="bin_no"
                                        defaultValue={business.bin_no ?? ''}
                                        aria-invalid={Boolean(errors.bin_no)}
                                    />
                                    <InputError message={errors.bin_no} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="mb-3 text-base font-medium">Address</div>

                        <div className="flex flex-col gap-7">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="address_line" className="text-sm font-medium">
                                    Address line
                                </label>
                                <Textarea
                                    id="address_line"
                                    name="address_line"
                                    defaultValue={business.address_line ?? ''}
                                    aria-invalid={Boolean(errors.address_line)}
                                    placeholder="House, road, market, village or landmark"
                                    className="min-h-28 resize-none"
                                />
                                <InputError message={errors.address_line} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="district" className="text-sm font-medium">
                                        District
                                    </label>
                                    <Input
                                        id="district"
                                        name="district"
                                        defaultValue={business.district ?? ''}
                                        aria-invalid={Boolean(errors.district)}
                                        placeholder="Dhaka"
                                    />
                                    <InputError message={errors.district} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="postal_code" className="text-sm font-medium">
                                        Postal code
                                    </label>
                                    <Input
                                        id="postal_code"
                                        name="postal_code"
                                        defaultValue={business.postal_code ?? ''}
                                        aria-invalid={Boolean(errors.postal_code)}
                                        placeholder="1212"
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <div className="relative flex items-center">
                                        <label htmlFor="area_type" className="text-sm font-medium">
                                            Area type
                                        </label>
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
                                    <InputError message={errors.area_type} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="area_name" className="text-sm font-medium">
                                        Area name
                                        {areaType && <span className="text-red-500"> *</span>}
                                    </label>
                                    <Input
                                        id="area_name"
                                        name="area_name"
                                        defaultValue={business.area_name ?? ''}
                                        aria-invalid={Boolean(errors.area_name)}
                                        placeholder={areaType === 'thana' ? 'Motijheel' : 'Savar'}
                                    />
                                    <InputError message={errors.area_name} />
                                </div>
                            </div>
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
                            {processing ? 'Saving...' : 'Update Business'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
