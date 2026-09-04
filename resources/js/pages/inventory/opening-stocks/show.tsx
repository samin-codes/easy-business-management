import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import OpeningStockController from '@/actions/App/Http/Controllers/OpeningStockController';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import { Button } from '@/components/ui/button';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index as inventoryIndex } from '@/routes/inventory';
import { index, show } from '@/routes/opening-stocks';
import type { BreadcrumbItem, OpeningStock } from '@/types';

export default function OpeningStocksShow({ openingStock }: { openingStock: OpeningStock }) {
    const { flash, errors } = usePage<{
        flash: { status?: string };
        errors: Record<string, string>;
    }>().props;

    const items = openingStock.items ?? [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Opening Stock', href: index().url },
        {
            title: openingStock.opening_stock_no,
            href: show(openingStock.id).url,
        },
    ];

    const handleDelete = () => {
        if (!window.confirm(`Delete ${openingStock.opening_stock_no}? Its inventory movement will be reversed only if it is safe.`)) {
            return;
        }

        router.delete(OpeningStockController.destroy(openingStock.id).url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={openingStock.opening_stock_no} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-6xl space-y-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading title={openingStock.opening_stock_no} />

                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={index()}>
                                    <ArrowLeft />
                                    Back
                                </Link>
                            </Button>

                            {openingStock.can_delete && (
                                <Button variant="destructive" onClick={handleDelete}>
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

                    {errors.opening_stock && <AlertError errors={[errors.opening_stock]} title="Opening stock deletion blocked." />}

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Opening stock information</SectionTitle>
                            <Separator />
                        </SectionHeader>

                        <SectionContent className="gap-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <TextEntry
                                    label="Opening stock no"
                                    value={openingStock.opening_stock_no}
                                    inlineLabel
                                    weight="medium"
                                />

                                <TextEntry
                                    label="Opening date"
                                    value={format(parseISO(openingStock.opening_date), 'MMMM d, yyyy')}
                                    inlineLabel
                                    weight="medium"
                                />

                                <TextEntry label="Outlet" value={openingStock.outlet?.name} inlineLabel weight="medium" />

                                <TextEntry label="Created by" value={openingStock.createdBy?.name} inlineLabel weight="medium" />
                            </div>

                            {openingStock.note && <TextEntry label="Note" value={openingStock.note} inlineLabel weight="medium" />}
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
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="font-medium">{item.product_variant?.purchase_label ?? '-'}</td>

                                                <td>{item.product_variant?.sku ?? '-'}</td>

                                                <td className="text-right tabular-nums">
                                                    {formatQuantity(item.quantity)}{' '}
                                                    {item.unit_of_measurement?.code ?? item.unit_of_measurement?.name}
                                                </td>

                                                <td className="text-right tabular-nums">{formatQuantity(item.base_quantity)}</td>

                                                <td className="text-right tabular-nums">{formatCurrency(item.base_unit_cost)}</td>

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

                                            <td className="text-right font-semibold tabular-nums">
                                                {formatCurrency(openingStock.total_value)}
                                            </td>

                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </SectionContent>
                    </Section>

                    {!openingStock.can_delete && (
                        <p className="text-sm text-muted-foreground">
                            This opening stock cannot be deleted because later inventory movements may depend on it. Use a compensating
                            operation instead.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
