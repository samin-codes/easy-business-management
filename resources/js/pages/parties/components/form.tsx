import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import PartyController from '@/actions/App/Http/Controllers/PartyController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Option, Party } from '@/types';
import { Separator } from '@/components/ui/separator';

export default function PartyForm({
    party,
    partyTypeOptions,
    openingBalanceTypeOptions,
    areaTypeOptions,
    statusOptions,
    cancelHref,
}: {
    party?: Party;
    partyTypeOptions: Option[];
    openingBalanceTypeOptions: Option[];
    areaTypeOptions: Option[];
    statusOptions: Option[];
    cancelHref: string;
}) {
    const [partyType, setPartyType] = useState(party?.party_type ?? 'customer');
    const [openingBalanceType, setOpeningBalanceType] = useState(party?.opening_balance_type ?? 'none');
    const [status, setStatus] = useState(party?.status ?? 'active');
    const [areaType, setAreaType] = useState(party?.area_type ?? '');

    const showOpeningBalance = openingBalanceType !== 'none';
    const showCreditLimit = partyType === 'customer' || partyType === 'both';

    return (
        <Form
            action={party ? PartyController.update(party.id) : PartyController.store()}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <div>
                        <div className="mb-3 text-base font-medium">Party details</div>
                        <div className="flex flex-col gap-7">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="text-sm font-medium">
                                        Party name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={party?.name ?? ''}
                                        aria-invalid={Boolean(errors.name)}
                                        placeholder="Rahman & Sons"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="trade_name" className="text-sm font-medium">
                                        Trade name
                                    </label>
                                    <Input
                                        id="trade_name"
                                        name="trade_name"
                                        defaultValue={party?.trade_name ?? ''}
                                        aria-invalid={Boolean(errors.trade_name)}
                                        placeholder="Rahman Traders"
                                    />
                                    <InputError message={errors.trade_name} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="party_type" className="text-sm font-medium">
                                        Party type <span className="text-red-500">*</span>
                                    </label>
                                    <input type="hidden" name="party_type" value={partyType} readOnly />
                                    <Select value={partyType} onValueChange={setPartyType}>
                                        <SelectTrigger id="party_type" className="w-full" aria-invalid={Boolean(errors.party_type)}>
                                            <SelectValue placeholder="Select party type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partyTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.party_type} />
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
                    </div>

                    <Separator />

                    <div>
                        <div className="mb-3 text-base font-medium">Contact</div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="mobile" className="text-sm font-medium">
                                    Mobile
                                </label>
                                <Input
                                    id="mobile"
                                    name="mobile"
                                    defaultValue={party?.mobile ?? ''}
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
                                    defaultValue={party?.email ?? ''}
                                    aria-invalid={Boolean(errors.email)}
                                    placeholder="hello@party.com"
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="mb-3 text-base font-medium">Financials</div>

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="opening_balance_type" className="text-sm font-medium">
                                    Opening balance type <span className="text-red-500">*</span>
                                </label>
                                <input type="hidden" name="opening_balance_type" value={openingBalanceType} readOnly />
                                <RadioGroup
                                    value={openingBalanceType}
                                    onValueChange={setOpeningBalanceType}
                                    className="flex flex-col gap-2"
                                >
                                    {openingBalanceTypeOptions.map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={option.value}
                                                id={`opening_balance_type_${option.value}`}
                                                aria-invalid={Boolean(errors.opening_balance_type)}
                                            />
                                            <label htmlFor={`opening_balance_type_${option.value}`} className="text-sm font-medium">
                                                {option.label}
                                            </label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <InputError message={errors.opening_balance_type} />
                            </div>

                            <div className="flex flex-wrap items-start gap-4">
                                {showOpeningBalance && (
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="opening_balance" className="text-sm font-medium">
                                            Opening balance <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="opening_balance"
                                            name="opening_balance"
                                            type="number"
                                            step="0.01"
                                            className="no-number-spinner w-40"
                                            defaultValue={party?.opening_balance ?? ''}
                                            aria-invalid={Boolean(errors.opening_balance)}
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.opening_balance} />
                                    </div>
                                )}

                                {showCreditLimit && (
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="credit_limit" className="text-sm font-medium">
                                            Credit limit
                                        </label>
                                        <Input
                                            id="credit_limit"
                                            name="credit_limit"
                                            type="number"
                                            step="0.01"
                                            className="no-number-spinner w-40"
                                            defaultValue={party?.credit_limit ?? ''}
                                            aria-invalid={Boolean(errors.credit_limit)}
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.credit_limit} />
                                    </div>
                                )}
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
                                    defaultValue={party?.address_line ?? ''}
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
                                        defaultValue={party?.district ?? ''}
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
                                        defaultValue={party?.postal_code ?? ''}
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
                                        defaultValue={party?.area_name ?? ''}
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
                            {processing ? 'Saving...' : party ? 'Update Party' : 'Create Party'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
