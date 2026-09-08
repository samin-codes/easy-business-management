import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { ViewAction } from '@/components/table-actions';
import { TableHead } from '@/components/table-head';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { index as inventoryIndex } from '@/routes/inventory';
import { create, index, show } from '@/routes/stock-adjustments';
import type {
    BreadcrumbItem,
    LengthAwarePagination,
    Outlet,
    StockAdjustment,
} from '@/types';
import Navigation from '../components/navigation';

type QueryString = {
    search: string | null;
    outlet_id: number | null;
};

type Props = {
    adjustments: LengthAwarePagination<StockAdjustment>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: QueryString;
};

const reloadProps = ['adjustments', 'queryString'];

export default function Index({
    adjustments,
    outlets,
    queryString,
}: Props) {
    const searchTimeout = useRef<number | undefined>(undefined);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Adjustments', href: index().url },
    ];

    const visit = (
        overrides: Partial<QueryString> & { page?: number } = {},
    ) => {
        router.visit(
            index({
                query: {
                    ...queryString,
                    page: 1,
                    ...overrides,
                },
            }),
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
            <Head title="Stock Adjustments" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Navigation active="adjustments" />

                    <div className="flex items-start justify-between gap-4">
                        <Heading title="Stock Adjustments" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Adjustment
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[25rem_14rem]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    placeholder="Search adjustment no..."
                                    className="pl-9"
                                    defaultValue={queryString.search ?? ''}
                                    onChange={(event) => {
                                        const search =
                                            event.currentTarget.value.trim();

                                        window.clearTimeout(
                                            searchTimeout.current,
                                        );

                                        searchTimeout.current =
                                            window.setTimeout(() => {
                                                visit({
                                                    search: search || null,
                                                });
                                            }, 300);
                                    }}
                                />
                            </div>

                            <Select
                                value={
                                    queryString.outlet_id?.toString() ?? 'all'
                                }
                                onValueChange={(value) =>
                                    visit({
                                        outlet_id:
                                            value === 'all'
                                                ? null
                                                : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All outlets" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All outlets
                                    </SelectItem>

                                    {outlets.map((outlet) => (
                                        <SelectItem
                                            key={outlet.id}
                                            value={outlet.id.toString()}
                                        >
                                            {outlet.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="ui-table">
                            <div className="ui-table-main">
                                <div className="ui-table-content">
                                    <table className="ui-table-element ui-table-hover">
                                        <thead>
                                            <tr>
                                                <TableHead>
                                                    Adjustment No
                                                </TableHead>

                                                <TableHead>Date</TableHead>

                                                <TableHead>Outlet</TableHead>

                                                <TableHead>Type</TableHead>

                                                <TableHead>Reason</TableHead>

                                                <TableHead align="end">
                                                    Items
                                                </TableHead>

                                                <TableHead align="end">
                                                    Value
                                                </TableHead>

                                                <TableHead>
                                                    Created By
                                                </TableHead>

                                                <TableHead className="ui-table-empty-header-cell text-right">
                                                    <span className="sr-only">
                                                        Actions
                                                    </span>
                                                </TableHead>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {adjustments.data.map(
                                                (adjustment) => (
                                                    <tr
                                                        key={adjustment.id}
                                                        className="ui-table-row"
                                                    >
                                                        <td className="ui-table-cell font-medium">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {
                                                                        adjustment.adjustment_no
                                                                    }
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-nowrap">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {format(
                                                                        parseISO(
                                                                            adjustment.adjustment_date,
                                                                        ),
                                                                        'MMM d, yyyy',
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {adjustment
                                                                        .outlet
                                                                        ?.name ??
                                                                        '-'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    <Badge
                                                                        variant={
                                                                            adjustment.type ===
                                                                            'in'
                                                                                ? 'default'
                                                                                : 'destructive'
                                                                        }
                                                                    >
                                                                        {adjustment.type_label ??
                                                                            adjustment.type}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {adjustment.reason_label ??
                                                                        adjustment.reason}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {adjustment.items_count ??
                                                                        0}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right font-medium tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {formatCurrency(
                                                                        adjustment.total_value,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {adjustment
                                                                        .createdBy
                                                                        ?.name ??
                                                                        '-'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right">
                                                            <div className="ui-table-actions">
                                                                <ViewAction
                                                                    url={show(
                                                                        adjustment.id,
                                                                    )}
                                                                    aria-label={`View adjustment ${adjustment.adjustment_no}`}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {adjustments.data.length === 0 && (
                                    <div className="ui-table-empty-state">
                                        <div className="ui-table-empty-state-content">
                                            {queryString.search ||
                                            queryString.outlet_id
                                                ? 'No stock adjustments found.'
                                                : 'No stock adjustments yet.'}
                                        </div>
                                    </div>
                                )}

                                <TablePagination
                                    paginator={adjustments}
                                    only={reloadProps}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
