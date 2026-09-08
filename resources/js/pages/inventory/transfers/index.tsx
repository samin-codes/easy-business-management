import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { ViewAction } from '@/components/table-actions';
import { TableHead } from '@/components/table-head';
import { TablePagination } from '@/components/table-pagination';
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
import { create, index, show } from '@/routes/stock-transfers';
import type {
    BreadcrumbItem,
    LengthAwarePagination,
    Outlet,
    StockTransfer,
} from '@/types';
import Navigation from '../components/navigation';

type QueryString = {
    search: string | null;
    source_outlet_id: number | null;
    destination_outlet_id: number | null;
};

type Props = {
    transfers: LengthAwarePagination<StockTransfer>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: QueryString;
};

const reloadProps = ['transfers', 'queryString'];

export default function Index({
    transfers,
    outlets,
    queryString,
}: Props) {
    const searchTimeout = useRef<number | undefined>(undefined);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: inventoryIndex().url },
        { title: 'Stock Transfers', href: index().url },
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
            <Head title="Stock Transfers" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Navigation active="transfers" />

                    <div className="flex items-start justify-between gap-4">
                        <Heading title="Stock Transfers" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Transfer
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[25rem_14rem_14rem]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    placeholder="Search transfer no..."
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
                                    queryString.source_outlet_id?.toString() ??
                                    'all'
                                }
                                onValueChange={(value) =>
                                    visit({
                                        source_outlet_id:
                                            value === 'all'
                                                ? null
                                                : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    aria-label="From outlet"
                                >
                                    <SelectValue placeholder="All sources" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All source outlets
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

                            <Select
                                value={
                                    queryString.destination_outlet_id?.toString() ??
                                    'all'
                                }
                                onValueChange={(value) =>
                                    visit({
                                        destination_outlet_id:
                                            value === 'all'
                                                ? null
                                                : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    aria-label="To outlet"
                                >
                                    <SelectValue placeholder="All destinations" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All destination outlets
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
                                                    Transfer No
                                                </TableHead>

                                                <TableHead>Date</TableHead>

                                                <TableHead>From</TableHead>

                                                <TableHead>To</TableHead>

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
                                            {transfers.data.map((transfer) => (
                                                <tr
                                                    key={transfer.id}
                                                    className="ui-table-row"
                                                >
                                                    <td className="ui-table-cell font-medium">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {
                                                                    transfer.transfer_no
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-nowrap">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {format(
                                                                    parseISO(
                                                                        transfer.transfer_date,
                                                                    ),
                                                                    'MMM d, yyyy',
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {transfer
                                                                    .source_outlet
                                                                    ?.name ??
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {transfer
                                                                    .destination_outlet
                                                                    ?.name ??
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {transfer.items_count ??
                                                                    0}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right font-medium tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    transfer.total_value,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {transfer
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
                                                                    transfer.id,
                                                                )}
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
                                            {queryString.search ||
                                            queryString.source_outlet_id ||
                                            queryString.destination_outlet_id
                                                ? 'No stock transfers found.'
                                                : 'No stock transfers yet.'}
                                        </div>
                                    </div>
                                )}

                                <TablePagination
                                    paginator={transfers}
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
