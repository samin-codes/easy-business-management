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
import { create, index, show } from '@/routes/purchases';
import type { BreadcrumbItem, LengthAwarePagination, Outlet, Purchase } from '@/types';

type PurchaseOutlet = Pick<Outlet, 'id' | 'name' | 'code' | 'status'>;

type QueryString = {
    outlet_id: number | null;
    search: string | null;
    sort: 'purchase_no' | 'purchase_date' | 'total_amount' | 'paid_amount' | 'due_amount';
    direction: 'asc' | 'desc';
};

export default function PurchasesIndex({
    purchases,
    purchaseStats,
    outlets,
    queryString,
}: {
    purchases: LengthAwarePagination<Purchase>;
    purchaseStats: {
        purchase_count: number;
        total_amount: string;
        paid_amount: string;
        due_amount: string;
    };
    outlets: PurchaseOutlet[];
    queryString: QueryString;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['purchases', 'purchaseStats', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: 'List', href: index().url },
    ];

    const hasPages = purchases.last_page > 1;

    const query = (overrides: Partial<QueryString> & { page?: number } = {}) => ({
        outlet_id: overrides.outlet_id === null ? undefined : (overrides.outlet_id ?? queryString.outlet_id ?? undefined),
        search: overrides.search === null ? undefined : (overrides.search ?? queryString.search ?? undefined),
        sort: overrides.sort ?? queryString.sort,
        direction: overrides.direction ?? queryString.direction,
        page: overrides.page ?? 1,
    });

    const visit = (overrides: Partial<QueryString> & { page?: number } = {}) => {
        router.get(
            index({ query: query(overrides) }).url,
            {},
            { preserveScroll: true, preserveState: true, replace: true, only: reloadProps },
        );
    };

    const sortUrl = (sort: QueryString['sort']) =>
        index({
            query: query({
                sort,
                direction: queryString.sort === sort && queryString.direction === 'asc' ? 'desc' : 'asc',
            }),
        }).url;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchases" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <Heading title="Purchases" />

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
                                    <Plus />
                                    New Purchase
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="gap-0 py-0">
                        <CardContent className="grid grid-cols-2 p-0 lg:grid-cols-4">
                            <div className="min-w-0 p-4 sm:p-5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Purchases</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {purchaseStats.purchase_count.toLocaleString()}
                                </p>
                            </div>
                            <div className="min-w-0 border-l p-4 sm:p-5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Total Amount</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(purchaseStats.total_amount)}
                                </p>
                            </div>
                            <div className="min-w-0 border-t p-4 sm:p-5 lg:border-t-0 lg:border-l">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Paid</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(purchaseStats.paid_amount)}
                                </p>
                            </div>
                            <div className="min-w-0 border-t border-l p-4 sm:p-5 lg:border-t-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Due</p>
                                <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                    {formatCurrency(purchaseStats.due_amount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        type="search"
                                        placeholder="Search purchase no..."
                                        className="pl-9"
                                        defaultValue={queryString.search ?? ''}
                                        onChange={(event) => {
                                            const search = event.currentTarget.value.trim();

                                            window.clearTimeout(searchTimeout.current);

                                            searchTimeout.current = window.setTimeout(() => {
                                                visit({ search: search || null, page: 1 });
                                            }, 300);
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
                                                    label="Purchase No"
                                                    href={sortUrl('purchase_no')}
                                                    isActive={queryString.sort === 'purchase_no'}
                                                    currentDirection={queryString.direction}
                                                    only={reloadProps}
                                                />
                                            </th>

                                            <th>
                                                <TableSortButton
                                                    label="Date"
                                                    href={sortUrl('purchase_date')}
                                                    isActive={queryString.sort === 'purchase_date'}
                                                    currentDirection={queryString.direction}
                                                    only={reloadProps}
                                                />
                                            </th>

                                            <th>Supplier</th>
                                            <th>Outlet</th>

                                            <th className="text-right">
                                                <TableSortButton
                                                    label="Total"
                                                    href={sortUrl('total_amount')}
                                                    isActive={queryString.sort === 'total_amount'}
                                                    currentDirection={queryString.direction}
                                                    align="right"
                                                    only={reloadProps}
                                                />
                                            </th>

                                            <th className="text-right">
                                                <TableSortButton
                                                    label="Paid"
                                                    href={sortUrl('paid_amount')}
                                                    isActive={queryString.sort === 'paid_amount'}
                                                    currentDirection={queryString.direction}
                                                    align="right"
                                                    only={reloadProps}
                                                />
                                            </th>

                                            <th className="text-right">
                                                <TableSortButton
                                                    label="Due"
                                                    href={sortUrl('due_amount')}
                                                    isActive={queryString.sort === 'due_amount'}
                                                    currentDirection={queryString.direction}
                                                    align="right"
                                                    only={reloadProps}
                                                />
                                            </th>

                                            <th className="text-center">Payment Status</th>

                                            <th>Created By</th>

                                            <th className="text-right">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {purchases.data.length > 0 ? (
                                            purchases.data.map((purchase) => (
                                                <tr key={purchase.id}>
                                                    <td className="font-medium">{purchase.purchase_no}</td>

                                                    <td className="text-nowrap">
                                                        {format(parseISO(purchase.purchase_date), 'MMM d, yyyy')}
                                                    </td>

                                                    <td>{purchase.supplier?.name ?? '-'}</td>

                                                    <td>{purchase.outlet?.name ?? '-'}</td>

                                                    <td className="text-right tabular-nums">{formatCurrency(purchase.total_amount)}</td>

                                                    <td className="text-right tabular-nums">{formatCurrency(purchase.paid_amount)}</td>

                                                    <td className="text-right tabular-nums">{formatCurrency(purchase.due_amount)}</td>

                                                    <td className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                purchase.payment_status === 'paid'
                                                                    ? 'border-transparent bg-emerald-100 text-emerald-800'
                                                                    : purchase.payment_status === 'partial'
                                                                      ? 'border-transparent bg-amber-100 text-amber-800'
                                                                      : 'border-transparent bg-red-100 text-red-800'
                                                            }
                                                        >
                                                            {purchase.payment_status_label ?? purchase.payment_status}
                                                        </Badge>
                                                    </td>

                                                    <td>{purchase.createdBy?.name ?? '-'}</td>

                                                    <td className="text-right">
                                                        <div className="flex justify-end">
                                                            <ViewAction
                                                                url={show(purchase.id)}
                                                                aria-label={`View purchase ${purchase.purchase_no}`}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="h-24 text-center text-muted-foreground">
                                                    {queryString.search || queryString.outlet_id
                                                        ? 'No purchases found.'
                                                        : 'No purchases yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {hasPages && (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                        {`Showing ${purchases.from}-${purchases.to} of ${purchases.total} purchases`}
                                    </div>

                                    <PaginatorLinks
                                        links={purchases.links}
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
