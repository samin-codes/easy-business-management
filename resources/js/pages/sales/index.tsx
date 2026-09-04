import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { ViewAction } from '@/components/table-actions';
import { TableSortButton } from '@/components/table-sort-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { create, index, show } from '@/routes/sales';
import type { LengthAwarePagination, Outlet, Sale } from '@/types';

type SaleOutlet = Pick<Outlet, 'id' | 'name' | 'code' | 'status'>;

type QueryString = {
    outlet_id: number | null;
    search: string | null;
    sort: 'sale_no' | 'sale_date' | 'total_amount' | 'paid_amount' | 'due_amount';
    direction: 'asc' | 'desc';
};

export default function SalesIndex({
    sales,
    saleStats,
    outlets,
    queryString,
}: {
    sales: LengthAwarePagination<Sale>;
    saleStats: {
        sale_count: number;
        total_amount: string;
        paid_amount: string;
        due_amount: string;
    };
    outlets: SaleOutlet[];
    queryString: QueryString;
}) {
    const timer = useRef<number | undefined>(undefined);
    const only = ['sales', 'saleStats', 'queryString'];

    const query = (overrides: Partial<QueryString> & { page?: number } = {}) => ({
        outlet_id: overrides.outlet_id === null ? undefined : (overrides.outlet_id ?? queryString.outlet_id ?? undefined),
        search: overrides.search === null ? undefined : (overrides.search ?? queryString.search ?? undefined),
        sort: overrides.sort ?? queryString.sort,
        direction: overrides.direction ?? queryString.direction,
        page: overrides.page ?? 1,
    });

    const visit = (overrides: Partial<QueryString> & { page?: number } = {}) => {
        router.get(index({ query: query(overrides) }).url, {}, { preserveScroll: true, preserveState: true, replace: true, only });
    };

    const sortUrl = (sort: QueryString['sort']) =>
        index({
            query: query({
                sort,
                direction: queryString.sort === sort && queryString.direction === 'asc' ? 'desc' : 'asc',
            }),
        }).url;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sales', href: index().url },
                { title: 'List', href: index().url },
            ]}
        >
            <Head title="Sales" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <Heading title="Sales" />

                        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                            <Select
                                value={queryString.outlet_id?.toString() ?? 'all'}
                                onValueChange={(value) => visit({ outlet_id: value === 'all' ? null : Number(value), page: 1 })}
                            >
                                <SelectTrigger className="w-full sm:w-64">
                                    <SelectValue placeholder="All outlets" />
                                </SelectTrigger>

                                <SelectContent align="end">
                                    <SelectItem value="all">All outlets</SelectItem>

                                    {outlets.map((outlet) => (
                                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                            {outlet.name}
                                            {outlet.code ? ` (${outlet.code})` : ''}
                                            {outlet.status === 'inactive' ? ' — Inactive' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button asChild>
                                <Link href={create()}>
                                    <Plus className="size-4" />
                                    New Sale
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="gap-0 py-0">
                        <CardContent className="grid grid-cols-2 p-0 lg:grid-cols-4">
                            <div className="min-w-0 p-4 sm:p-5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sales</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {saleStats.sale_count.toLocaleString()}
                                </p>
                            </div>
                            <div className="min-w-0 border-l p-4 sm:p-5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Total Amount</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(saleStats.total_amount)}
                                </p>
                            </div>
                            <div className="min-w-0 border-t p-4 sm:p-5 lg:border-t-0 lg:border-l">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Paid</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(saleStats.paid_amount)}
                                </p>
                            </div>
                            <div className="min-w-0 border-t border-l p-4 sm:p-5 lg:border-t-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Due</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(saleStats.due_amount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                type="search"
                                className="pl-9"
                                placeholder="Search sale no..."
                                defaultValue={queryString.search ?? ''}
                                onChange={(event) => {
                                    const search = event.currentTarget.value.trim();

                                    window.clearTimeout(timer.current);

                                    timer.current = window.setTimeout(() => visit({ search: search || null, page: 1 }), 300);
                                }}
                            />
                        </div>

                        {queryString.search && (
                            <Button variant="outline" onClick={() => visit({ search: null, page: 1 })}>
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto rounded-md border">
                        <table className="table-hover table">
                            <thead>
                                <tr>
                                    <th>
                                        <TableSortButton
                                            label="Sale No"
                                            href={sortUrl('sale_no')}
                                            isActive={queryString.sort === 'sale_no'}
                                            currentDirection={queryString.direction}
                                            only={only}
                                        />
                                    </th>

                                    <th>
                                        <TableSortButton
                                            label="Date"
                                            href={sortUrl('sale_date')}
                                            isActive={queryString.sort === 'sale_date'}
                                            currentDirection={queryString.direction}
                                            only={only}
                                        />
                                    </th>

                                    <th>Customer</th>
                                    <th>Outlet</th>

                                    <th className="text-right">
                                        <TableSortButton
                                            label="Total"
                                            href={sortUrl('total_amount')}
                                            isActive={queryString.sort === 'total_amount'}
                                            currentDirection={queryString.direction}
                                            align="right"
                                            only={only}
                                        />
                                    </th>

                                    <th className="text-right">Paid</th>
                                    <th className="text-right">Due</th>
                                    <th className="text-center">Payment Status</th>
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {sales.data.length ? (
                                    sales.data.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="font-medium">{sale.sale_no}</td>

                                            <td>{format(parseISO(sale.sale_date), 'MMM d, yyyy')}</td>

                                            <td>{sale.customer?.name ?? '-'}</td>

                                            <td>{sale.outlet?.name ?? '-'}</td>

                                            <td className="text-right tabular-nums">{formatCurrency(sale.total_amount)}</td>

                                            <td className="text-right tabular-nums">{formatCurrency(sale.paid_amount)}</td>

                                            <td className="text-right tabular-nums">{formatCurrency(sale.due_amount)}</td>

                                            <td className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        sale.payment_status === 'paid'
                                                            ? 'border-transparent bg-emerald-100 text-emerald-800'
                                                            : sale.payment_status === 'partial'
                                                              ? 'border-transparent bg-amber-100 text-amber-800'
                                                              : 'border-transparent bg-red-100 text-red-800'
                                                    }
                                                >
                                                    {sale.payment_status_label ?? sale.payment_status}
                                                </Badge>
                                            </td>

                                            <td className="text-right">
                                                <ViewAction url={show(sale.id)} aria-label={`View sale ${sale.sale_no}`} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="h-24 text-center text-muted-foreground">
                                            {queryString.search || queryString.outlet_id ? 'No sales found.' : 'No sales yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {sales.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Showing {sales.from}-{sales.to} of {sales.total} sales
                            </span>

                            <PaginatorLinks links={sales.links} only={only} className="mx-0 w-auto" />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
