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
import type { BreadcrumbItem, LengthAwarePagination, Outlet } from '@/types';
import InventoryNavigation from './inventory-navigation';

export type OperationListRecord = {
    id: number;
    number: string;
    date: string;
    outlet?: { id: number; name: string } | null;
    source_outlet?: { id: number; name: string } | null;
    destination_outlet?: { id: number; name: string } | null;
    type?: 'in' | 'out';
    type_label?: string;
    reason_label?: string;
    items_count: number;
    total_value: string;
    created_by?: { name: string } | null;
};

export default function OperationIndexPage({
    kind,
    records,
    outlets,
    queryString,
    indexHref,
    createHref,
    showHref,
}: {
    kind: 'opening' | 'adjustments' | 'transfers';
    records: LengthAwarePagination<OperationListRecord>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: {
        search?: string | null;
        outlet_id?: number | null;
        source_outlet_id?: number | null;
        destination_outlet_id?: number | null;
    };
    indexHref: string;
    createHref: string;
    showHref: (id: number) => string;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const title = kind === 'opening' ? 'Opening Stock' : kind === 'adjustments' ? 'Stock Adjustments' : 'Stock Transfers';
    const active = kind === 'opening' ? 'opening' : kind;
    const reload = (overrides: Record<string, string | number | undefined>) =>
        router.get(
            indexHref,
            { ...queryString, ...overrides, page: 1 },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: [
                    'records',
                    kind === 'opening' ? 'openingStocks' : kind === 'adjustments' ? 'adjustments' : 'transfers',
                    'queryString',
                ],
            },
        );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: indexHref },
        { title, href: indexHref },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <InventoryNavigation active={active} />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading title={title} />
                        <Button asChild>
                            <Link href={createHref}>
                                <Plus />
                                New {kind === 'transfers' ? 'Transfer' : kind === 'adjustments' ? 'Adjustment' : 'Opening Stock'}
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative min-w-64 flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                className="pl-9"
                                placeholder="Search document number..."
                                defaultValue={queryString.search ?? ''}
                                onChange={(event) => {
                                    window.clearTimeout(searchTimeout.current);
                                    const search = event.currentTarget.value.trim();
                                    searchTimeout.current = window.setTimeout(() => reload({ search: search || undefined }), 300);
                                }}
                            />
                        </div>
                        {kind !== 'transfers' ? (
                            <Select
                                value={queryString.outlet_id?.toString() ?? 'all'}
                                onValueChange={(value) => reload({ outlet_id: value === 'all' ? undefined : Number(value) })}
                            >
                                <SelectTrigger className="w-full lg:w-56">
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
                        ) : (
                            <>
                                <Select
                                    value={queryString.source_outlet_id?.toString() ?? 'all'}
                                    onValueChange={(value) => reload({ source_outlet_id: value === 'all' ? undefined : Number(value) })}
                                >
                                    <SelectTrigger className="w-full lg:w-52">
                                        <SelectValue placeholder="All source outlets" />
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
                                        reload({ destination_outlet_id: value === 'all' ? undefined : Number(value) })
                                    }
                                >
                                    <SelectTrigger className="w-full lg:w-52">
                                        <SelectValue placeholder="All destinations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All destinations</SelectItem>
                                        {outlets.map((outlet) => (
                                            <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                {outlet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                    </div>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="table-hover table">
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Date</th>
                                    {kind === 'transfers' ? (
                                        <>
                                            <th>From</th>
                                            <th>To</th>
                                        </>
                                    ) : (
                                        <th>Outlet</th>
                                    )}
                                    {kind === 'adjustments' && (
                                        <>
                                            <th>Type</th>
                                            <th>Reason</th>
                                        </>
                                    )}
                                    <th className="text-right">Items</th>
                                    <th className="text-right">Value</th>
                                    <th>Created By</th>
                                    <th>
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.length ? (
                                    records.data.map((record) => (
                                        <tr key={record.id}>
                                            <td className="font-medium">{record.number}</td>
                                            <td>{format(parseISO(record.date), 'MMM d, yyyy')}</td>
                                            {kind === 'transfers' ? (
                                                <>
                                                    <td>{record.source_outlet?.name ?? '-'}</td>
                                                    <td>{record.destination_outlet?.name ?? '-'}</td>
                                                </>
                                            ) : (
                                                <td>{record.outlet?.name ?? '-'}</td>
                                            )}
                                            {kind === 'adjustments' && (
                                                <>
                                                    <td>
                                                        <Badge variant={record.type === 'in' ? 'default' : 'destructive'}>
                                                            {record.type_label ?? `Adjustment ${record.type === 'in' ? 'In' : 'Out'}`}
                                                        </Badge>
                                                    </td>
                                                    <td>{record.reason_label ?? '-'}</td>
                                                </>
                                            )}
                                            <td className="text-right tabular-nums">{record.items_count}</td>
                                            <td className="text-right font-medium tabular-nums">{formatCurrency(record.total_value)}</td>
                                            <td>{record.created_by?.name ?? '-'}</td>
                                            <td>
                                                <ViewAction url={showHref(record.id)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={kind === 'transfers' ? 9 : kind === 'adjustments' ? 10 : 7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No {title.toLowerCase()} records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {records.last_page > 1 && <PaginatorLinks links={records.links} />}
                </div>
            </div>
        </AppLayout>
    );
}
