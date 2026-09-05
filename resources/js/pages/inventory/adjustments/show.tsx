import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import StockAdjustmentController from '@/actions/App/Http/Controllers/StockAdjustmentController';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import { TextEntry } from '@/components/text-entry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index as inventoryIndex } from '@/routes/inventory';
import { index, show } from '@/routes/stock-adjustments';
import type { BreadcrumbItem, StockAdjustment } from '@/types';

export default function AdjustmentsShow({ adjustment }: { adjustment: StockAdjustment }) {
    const { flash, errors } = usePage<{
        flash: { status?: string };
        errors: Record<string, string>;
    }>().props;

    const items = adjustment.items ?? [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Adjustments', href: index().url },
        {
            title: adjustment.adjustment_no,
            href: show(adjustment.id).url,
        },
    ];

    const handleDelete = () => {
        if (!window.confirm(`Delete ${adjustment.adjustment_no}? Its inventory movement will be reversed only if it is safe.`)) {
            return;
        }

        router.delete(StockAdjustmentController.destroy(adjustment.id).url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={adjustment.adjustment_no} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading title={adjustment.adjustment_no} />

                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={index()}>
                                    <ArrowLeft />
                                    Back
                                </Link>
                            </Button>

                            {adjustment.can_delete && (
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

                    {errors.adjustment && <AlertError errors={[errors.adjustment]} title="Stock adjustment deletion blocked." />}

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Adjustment information</SectionTitle>
                            <Separator />
                        </SectionHeader>

                        <SectionContent className="gap-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <TextEntry label="Adjustment no" value={adjustment.adjustment_no} inlineLabel weight="medium" />

                                <TextEntry
                                    label="Adjustment date"
                                    value={format(parseISO(adjustment.adjustment_date), 'MMMM d, yyyy')}
                                    inlineLabel
                                    weight="medium"
                                />

                                <TextEntry label="Outlet" value={adjustment.outlet?.name} inlineLabel weight="medium" />

                                <TextEntry
                                    label="Type"
                                    value={
                                        <Badge variant={adjustment.type === 'in' ? 'default' : 'destructive'}>
                                            {adjustment.type_label ?? adjustment.type}
                                        </Badge>
                                    }
                                    inlineLabel
                                    weight="medium"
                                />

                                <TextEntry
                                    label="Reason"
                                    value={adjustment.reason_label ?? adjustment.reason}
                                    inlineLabel
                                    weight="medium"
                                />

                                <TextEntry label="Created by" value={adjustment.createdBy?.name} inlineLabel weight="medium" />
                            </div>

                            {adjustment.note && <TextEntry label="Note" value={adjustment.note} inlineLabel weight="medium" />}
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionHeader>
                            <SectionTitle>Items</SectionTitle>
                            <Separator />
                        </SectionHeader>

                        <SectionContent>
                            <div className="ui-table">
                                <div className="ui-table-main">
                                    <div className="ui-table-content">
                                        <table className="ui-table-element">
                                            <thead>
                                                <tr>
                                                    <th className="ui-table-header-cell">Product / Variant</th>
                                                    <th className="ui-table-header-cell">SKU</th>
                                                    <th className="ui-table-header-cell text-right">Entered Qty</th>
                                                    <th className="ui-table-header-cell text-right">Base Qty</th>
                                                    <th className="ui-table-header-cell text-right">Inventory Cost</th>
                                                    <th className="ui-table-header-cell text-right">Value</th>
                                                    <th className="ui-table-header-cell">Note</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id} className="ui-table-row">
                                                        <td className="ui-table-cell font-medium">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {item.product_variant?.purchase_label ?? '-'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{item.product_variant?.sku ?? '-'}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {formatQuantity(item.quantity)}{' '}
                                                                    {item.unit_of_measurement?.code ?? item.unit_of_measurement?.name}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{formatQuantity(item.base_quantity)}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {formatCurrency(item.inventory_unit_cost)}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right font-medium tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {formatCurrency(item.inventory_total_cost)}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{item.note ?? '-'}</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                            <tfoot>
                                                <tr className="ui-table-row bg-muted/50">
                                                    <td colSpan={5} className="ui-table-cell text-right font-medium">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text py-2">Total</div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right font-semibold tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text py-2">{formatCurrency(adjustment.total_value)}</div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text py-2">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text py-2" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </SectionContent>
                    </Section>

                    {!adjustment.can_delete && (
                        <p className="text-sm text-muted-foreground">
                            This adjustment cannot be deleted because its inventory movement can no longer be safely reversed.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
