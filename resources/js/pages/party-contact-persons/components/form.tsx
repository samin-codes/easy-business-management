import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import PartyContactPersonController from '@/actions/App/Http/Controllers/PartyContactPersonController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { Option, Party, PartyContactPerson } from '@/types';

export default function PartyContactPersonForm({
    party,
    partyContactPerson,
    statusOptions,
    cancelHref,
}: {
    party: Party;
    partyContactPerson?: PartyContactPerson;
    statusOptions: Option[];
    cancelHref: string;
}) {
    const [status, setStatus] = useState(partyContactPerson?.status ?? 'active');
    const [isPrimary, setIsPrimary] = useState(partyContactPerson?.is_primary ?? false);

    return (
        <Form
            action={
                partyContactPerson
                    ? PartyContactPersonController.update({
                          party,
                          party_contact_person: partyContactPerson.id,
                      })
                    : PartyContactPersonController.store({ party })
            }
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <div className="flex flex-col gap-7">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={partyContactPerson?.name ?? ''}
                                aria-invalid={Boolean(errors.name)}
                                placeholder="John Doe"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="designation" className="text-sm font-medium">
                                Designation
                            </label>
                            <Input
                                id="designation"
                                name="designation"
                                defaultValue={partyContactPerson?.designation ?? ''}
                                aria-invalid={Boolean(errors.designation)}
                                placeholder="Sales Manager"
                            />
                            <InputError message={errors.designation} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="mobile" className="text-sm font-medium">
                                    Mobile
                                </label>
                                <Input
                                    id="mobile"
                                    name="mobile"
                                    defaultValue={partyContactPerson?.mobile ?? ''}
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
                                    defaultValue={partyContactPerson?.email ?? ''}
                                    aria-invalid={Boolean(errors.email)}
                                    placeholder="john@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="hidden" name="is_primary" value={isPrimary ? '1' : '0'} readOnly />
                            <Checkbox
                                id="is_primary"
                                checked={isPrimary}
                                onCheckedChange={(checked) => setIsPrimary(checked === true)}
                                aria-invalid={Boolean(errors.is_primary)}
                            />
                            <label htmlFor="is_primary" className="text-sm font-medium">
                                Primary contact person
                            </label>
                            <InputError message={errors.is_primary} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="note" className="text-sm font-medium">
                                Note
                            </label>
                            <Textarea
                                id="note"
                                name="note"
                                defaultValue={partyContactPerson?.note ?? ''}
                                aria-invalid={Boolean(errors.note)}
                                placeholder="Internal note about this contact person"
                                className="min-h-24 resize-none"
                            />
                            <InputError message={errors.note} />
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
                            {processing ? 'Saving...' : partyContactPerson ? 'Update Contact Person' : 'Create Contact Person'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
