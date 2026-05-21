import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import PartyController from '@/actions/App/Http/Controllers/PartyController';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatDecimal } from '@/lib/utils';
import type { Option, Party } from '@/types';

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
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Party details</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Party name <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={party?.name ?? ''}
                                        aria-invalid={Boolean(errors.name)}
                                        placeholder="Rahman & Sons"
                                    />
                                    <FieldError errors={[{ message: errors.name }]} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="trade_name">Trade name</FieldLabel>
                                    <Input
                                        id="trade_name"
                                        name="trade_name"
                                        defaultValue={party?.trade_name ?? ''}
                                        aria-invalid={Boolean(errors.trade_name)}
                                        placeholder="Rahman Traders"
                                    />
                                    <FieldError errors={[{ message: errors.trade_name }]} />
                                </Field>
                            </FieldGroup>

                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="party_type">
                                        Party type <span className="-ml-1 text-red-500">*</span>
                                    </FieldLabel>
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
                                    <FieldError errors={[{ message: errors.party_type }]} />
                                </Field>

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
                            </FieldGroup>
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
                                    <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                                    <Input
                                        id="mobile"
                                        name="mobile"
                                        defaultValue={party?.mobile ?? ''}
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
                                        defaultValue={party?.email ?? ''}
                                        aria-invalid={Boolean(errors.email)}
                                        placeholder="hello@party.com"
                                    />
                                    <FieldError errors={[{ message: errors.email }]} />
                                </Field>
                            </FieldGroup>
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Financials</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <Field>
                                <FieldLabel htmlFor="opening_balance_type">
                                    Opening balance type <span className="-ml-1 text-red-500">*</span>
                                </FieldLabel>
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
                                <FieldError errors={[{ message: errors.opening_balance_type }]} />
                            </Field>

                            <div className="flex flex-wrap items-start gap-4">
                                {showOpeningBalance && (
                                    <Field className="w-auto">
                                        <FieldLabel htmlFor="opening_balance">
                                            Opening balance <span className="-ml-1 text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="opening_balance"
                                            name="opening_balance"
                                            type="number"
                                            step="0.01"
                                            className="no-number-spinner w-40"
                                            defaultValue={party?.opening_balance ?? ''}
                                            onBlur={(event) => {
                                                event.currentTarget.value = formatDecimal(event.currentTarget.value);
                                            }}
                                            aria-invalid={Boolean(errors.opening_balance)}
                                            placeholder="0.00"
                                        />
                                        <FieldError errors={[{ message: errors.opening_balance }]} />
                                    </Field>
                                )}

                                {showCreditLimit && (
                                    <Field className="w-auto">
                                        <FieldLabel htmlFor="credit_limit">Credit limit</FieldLabel>
                                        <Input
                                            id="credit_limit"
                                            name="credit_limit"
                                            type="number"
                                            step="0.01"
                                            className="no-number-spinner w-40"
                                            defaultValue={party?.credit_limit ?? ''}
                                            onBlur={(event) => {
                                                event.currentTarget.value = formatDecimal(event.currentTarget.value);
                                            }}
                                            aria-invalid={Boolean(errors.credit_limit)}
                                            placeholder="0.00"
                                        />
                                        <FieldError errors={[{ message: errors.credit_limit }]} />
                                    </Field>
                                )}
                            </div>
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
                                    defaultValue={party?.address_line ?? ''}
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
                                        defaultValue={party?.district ?? ''}
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
                                        defaultValue={party?.postal_code ?? ''}
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
                                        defaultValue={party?.area_name ?? ''}
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
                            {processing ? 'Saving...' : party ? 'Update Party' : 'Create Party'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
