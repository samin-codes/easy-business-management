import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import Heading from '@/components/heading';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index, show } from '@/routes/inventory';
import type {
    BreadcrumbItem,
    LengthAwarePagination,
    Option,
    Outlet,
    ProductCategory,
    ProductStockLedgerTransactionType,
    RecordStatus,
    UnitOfMeasurement,
} from '@/types';

type InventoryOutlet = Pick<Outlet, 'id' | 'name' | 'code'>;

type InventoryVariant = {
    id: number;
    label: string;
    sku: string | null;
    status: RecordStatus;
    category: Pick<ProductCategory, 'name'>;
    base_unit: Pick<UnitOfMeasurement, 'code'>;
};

type InventoryMovement = {
    id: number;
    transaction_date: string;
    transaction_type_label: string;
    direction: 'in' | 'out';
    entered_quantity: string;
    base_quantity: string;
    unit_cost: string | null;
    total_cost: string | null;
    unit: Pick<UnitOfMeasurement, 'code'>;
    source: {
        label: string;
        href: string;
    } | null;
    note: string | null;
};

type QueryString = {
    outlet_id: number | null;
    transaction_type: ProductStockLedgerTransactionType | null;
    date_from: string | null;
    date_to: string | null;
};

type InventoryShowProps = {
    variant: InventoryVariant;
    stock: {
        quantity: string;
        average_cost: string;
        stock_value: string;
        last_movement_at: string | null;
    };
    movements: LengthAwarePagination<InventoryMovement>;
    outlets: InventoryOutlet[];
    selectedOutlet: InventoryOutlet | null;
    transactionTypes: Option<ProductStockLedgerTransactionType>[];
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
    const dateFrom = queryString.date_from ? parseISO(queryString.date_from) : undefined;
    const dateTo = queryString.date_to ? parseISO(queryString.date_to) : undefined;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inventory',
            href: index({
                query: {
                    outlet_id: queryString.outlet_id ?? undefined,
                },
            }).url,
        },
        {
            title: variant.label,
            href: show(variant.id, {
                query: {
                    outlet_id: queryString.outlet_id ?? undefined,
                },
            }).url,
        },
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
            show(variant.id, {
                query: query(overrides),
            }).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: reloadProps,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={variant.label} />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Heading title={variant.label} />

                                {variant.status === 'inactive' && <Badge variant="outline">Inactive</Badge>}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                {variant.sku && (
                                    <>
                                        <span>{variant.sku}</span>
                                        <span aria-hidden="true">•</span>
                                    </>
                                )}

                                <span>{variant.category.name}</span>
                            </div>
                        </div>

                        {outlets.length > 0 && (
                            <Select
                                value={selectedOutlet?.id.toString()}
                                onValueChange={(value) =>
                                    visit({
                                        outlet_id: Number(value),
                                        page: 1,
                                    })
                                }
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

                    <Card className="gap-0 py-0">
                        <CardContent className="grid grid-cols-2 p-0 lg:grid-cols-4">
                            <div className="min-w-0 p-4 sm:p-5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">On Hand</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatQuantity(stock.quantity)} {variant.base_unit.code}
                                </p>
                            </div>
                            <div className="min-w-0 border-l p-4 sm:p-5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Avg. Cost</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(stock.average_cost)} / {variant.base_unit.code}
                                </p>
                            </div>
                            <div className="min-w-0 border-t p-4 sm:p-5 lg:border-t-0 lg:border-l">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Stock Value</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(stock.stock_value)}
                                </p>
                            </div>
                            <div className="min-w-0 border-t border-l p-4 sm:p-5 lg:border-t-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Last Movement</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {stock.last_movement_at ? format(parseISO(stock.last_movement_at), 'MMM d, yyyy') : 'No movement'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">Movement History</h2>

                        <div className="grid gap-3 md:grid-cols-[14rem_12rem_12rem_auto]">
                            <Select
                                value={queryString.transaction_type ?? 'all'}
                                onValueChange={(value) =>
                                    visit({
                                        transaction_type: value === 'all' ? null : (value as ProductStockLedgerTransactionType),
                                        page: 1,
                                    })
                                }
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

                            <DatePicker
                                id="movement-date-from"
                                aria-label="Movement date from"
                                value={dateFrom}
                                placeholder="From date"
                                disabledDays={dateTo ? { after: dateTo } : undefined}
                                onChange={(date) =>
                                    visit({
                                        date_from: date ? format(date, 'yyyy-MM-dd') : null,
                                        page: 1,
                                    })
                                }
                            />

                            <DatePicker
                                id="movement-date-to"
                                aria-label="Movement date to"
                                value={dateTo}
                                placeholder="To date"
                                disabledDays={dateFrom ? { before: dateFrom } : undefined}
                                onChange={(date) =>
                                    visit({
                                        date_to: date ? format(date, 'yyyy-MM-dd') : null,
                                        page: 1,
                                    })
                                }
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

                        <div className="ui-table">
                            <div className="ui-table-main">
                                <div className="ui-table-content">
                                    <table className="ui-table-element">
                                        <thead>
                                            <tr>
                                                <th className="ui-table-header-cell">Date</th>
                                                <th className="ui-table-header-cell">Type</th>
                                                <th className="ui-table-header-cell">Reference</th>
                                                <th className="ui-table-header-cell text-right">Entered Quantity</th>
                                                <th className="ui-table-header-cell text-right">Base Movement</th>
                                                <th className="ui-table-header-cell text-right">Unit Cost</th>
                                                <th className="ui-table-header-cell text-right">Total Cost</th>
                                                <th className="ui-table-header-cell">Note</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {movements.data.map((movement) => (
                                                <tr key={movement.id} className="ui-table-row">
                                                    <td className="ui-table-cell text-nowrap">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {format(parseISO(movement.transaction_date), 'MMM d, yyyy')}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
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
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {movement.source ? (
                                                                    <Link
                                                                        href={movement.source.href}
                                                                        className="font-medium text-primary underline-offset-4 hover:underline"
                                                                    >
                                                                        {movement.source.label}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {movement.direction === 'in' ? '+' : '-'}
                                                                {formatQuantity(movement.entered_quantity)} {movement.unit.code}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td
                                                        className={`ui-table-cell text-right font-medium tabular-nums ${
                                                            movement.direction === 'in'
                                                                ? 'text-emerald-700 dark:text-emerald-300'
                                                                : 'text-red-700 dark:text-red-300'
                                                        }`}
                                                    >
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {movement.direction === 'in' ? '+' : ''}
                                                                {formatQuantity(movement.base_quantity)} {variant.base_unit.code}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {movement.unit_cost === null ? '-' : formatCurrency(movement.unit_cost)}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right font-medium tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {movement.total_cost === null ? '-' : formatCurrency(movement.total_cost)}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell max-w-56 truncate text-muted-foreground">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">{movement.note || '-'}</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {movements.data.length === 0 && (
                                    <div className="ui-table-empty-state">
                                        <div className="ui-table-empty-state-content">
                                            {queryString.transaction_type || queryString.date_from || queryString.date_to
                                                ? 'No movements match the current filters.'
                                                : 'No stock movements recorded for this outlet.'}
                                        </div>
                                    </div>
                                )}
                                <TablePagination paginator={movements} only={reloadProps} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
