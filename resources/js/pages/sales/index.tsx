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
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { create, index, show } from '@/routes/sales';
import type { LengthAwarePagination, Sale } from '@/types';

type QueryString = {
    search: string | null;
    sort: 'sale_no' | 'sale_date' | 'total_amount' | 'paid_amount' | 'due_amount';
    direction: 'asc' | 'desc';
};

export default function SalesIndex({ sales, queryString }: { sales: LengthAwarePagination<Sale>; queryString: QueryString }) {
    const timer = useRef<number | undefined>(undefined);
    const only = ['sales', 'queryString'];

    const sortUrl = (sort: QueryString['sort']) =>
        index({
            query: {
                search: queryString.search ?? undefined,
                sort,
                direction: queryString.sort === sort && queryString.direction === 'asc' ? 'desc' : 'asc',
                page: 1,
            },
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
                    <div className="flex items-center justify-between">
                        <Heading title="Sales" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                New Sale
                            </Link>
                        </Button>
                    </div>

                    <div className="relative max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            className="pl-9"
                            placeholder="Search sale no..."
                            defaultValue={queryString.search ?? ''}
                            onChange={(event) => {
                                window.clearTimeout(timer.current);

                                timer.current = window.setTimeout(
                                    () =>
                                        router.get(
                                            index().url,
                                            {
                                                search: event.currentTarget.value.trim() || undefined,
                                                sort: queryString.sort,
                                                direction: queryString.direction,
                                                page: 1,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                                only,
                                            },
                                        ),
                                    300,
                                );
                            }}
                        />
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
                                            {queryString.search ? 'No sales found.' : 'No sales yet.'}
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
