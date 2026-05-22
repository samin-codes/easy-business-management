import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Eye, Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { TableSortButton } from '@/components/table-sort-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { create, index, show } from '@/routes/purchases';
import type { BreadcrumbItem, LengthAwarePagination } from '@/types';
import type { Purchase } from './types';

type QueryString = {
    search: string | null;
    sort: 'purchase_no' | 'purchase_date' | 'total_amount' | 'paid_amount' | 'due_amount';
    direction: 'asc' | 'desc';
};

export default function PurchasesIndex({
    purchases,
    queryString,
}: {
    purchases: LengthAwarePagination<Purchase>;
    queryString: QueryString;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['purchases', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: 'List', href: index().url },
    ];

    const hasPages = purchases.last_page > 1;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchases" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="mb-8 flex items-center justify-between">
                        <Heading title="Purchases" />
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Purchase
                            </Link>
                        </Button>
                    </div>

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
                                                router.get(
                                                    index().url,
                                                    {
                                                        search: search || undefined,
                                                        sort: queryString.sort,
                                                        direction: queryString.direction,
                                                        page: 1,
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                        replace: true,
                                                        only: reloadProps,
                                                    },
                                                );
                                            }, 300);
                                        }}
                                    />
                                </div>

                                {queryString.search && (
                                    <Button variant="outline" asChild>
                                        <Link href={index()} preserveScroll only={reloadProps}>
                                            Clear
                                        </Link>
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
                                                    href={index({
                                                        query: {
                                                            search: queryString.search ?? undefined,
                                                            sort: 'purchase_no',
                                                            direction:
                                                                queryString.sort === 'purchase_no' &&
                                                                queryString.direction === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            page: 1,
                                                        },
                                                    }).url}
                                                    isActive={queryString.sort === 'purchase_no'}
                                                    currentDirection={queryString.direction}
                                                    only={reloadProps}
                                                />
                                            </th>
                                            <th>
                                                <TableSortButton
                                                    label="Date"
                                                    href={index({
                                                        query: {
                                                            search: queryString.search ?? undefined,
                                                            sort: 'purchase_date',
                                                            direction:
                                                                queryString.sort === 'purchase_date' &&
                                                                queryString.direction === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            page: 1,
                                                        },
                                                    }).url}
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
                                                    href={index({
                                                        query: {
                                                            search: queryString.search ?? undefined,
                                                            sort: 'total_amount',
                                                            direction:
                                                                queryString.sort === 'total_amount' &&
                                                                queryString.direction === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            page: 1,
                                                        },
                                                    }).url}
                                                    isActive={queryString.sort === 'total_amount'}
                                                    currentDirection={queryString.direction}
                                                    align="right"
                                                    only={reloadProps}
                                                />
                                            </th>
                                            <th className="text-right">
                                                <TableSortButton
                                                    label="Paid"
                                                    href={index({
                                                        query: {
                                                            search: queryString.search ?? undefined,
                                                            sort: 'paid_amount',
                                                            direction:
                                                                queryString.sort === 'paid_amount' &&
                                                                queryString.direction === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            page: 1,
                                                        },
                                                    }).url}
                                                    isActive={queryString.sort === 'paid_amount'}
                                                    currentDirection={queryString.direction}
                                                    align="right"
                                                    only={reloadProps}
                                                />
                                            </th>
                                            <th className="text-right">
                                                <TableSortButton
                                                    label="Due"
                                                    href={index({
                                                        query: {
                                                            search: queryString.search ?? undefined,
                                                            sort: 'due_amount',
                                                            direction:
                                                                queryString.sort === 'due_amount' &&
                                                                queryString.direction === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            page: 1,
                                                        },
                                                    }).url}
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
                                                    <td className="font-medium">
                                                        {purchase.purchase_no}
                                                    </td>
                                                    <td className="text-nowrap">
                                                        {format(
                                                            parseISO(purchase.purchase_date),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </td>
                                                    <td>{purchase.supplier?.name ?? '-'}</td>
                                                    <td>{purchase.outlet?.name ?? '-'}</td>
                                                    <td className="text-right tabular-nums">
                                                        {formatCurrency(purchase.total_amount)}
                                                    </td>
                                                    <td className="text-right tabular-nums">
                                                        {formatCurrency(purchase.paid_amount)}
                                                    </td>
                                                    <td className="text-right tabular-nums">
                                                        {formatCurrency(purchase.due_amount)}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                purchase.payment_status === 'paid'
                                                                    ? 'border-transparent bg-emerald-100 text-emerald-800'
                                                                    : purchase.payment_status ===
                                                                        'partial'
                                                                      ? 'border-transparent bg-amber-100 text-amber-800'
                                                                      : 'border-transparent bg-red-100 text-red-800'
                                                            }
                                                        >
                                                            {purchase.payment_status_label ??
                                                                purchase.payment_status}
                                                        </Badge>
                                                    </td>
                                                    <td>{purchase.createdBy?.name ?? '-'}</td>
                                                    <td className="text-right">
                                                        <div className="flex justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                asChild
                                                            >
                                                                <Link href={show(purchase.id)}>
                                                                    <Eye className="size-4" />
                                                                    <span className="sr-only">
                                                                        View purchase
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={10}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    {queryString.search
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
