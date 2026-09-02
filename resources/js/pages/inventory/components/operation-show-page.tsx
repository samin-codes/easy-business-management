import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import InventoryNavigation from './inventory-navigation';

export type OperationShowRecord = {
    id: number;
    number: string;
    date: string;
    note?: string | null;
    type?: 'in' | 'out';
    type_label?: string;
    reason_label?: string;
    outlet?: { name: string } | null;
    source_outlet?: { name: string } | null;
    destination_outlet?: { name: string } | null;
    created_by?: { name: string } | null;
    total_value: string;
    can_delete?: boolean;
    items: Array<{
        id: number;
        product_label: string;
        sku?: string | null;
        quantity: string;
        unit?: { name: string; code?: string } | null;
        base_quantity: string;
        unit_cost: string;
        total_cost: string;
        note?: string | null;
    }>;
};

export default function OperationShowPage({
    kind,
    record,
    indexHref,
    destroyHref,
}: {
    kind: 'opening' | 'adjustments' | 'transfers';
    record: OperationShowRecord;
    indexHref: string;
    destroyHref: string;
}) {
    const { flash } = usePage<{ flash: { status?: string } }>().props;
    const title = kind === 'opening' ? 'Opening Stock' : kind === 'adjustments' ? 'Stock Adjustment' : 'Stock Transfer';
    const active = kind === 'opening' ? 'opening' : kind;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: indexHref },
        { title, href: indexHref },
        { title: record.number, href: '#' },
    ];
    const remove = () => {
        if (window.confirm(`Delete ${record.number}? Its inventory movement will be reversed only if it is safe.`))
            router.delete(destroyHref, {
                onError: (errors) =>
                    window.alert(
                        errors.opening_stock ?? errors.adjustment ?? errors.transfer ?? 'This operation cannot be deleted safely.',
                    ),
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record.number} />
            <div className="px-4 py-6">
                <div className="mx-auto max-w-6xl space-y-8">
                    <InventoryNavigation active={active} />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading title={record.number} description={title} />
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={indexHref}>
                                    <ArrowLeft />
                                    Back
                                </Link>
                            </Button>
                            {record.can_delete && (
                                <Button variant="destructive" onClick={remove}>
                                    <Trash2 />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}
                    <Section>
                        <SectionHeader>
                            <SectionTitle>{title} Information</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent className="gap-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <TextEntry label="Document Number" value={record.number} />
                                <TextEntry label="Date" value={format(parseISO(record.date), 'MMMM d, yyyy')} />
                                {kind === 'transfers' ? (
                                    <>
                                        <TextEntry label="From Outlet" value={record.source_outlet?.name} />
                                        <TextEntry label="To Outlet" value={record.destination_outlet?.name} />
                                    </>
                                ) : (
                                    <TextEntry label="Outlet" value={record.outlet?.name} />
                                )}
                                {kind === 'adjustments' && (
                                    <>
                                        <TextEntry
                                            label="Type"
                                            value={
                                                <Badge variant={record.type === 'in' ? 'default' : 'destructive'}>
                                                    {record.type_label}
                                                </Badge>
                                            }
                                        />
                                        <TextEntry label="Reason" value={record.reason_label} />
                                    </>
                                )}
                                <TextEntry label="Created By" value={record.created_by?.name} />
                                <TextEntry label="Note" value={record.note} />
                            </div>
                        </SectionContent>
                    </Section>
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Items</SectionTitle>
                            <Separator />
                        </SectionHeader>
                        <SectionContent>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="table-hover table">
                                    <thead>
                                        <tr>
                                            <th>Product / Variant</th>
                                            <th>SKU</th>
                                            <th className="text-right">Entered Qty</th>
                                            <th className="text-right">Base Qty</th>
                                            <th className="text-right">Inventory Cost</th>
                                            <th className="text-right">Value</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {record.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="font-medium">{item.product_label}</td>
                                                <td>{item.sku ?? '-'}</td>
                                                <td className="text-right tabular-nums">
                                                    {formatQuantity(item.quantity)} {item.unit?.code ?? item.unit?.name}
                                                </td>
                                                <td className="text-right tabular-nums">{formatQuantity(item.base_quantity)}</td>
                                                <td className="text-right tabular-nums">{formatCurrency(item.unit_cost)}</td>
                                                <td className="text-right font-medium tabular-nums">{formatCurrency(item.total_cost)}</td>
                                                <td>{item.note ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="table-light border-t">
                                            <td colSpan={5} className="text-right font-medium">
                                                Total
                                            </td>
                                            <td className="text-right font-semibold tabular-nums">{formatCurrency(record.total_value)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </SectionContent>
                    </Section>
                    {!record.can_delete && (
                        <p className="text-sm text-muted-foreground">
                            This posted operation cannot be deleted because later inventory movements may depend on it. Use a compensating
                            operation instead.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
