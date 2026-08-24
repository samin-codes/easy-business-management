import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { CalendarClock, CircleDollarSign, PackageOpen, ReceiptText } from 'lucide-react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index, show } from '@/routes/inventory';
import type { BreadcrumbItem, LengthAwarePagination, Option } from '@/types';
import type { InventoryVariant, Outlet, StockBalance, StockMovement } from './types';

type QueryString = {
    outlet_id: number | null;
    transaction_type: string | null;
    date_from: string | null;
    date_to: string | null;
};

type InventoryShowProps = {
    variant: InventoryVariant;
    stock: StockBalance;
    movements: LengthAwarePagination<StockMovement>;
    outlets: Outlet[];
    selectedOutlet: Outlet | null;
    transactionTypes: Option[];
    queryString: QueryString;
};

const reloadProps = ['stock', 'movements', 'selectedOutlet', 'queryString'];

export default function InventoryShow({
    variant,
    stock,
    movements,
    outlets,
    selectedOutlet,
    transactionTypes,
    queryString,
}: InventoryShowProps) {
    const variantTitle = variant.label;
    const hasPages = movements.last_page > 1;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: index({ query: { outlet_id: queryString.outlet_id ?? undefined } }).url },
        { title: variantTitle, href: show(variant.id, { query: { outlet_id: queryString.outlet_id ?? undefined } }).url },
    ];

    const query = (overrides: Partial<QueryString> & { page?: number } = {}) => ({
        outlet_id: overrides.outlet_id ?? queryString.outlet_id ?? undefined,
        transaction_type:
            overrides.transaction_type === null ? undefined : (overrides.transaction_type ?? queryString.transaction_type ?? undefined),
        date_from: overrides.date_from === null ? undefined : (overrides.date_from ?? queryString.date_from ?? undefined),
        date_to: overrides.date_to === null ? undefined : (overrides.date_to ?? queryString.date_to ?? undefined),
        page: overrides.page ?? 1,
    });

    const visit = (overrides: Partial<QueryString> & { page?: number } = {}) => {
        router.get(
            show(variant.id, { query: query(overrides) }).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: reloadProps,
            },
        );
    };

    const cards = [
        {
            label: 'On Hand',
            value: `${formatQuantity(stock.quantity)} ${variant.base_unit.code}`,
            icon: PackageOpen,
            iconClassName: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        },
        {
            label: 'Average Base Cost',
            value: `${formatCurrency(stock.average_cost)} / ${variant.base_unit.code}`,
            icon: ReceiptText,
            iconClassName: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
        },
        {
            label: 'Stock Value',
            value: formatCurrency(stock.stock_value),
            icon: CircleDollarSign,
            iconClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        },
        {
            label: 'Last Movement',
            value: stock.last_movement_at ? format(parseISO(stock.last_movement_at), 'MMM d, yyyy') : 'No movement',
            icon: CalendarClock,
            iconClassName: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={variantTitle} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <Heading title={variantTitle} description="Stock balance and movement audit history." />
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>SKU: {variant.sku || '-'}</span>
                                <span aria-hidden="true">•</span>
                                <span>{variant.category.name}</span>
                                <Badge variant="outline" className="capitalize">
                                    {variant.status}
                                </Badge>
                            </div>
                        </div>

                        {outlets.length > 0 && (
                            <Select
                                value={selectedOutlet?.id.toString()}
                                onValueChange={(value) => visit({ outlet_id: Number(value), page: 1 })}
                            >
                                <SelectTrigger className="w-full sm:w-64">
                                    <SelectValue placeholder="Select outlet" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    {outlets.map((outlet) => (
                                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                            {outlet.name} ({outlet.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => (
                            <Card key={card.label} className="gap-0 py-5">
                                <CardContent className="flex items-center justify-between gap-4 px-5">
                                    <div className="min-w-0">
                                        <p className="text-sm text-muted-foreground">{card.label}</p>
                                        <p className="mt-1 truncate text-xl font-semibold tabular-nums">{card.value}</p>
                                    </div>
                                    <div className={`rounded-lg p-2.5 ${card.iconClassName}`}>
                                        <card.icon className="size-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Movement History</h2>
                            <p className="text-sm text-muted-foreground">Entered quantities and their normalized base-unit movement.</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[14rem_12rem_12rem_auto]">
                            <Select
                                value={queryString.transaction_type ?? 'all'}
                                onValueChange={(value) => visit({ transaction_type: value === 'all' ? null : value, page: 1 })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All movement types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All movement types</SelectItem>
                                    {transactionTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                aria-label="Movement date from"
                                value={queryString.date_from ?? ''}
                                onChange={(event) => visit({ date_from: event.currentTarget.value || null, page: 1 })}
                            />

                            <Input
                                type="date"
                                aria-label="Movement date to"
                                value={queryString.date_to ?? ''}
                                min={queryString.date_from ?? undefined}
                                onChange={(event) => visit({ date_to: event.currentTarget.value || null, page: 1 })}
                            />

                            {(queryString.transaction_type || queryString.date_from || queryString.date_to) && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        visit({
                                            transaction_type: null,
                                            date_from: null,
                                            date_to: null,
                                            page: 1,
                                        })
                                    }
                                >
                                    Clear
                                </Button>
                            )}
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="table-hover table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Reference</th>
                                        <th className="text-right">Entered Quantity</th>
                                        <th className="text-right">Base Movement</th>
                                        <th className="text-right">Unit Cost</th>
                                        <th className="text-right">Total Cost</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.data.length > 0 ? (
                                        movements.data.map((movement) => (
                                            <tr key={movement.id}>
                                                <td className="text-nowrap">
                                                    {format(parseISO(movement.transaction_date), 'MMM d, yyyy')}
                                                </td>
                                                <td>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            movement.direction === 'in'
                                                                ? 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                                                : 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                                                        }
                                                    >
                                                        {movement.transaction_type_label}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {movement.source?.href ? (
                                                        <Link
                                                            href={movement.source.href}
                                                            className="font-medium text-primary underline-offset-4 hover:underline"
                                                        >
                                                            {movement.source.label}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground">{movement.source?.label ?? '-'}</span>
                                                    )}
                                                </td>
                                                <td className="text-right tabular-nums">
                                                    {movement.direction === 'in' ? '+' : '-'}
                                                    {formatQuantity(movement.entered_quantity)} {movement.unit.code}
                                                </td>
                                                <td
                                                    className={`text-right font-medium tabular-nums ${
                                                        movement.direction === 'in'
                                                            ? 'text-emerald-700 dark:text-emerald-300'
                                                            : 'text-red-700 dark:text-red-300'
                                                    }`}
                                                >
                                                    {movement.direction === 'in' ? '+' : ''}
                                                    {formatQuantity(movement.base_quantity)} {variant.base_unit.code}
                                                </td>
                                                <td className="text-right tabular-nums">
                                                    {movement.unit_cost === null ? '-' : formatCurrency(movement.unit_cost)}
                                                </td>
                                                <td className="text-right font-medium tabular-nums">
                                                    {movement.total_cost === null ? '-' : formatCurrency(movement.total_cost)}
                                                </td>
                                                <td className="max-w-56 truncate text-muted-foreground">{movement.note || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="h-28 text-center text-muted-foreground">
                                                {queryString.transaction_type || queryString.date_from || queryString.date_to
                                                    ? 'No movements match the current filters.'
                                                    : 'No stock movements recorded for this outlet.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {hasPages && (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                    {`Showing ${movements.from}-${movements.to} of ${movements.total} movements`}
                                </div>
                                <PaginatorLinks
                                    links={movements.links}
                                    only={reloadProps}
                                    className="mx-0 w-auto justify-start sm:justify-end"
                                />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
