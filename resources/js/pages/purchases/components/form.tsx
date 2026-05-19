import { Link, useForm } from '@inertiajs/react';
import { format as formatDate, parseISO } from 'date-fns';
import { Save, X } from 'lucide-react';
import { store, update } from '@/actions/App/Http/Controllers/PurchaseController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';
import type { Outlet, Product, Purchase, PurchaseFormData, PurchaseItem, PurchaseItemFormData, Supplier } from '../types';
import type { PurchaseItemPatch } from './purchase-items-table';
import PurchaseItemsTable from './purchase-items-table';
import type { PurchaseSummaryPatch } from './purchase-summary';
import PurchaseSummary from './purchase-summary';

function createPurchaseItemFormData(item?: PurchaseItem): PurchaseItemFormData {
    return {
        uid: crypto.randomUUID(),
        product_variant_id: item?.product_variant_id.toString() ?? '',
        unit_of_measurement_id: item?.unit_of_measurement_id.toString() ?? '',
        quantity: item?.quantity ?? '',
        unit_cost: item?.unit_cost ?? '',
    };
}

function createPurchaseFormData(purchase?: Purchase): PurchaseFormData {
    return {
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
        items: purchase ? purchase.items.map((item) => createPurchaseItemFormData(item)) : [createPurchaseItemFormData()],
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
    purchase?: Purchase;
    outlets: Outlet[];
    suppliers: Supplier[];
    products: Product[];
    purchaseStatusOptions?: Option[];
    purchasePaymentStatusOptions?: Option[];
    cancelHref: string;
}) {
    const form = useForm<PurchaseFormData>(() => createPurchaseFormData(purchase));

    const selectedOutlet = outlets.find((outlet) => outlet.id.toString() === form.data.outlet_id) ?? null;
    const selectedSupplier = suppliers.find((supplier) => supplier.id.toString() === form.data.supplier_party_id) ?? null;

    const purchaseDate = parseDateValue(form.data.purchase_date);

    function submit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            items: data.items.map(({ uid, ...item }) => {
                void uid;

                return item;
            }),
        }));

        form.submit(purchase ? update(purchase.id) : store(), {
            preserveScroll: true,
        });
    }

    const handlePurchaseItemAdd = () => {
        form.setData((data) => ({
            ...data,
            items: [...data.items, createPurchaseItemFormData()],
        }));
    };

    const handlePurchaseItemRemove = (uid: string) => {
        form.setData((data) => ({
            ...data,
            items: data.items.filter((purchaseItem) => purchaseItem.uid !== uid),
        }));
    };

    const handlePurchaseItemChange = (uid: string, patch: PurchaseItemPatch) => {
        form.setData((data) => ({
            ...data,
            items: data.items.map((purchaseItem) => (purchaseItem.uid === uid ? { ...purchaseItem, ...patch } : purchaseItem)),
        }));
    };

    const handlePurchaseSummaryChange = (patch: PurchaseSummaryPatch) => {
        form.setData((data) => ({
            ...data,
            ...patch,
        }));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
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
                                    value={purchaseDate}
                                    onChange={(date) =>
                                        form.setData((data) => ({
                                            ...data,
                                            purchase_date: date ? formatDate(date, 'yyyy-MM-dd') : '',
                                        }))
                                    }
                                    aria-invalid={Boolean(form.errors.purchase_date)}
                                />
                                <InputError message={form.errors.purchase_date} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="outlet_id" className="text-sm font-medium">
                                    Outlet <span className="text-red-500">*</span>
                                </label>
                                <Combobox
                                    items={outlets}
                                    value={selectedOutlet}
                                    onValueChange={(outlet) =>
                                        form.setData((data) => ({
                                            ...data,
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
                                        aria-invalid={Boolean(form.errors.outlet_id)}
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
                                <InputError message={form.errors.outlet_id} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="supplier_party_id" className="text-sm font-medium">
                                    Supplier <span className="text-red-500">*</span>
                                </label>
                                <Combobox
                                    items={suppliers}
                                    value={selectedSupplier}
                                    onValueChange={(supplier) =>
                                        form.setData((data) => ({
                                            ...data,
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
                                        aria-invalid={Boolean(form.errors.supplier_party_id)}
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
                                <InputError message={form.errors.supplier_party_id} />
                            </div>
                        </div>

                        {purchase && purchaseStatusOptions && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={form.data.status}
                                        onValueChange={(value) =>
                                            form.setData((data) => ({
                                                ...data,
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
                                    <InputError message={form.errors.status} />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="note" className="text-sm font-medium">
                                Note
                            </label>
                            <Textarea
                                id="note"
                                value={form.data.note}
                                onChange={(event) => form.setData('note', event.target.value)}
                                aria-invalid={Boolean(form.errors.note)}
                                placeholder="Purchase notes..."
                                className="min-h-20 resize-none"
                            />
                            <InputError message={form.errors.note} />
                        </div>
                    </div>
                </div>

                <Separator />

                <PurchaseItemsTable
                    items={form.data.items}
                    products={products}
                    errors={form.errors}
                    onItemAdd={handlePurchaseItemAdd}
                    onItemRemove={handlePurchaseItemRemove}
                    onItemChange={handlePurchaseItemChange}
                />

                <PurchaseSummary
                    items={form.data.items}
                    discountAmount={form.data.discount_amount}
                    transportCost={form.data.transport_cost}
                    labourCost={form.data.labour_cost}
                    otherCost={form.data.other_cost}
                    paidAmount={form.data.paid_amount}
                    errors={form.errors}
                    onChange={handlePurchaseSummaryChange}
                />

                <div className="mt-8 flex justify-end gap-3">
                    <Button type="button" variant="outline" asChild>
                        <Link href={cancelHref}>
                            <X />
                            Cancel
                        </Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save />
                        {form.processing ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
