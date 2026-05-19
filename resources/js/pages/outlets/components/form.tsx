import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import OutletController from '@/actions/App/Http/Controllers/OutletController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Business, Outlet } from '../types';
import { Separator } from '@/components/ui/separator';

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
                    <div>
                        <div className="mb-3 text-base font-medium">Outlet details</div>
                        <div className="flex flex-col gap-7">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Outlet name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={outlet?.name ?? ''}
                                    aria-invalid={Boolean(errors.name)}
                                    placeholder="Banani Branch"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="code" className="text-sm font-medium">
                                        Outlet code
                                    </label>
                                    <Input
                                        id="code"
                                        name="code"
                                        defaultValue={outlet?.code ?? ''}
                                        aria-invalid={Boolean(errors.code)}
                                        placeholder="BAN-01"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="outlet_type" className="text-sm font-medium">
                                        Outlet type
                                    </label>
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
                                    <InputError message={errors.outlet_type} />
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
                                    defaultValue={outlet?.mobile ?? ''}
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
                                    defaultValue={outlet?.email ?? ''}
                                    aria-invalid={Boolean(errors.email)}
                                    placeholder="branch@example.com"
                                />
                                <InputError message={errors.email} />
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
                                    defaultValue={outlet?.address_line ?? ''}
                                    aria-invalid={Boolean(errors.address_line)}
                                    placeholder="House, road, market or landmark"
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
                                        defaultValue={outlet?.district ?? ''}
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
                                        defaultValue={outlet?.postal_code ?? ''}
                                        aria-invalid={Boolean(errors.postal_code)}
                                        placeholder="1213"
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
                                        defaultValue={outlet?.area_name ?? ''}
                                        aria-invalid={Boolean(errors.area_name)}
                                        placeholder={areaType === 'thana' ? 'Gulshan' : 'Keraniganj'}
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
                            {processing ? 'Saving...' : outlet ? 'Update Outlet' : 'Create Outlet'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
