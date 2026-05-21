import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import PartyContactPersonController from '@/actions/App/Http/Controllers/PartyContactPersonController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">
                                Name <span className="-ml-1 text-red-500">*</span>
                            </FieldLabel>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={partyContactPerson?.name ?? ''}
                                aria-invalid={Boolean(errors.name)}
                                placeholder="John Doe"
                            />
                            <FieldError errors={[{ message: errors.name }]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="designation">Designation</FieldLabel>
                            <Input
                                id="designation"
                                name="designation"
                                defaultValue={partyContactPerson?.designation ?? ''}
                                aria-invalid={Boolean(errors.designation)}
                                placeholder="Sales Manager"
                            />
                            <FieldError errors={[{ message: errors.designation }]} />
                        </Field>

                        <FieldGroup className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                                <Input
                                    id="mobile"
                                    name="mobile"
                                    defaultValue={partyContactPerson?.mobile ?? ''}
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
                                    defaultValue={partyContactPerson?.email ?? ''}
                                    aria-invalid={Boolean(errors.email)}
                                    placeholder="john@example.com"
                                />
                                <FieldError errors={[{ message: errors.email }]} />
                            </Field>
                        </FieldGroup>

                        <Field orientation="horizontal">
                            <input type="hidden" name="is_primary" value={isPrimary ? '1' : '0'} readOnly />
                            <Checkbox
                                id="is_primary"
                                checked={isPrimary}
                                onCheckedChange={(checked) => setIsPrimary(checked === true)}
                                aria-invalid={Boolean(errors.is_primary)}
                            />
                            <FieldLabel htmlFor="is_primary">Primary contact person</FieldLabel>
                            <FieldError errors={[{ message: errors.is_primary }]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="note">Note</FieldLabel>
                            <Textarea
                                id="note"
                                name="note"
                                defaultValue={partyContactPerson?.note ?? ''}
                                aria-invalid={Boolean(errors.note)}
                                placeholder="Internal note about this contact person"
                                className="min-h-24 resize-none"
                            />
                            <FieldError errors={[{ message: errors.note }]} />
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
