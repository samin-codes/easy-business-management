import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { ViewAction } from '@/components/table-actions';
import { TablePagination } from '@/components/table-pagination';
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

                            <div className="ui-table">
                                <div className="ui-table-main">
                                    <div className="ui-table-content">
                                        <table className="ui-table-element ui-table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="ui-table-header-cell">Transfer No</th>
                                                    <th className="ui-table-header-cell">Date</th>
                                                    <th className="ui-table-header-cell">From</th>
                                                    <th className="ui-table-header-cell">To</th>
                                                    <th className="ui-table-header-cell text-right">Items</th>
                                                    <th className="ui-table-header-cell text-right">Value</th>
                                                    <th className="ui-table-header-cell">Created By</th>
                                                    <th className="ui-table-header-cell ui-table-empty-header-cell text-right">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {transfers.data.map((transfer) => (
                                                    <tr key={transfer.id} className="ui-table-row">
                                                        <td className="ui-table-cell font-medium">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{transfer.transfer_no}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-nowrap">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {format(parseISO(transfer.transfer_date), 'MMM d, yyyy')}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{transfer.source_outlet?.name ?? '-'}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    {transfer.destination_outlet?.name ?? '-'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{transfer.items_count ?? 0}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right font-medium tabular-nums">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{formatCurrency(transfer.total_value)}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{transfer.createdBy?.name ?? '-'}</div>
                                                            </div>
                                                        </td>

                                                        <td className="ui-table-cell text-right">
                                                            <div className="ui-table-actions">
                                                                <ViewAction
                                                                    url={show(transfer.id)}
                                                                    aria-label={`View transfer ${transfer.transfer_no}`}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {transfers.data.length === 0 && (
                                        <div className="ui-table-empty-state">
                                            <div className="ui-table-empty-state-content">
                                                {queryString.search || queryString.source_outlet_id || queryString.destination_outlet_id
                                                    ? 'No stock transfers found.'
                                                    : 'No stock transfers yet.'}
                                            </div>
                                        </div>
                                    )}
                                    <TablePagination paginator={transfers} only={reloadProps} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
