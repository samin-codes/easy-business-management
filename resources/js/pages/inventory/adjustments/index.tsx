import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { ViewAction } from '@/components/table-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import InventoryNavigation from '@/pages/inventory/components/inventory-navigation';
import { index as inventoryIndex } from '@/routes/inventory';
import { create, index, show } from '@/routes/stock-adjustments';
import type { BreadcrumbItem, LengthAwarePagination, Outlet, StockAdjustment } from '@/types';

type QueryString = {
    search: string | null;
    outlet_id: number | null;
};

export default function AdjustmentsIndex({
    adjustments,
    outlets,
    queryString,
}: {
    adjustments: LengthAwarePagination<StockAdjustment>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: QueryString;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['adjustments', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Adjustments', href: index().url },
    ];

    const hasPages = adjustments.last_page > 1;

    const reload = (overrides: Partial<Pick<QueryString, 'search' | 'outlet_id'>>) => {
        router.get(
            index().url,
            {
                ...queryString,
                ...overrides,
                page: 1,
            },
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
                <div className="mx-auto max-w-7xl space-y-8">
                    <InventoryNavigation active="adjustments" />

                    <div className="flex items-center justify-between">
                        <Heading title="Stock Adjustments" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Adjustment
                            </Link>
                        </Button>
                    </div>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative min-w-64 flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        type="search"
                                        className="pl-9"
                                        placeholder="Search adjustment no..."
                                        defaultValue={queryString.search ?? ''}
                                        onChange={(event) => {
                                            const search = event.currentTarget.value.trim();

                                            window.clearTimeout(searchTimeout.current);

                                            searchTimeout.current = window.setTimeout(
                                                () =>
                                                    reload({
                                                        search: search || null,
                                                    }),
                                                300,
                                            );
                                        }}
                                    />
                                </div>

                                <Select
                                    value={queryString.outlet_id?.toString() ?? 'all'}
                                    onValueChange={(value) =>
                                        reload({
                                            outlet_id: value === 'all' ? null : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-56">
                                        <SelectValue placeholder="All outlets" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">All outlets</SelectItem>

                                        {outlets.map((outlet) => (
                                            <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                {outlet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="overflow-x-auto rounded-md border">
                                <table className="table-hover table">
                                    <thead>
                                        <tr>
                                            <th>Adjustment No</th>
                                            <th>Date</th>
                                            <th>Outlet</th>
                                            <th>Type</th>
                                            <th>Reason</th>
                                            <th className="text-right">Items</th>
                                            <th className="text-right">Value</th>
                                            <th>Created By</th>
                                            <th className="text-right">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {adjustments.data.length > 0 ? (
                                            adjustments.data.map((adjustment) => (
                                                <tr key={adjustment.id}>
                                                    <td className="font-medium">{adjustment.adjustment_no}</td>

                                                    <td className="text-nowrap">
                                                        {format(parseISO(adjustment.adjustment_date), 'MMM d, yyyy')}
                                                    </td>

                                                    <td>{adjustment.outlet?.name ?? '-'}</td>

                                                    <td>
                                                        <Badge variant={adjustment.type === 'in' ? 'default' : 'destructive'}>
                                                            {adjustment.type_label ?? adjustment.type}
                                                        </Badge>
                                                    </td>

                                                    <td>{adjustment.reason_label ?? adjustment.reason}</td>

                                                    <td className="text-right tabular-nums">{adjustment.items_count ?? 0}</td>

                                                    <td className="text-right font-medium tabular-nums">
                                                        {formatCurrency(adjustment.total_value)}
                                                    </td>

                                                    <td>{adjustment.createdBy?.name ?? '-'}</td>

                                                    <td className="text-right">
                                                        <div className="flex justify-end">
                                                            <ViewAction
                                                                url={show(adjustment.id)}
                                                                aria-label={`View adjustment ${adjustment.adjustment_no}`}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="h-24 text-center text-muted-foreground">
                                                    {queryString.search || queryString.outlet_id
                                                        ? 'No stock adjustments found.'
                                                        : 'No stock adjustments yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {hasPages && (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                        {`Showing ${adjustments.from}-${adjustments.to} of ${adjustments.total} stock adjustments`}
                                    </div>

                                    <PaginatorLinks
                                        links={adjustments.links}
                                        only={reloadProps}
                                        className="mx-0 w-auto justify-start sm:justify-end"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
