import { format as formatDate, parseISO } from 'date-fns';
import { Form, Link } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { store, update } from '@/actions/App/Http/Controllers/PurchaseController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import type { PurchaseItemPatch } from './purchase-items-table';
import PurchaseItemsTable from './purchase-items-table';
import PurchaseSummary, { type PurchaseSummaryPatch } from './purchase-summary';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Outlet, Product, Purchase, PurchaseFormData, PurchaseItem, PurchaseItemFormData, Supplier } from '../types';

type PurchaseFormPurchase = Purchase & {
    items: PurchaseItem[];
};

function createPurchaseItem(): PurchaseItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_variant_id: '',
        unit_of_measurement_id: '',
        quantity: '',
        unit_cost: '',
    };
}

function parseDateValue(value: string): Date | undefined {
    if (value === '') {
        return undefined;
    }

    const parsedDate = parseISO(value);

    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

export default function PurchaseForm({
    purchase,
    outlets,
    suppliers,
    products,
    purchaseStatusOptions,
    cancelHref,
}: {
    purchase?: PurchaseFormPurchase;
    outlets: Outlet[];
    suppliers: Supplier[];
    products: Product[];
    purchaseStatusOptions?: Option[];
    purchasePaymentStatusOptions?: Option[];
    cancelHref: string;
}) {
    const [formData, setFormData] = useState<PurchaseFormData>(() => ({
        purchase_date: purchase?.purchase_date ?? formatDate(new Date(), 'yyyy-MM-dd'),
        status: purchase?.status ?? 'draft',
        outlet_id: purchase?.outlet_id?.toString() ?? '',
        supplier_party_id: purchase?.supplier_party_id?.toString() ?? '',
        note: purchase?.note ?? '',
        discount_amount: purchase?.discount_amount ?? '0',
        transport_cost: purchase?.transport_cost ?? '0',
        labour_cost: purchase?.labour_cost ?? '0',
        other_cost: purchase?.other_cost ?? '0',
        paid_amount: purchase?.paid_amount ?? '0',
        items: purchase
            ? purchase.items.map((item) => ({
                  uid: crypto.randomUUID(),
                  product_variant_id: item.product_variant_id.toString(),
                  unit_of_measurement_id: item.unit_of_measurement_id.toString(),
                  quantity: item.quantity,
                  unit_cost: item.unit_cost,
              }))
            : [createPurchaseItem()],
    }));

    const selectedOutlet = outlets.find((outlet) => outlet.id.toString() === formData.outlet_id) ?? null;
    const selectedSupplier = suppliers.find((supplier) => supplier.id.toString() === formData.supplier_party_id) ?? null;

    const purchaseDate = parseDateValue(formData.purchase_date);

    const handlePurchaseItemAdd = () => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            items: [...currentFormData.items, createPurchaseItem()],
        }));
    };

    const handlePurchaseItemRemove = (uid: string) => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            items: currentFormData.items.filter((purchaseItem) => purchaseItem.uid !== uid),
        }));
    };

    const handlePurchaseItemChange = (uid: string, patch: PurchaseItemPatch) => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            items: currentFormData.items.map((purchaseItem) => (purchaseItem.uid === uid ? { ...purchaseItem, ...patch } : purchaseItem)),
        }));
    };

    const handlePurchaseSummaryChange = (patch: PurchaseSummaryPatch) => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            ...patch,
        }));
    };

    return (
        <Form
            action={purchase ? update(purchase.id) : store()}
            options={{ preserveScroll: true }}
            disableWhileProcessing
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <div>
                        <div className="mb-3 text-base font-medium">Purchase Information</div>
                        <div className="flex flex-col gap-7">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="purchase_date" className="text-sm font-medium">
                                        Purchase Date <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        id="purchase_date"
                                        name="purchase_date"
                                        value={purchaseDate}
                                        onChange={(date) =>
                                            setFormData((currentFormData) => ({
                                                ...currentFormData,
                                                purchase_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                            }))
                                        }
                                        aria-invalid={Boolean(errors.purchase_date)}
                                    />
                                    <InputError message={errors.purchase_date} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="outlet_id" className="text-sm font-medium">
                                        Outlet <span className="text-red-500">*</span>
                                    </label>
                                    <Combobox
                                        name="outlet_id"
                                        items={outlets}
                                        value={selectedOutlet}
                                        onValueChange={(outlet) =>
                                            setFormData((currentFormData) => ({
                                                ...currentFormData,
                                                outlet_id: outlet?.id.toString() ?? '',
                                            }))
                                        }
                                        itemToStringLabel={(outlet) => outlet.name}
                                        itemToStringValue={(outlet) => outlet.id.toString()}
                                    >
                                        <ComboboxInput
                                            id="outlet_id"
                                            placeholder="Select outlet"
                                            className="w-full"
                                            showClear
                                            aria-invalid={Boolean(errors.outlet_id)}
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No outlet found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(outlet) => (
                                                    <ComboboxItem key={outlet.id} value={outlet}>
                                                        {outlet.name}
                                                        {outlet.code ? ` (${outlet.code})` : ''}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError message={errors.outlet_id} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="supplier_party_id" className="text-sm font-medium">
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <Combobox
                                        name="supplier_party_id"
                                        items={suppliers}
                                        value={selectedSupplier}
                                        onValueChange={(supplier) =>
                                            setFormData((currentFormData) => ({
                                                ...currentFormData,
                                                supplier_party_id: supplier?.id.toString() ?? '',
                                            }))
                                        }
                                        itemToStringLabel={(supplier) => supplier.name}
                                        itemToStringValue={(supplier) => supplier.id.toString()}
                                    >
                                        <ComboboxInput
                                            id="supplier_party_id"
                                            placeholder="Select supplier"
                                            className="w-full"
                                            showClear
                                            aria-invalid={Boolean(errors.supplier_party_id)}
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No supplier found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(supplier) => (
                                                    <ComboboxItem key={supplier.id} value={supplier}>
                                                        {supplier.name}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError message={errors.supplier_party_id} />
                                </div>
                            </div>

                            <input type="hidden" name="status" value={formData.status} />

                            {purchase && purchaseStatusOptions && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) =>
                                                setFormData((currentFormData) => ({
                                                    ...currentFormData,
                                                    status: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger id="status" className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {purchaseStatusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label htmlFor="note" className="text-sm font-medium">
                                    Note
                                </label>
                                <Textarea
                                    id="note"
                                    name="note"
                                    value={formData.note}
                                    onChange={(event) =>
                                        setFormData((currentFormData) => ({
                                            ...currentFormData,
                                            note: event.target.value,
                                        }))
                                    }
                                    aria-invalid={Boolean(errors.note)}
                                    placeholder="Purchase notes..."
                                    className="min-h-20 resize-none"
                                />
                                <InputError message={errors.note} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <PurchaseItemsTable
                        items={formData.items}
                        products={products}
                        errors={errors}
                        onItemAdd={handlePurchaseItemAdd}
                        onItemRemove={handlePurchaseItemRemove}
                        onItemChange={handlePurchaseItemChange}
                    />

                    <PurchaseSummary
                        items={formData.items}
                        discountAmount={formData.discount_amount}
                        transportCost={formData.transport_cost}
                        labourCost={formData.labour_cost}
                        otherCost={formData.other_cost}
                        paidAmount={formData.paid_amount}
                        errors={errors}
                        onChange={handlePurchaseSummaryChange}
                    />

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={cancelHref}>
                                <X />
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save />
                            {processing ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
