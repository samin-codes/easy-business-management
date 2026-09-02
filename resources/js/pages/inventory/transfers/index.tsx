import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { ViewAction } from '@/components/table-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import InventoryNavigation from '@/pages/inventory/components/inventory-navigation';
import { index as inventoryIndex } from '@/routes/inventory';
import { create, index, show } from '@/routes/stock-transfers';
import type { BreadcrumbItem, LengthAwarePagination, Outlet, StockTransfer } from '@/types';

type QueryString = {
    search: string | null;
    source_outlet_id: number | null;
    destination_outlet_id: number | null;
};

export default function TransfersIndex({
    transfers,
    outlets,
    queryString,
}: {
    transfers: LengthAwarePagination<StockTransfer>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: QueryString;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['transfers', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Transfers', href: index().url },
    ];

    const hasPages = transfers.last_page > 1;

    const reload = (overrides: Partial<Pick<QueryString, 'search' | 'source_outlet_id' | 'destination_outlet_id'>>) => {
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
            <Head title="Stock Transfers" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <InventoryNavigation active="transfers" />

                    <div className="flex items-center justify-between">
                        <Heading title="Stock Transfers" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Transfer
                            </Link>
                        </Button>
                    </div>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 lg:flex-row">
                                <div className="relative min-w-64 flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        type="search"
                                        className="pl-9"
                                        placeholder="Search transfer no..."
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
                                    value={queryString.source_outlet_id?.toString() ?? 'all'}
                                    onValueChange={(value) =>
                                        reload({
                                            source_outlet_id: value === 'all' ? null : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full lg:w-52">
                                        <SelectValue placeholder="All sources" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">All source outlets</SelectItem>

                                        {outlets.map((outlet) => (
                                            <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                {outlet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={queryString.destination_outlet_id?.toString() ?? 'all'}
                                    onValueChange={(value) =>
                                        reload({
                                            destination_outlet_id: value === 'all' ? null : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full lg:w-52">
                                        <SelectValue placeholder="All destinations" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">All destination outlets</SelectItem>

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
                                            <th>Transfer No</th>
                                            <th>Date</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th className="text-right">Items</th>
                                            <th className="text-right">Value</th>
                                            <th>Created By</th>
                                            <th className="text-right">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {transfers.data.length > 0 ? (
                                            transfers.data.map((transfer) => (
                                                <tr key={transfer.id}>
                                                    <td className="font-medium">{transfer.transfer_no}</td>

                                                    <td className="text-nowrap">
                                                        {format(parseISO(transfer.transfer_date), 'MMM d, yyyy')}
                                                    </td>

                                                    <td>{transfer.source_outlet?.name ?? '-'}</td>

                                                    <td>{transfer.destination_outlet?.name ?? '-'}</td>

                                                    <td className="text-right tabular-nums">{transfer.items_count ?? 0}</td>

                                                    <td className="text-right font-medium tabular-nums">
                                                        {formatCurrency(transfer.total_value)}
                                                    </td>

                                                    <td>{transfer.createdBy?.name ?? '-'}</td>

                                                    <td className="text-right">
                                                        <div className="flex justify-end">
                                                            <ViewAction
                                                                url={show(transfer.id)}
                                                                aria-label={`View transfer ${transfer.transfer_no}`}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="h-24 text-center text-muted-foreground">
                                                    {queryString.search || queryString.source_outlet_id || queryString.destination_outlet_id
                                                        ? 'No stock transfers found.'
                                                        : 'No stock transfers yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {hasPages && (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                        {`Showing ${transfers.from}-${transfers.to} of ${transfers.total} stock transfers`}
                                    </div>

                                    <PaginatorLinks
                                        links={transfers.links}
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
