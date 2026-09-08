import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    CircleCheck,
    Clock,
    Plus,
    Search,
    ShoppingCart,
    Wallet,
} from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { ViewAction } from '@/components/table-actions';
import { TableHead } from '@/components/table-head';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, getSortQuery } from '@/lib/utils';
import { create, index, show } from '@/routes/purchases';
import type {
    BreadcrumbItem,
    LengthAwarePagination,
    Outlet,
    Party,
    Purchase,
    PurchasePaymentStatus,
} from '@/types';

type QueryString = {
    outlet_id: number | null;
    supplier_id: number | null;
    payment_status: PurchasePaymentStatus | null;
    date_from: string | null;
    date_to: string | null;
    search: string | null;
    sort:
        | 'purchase_no'
        | 'purchase_date'
        | 'total_amount'
        | 'paid_amount'
        | 'due_amount';
    direction: 'asc' | 'desc';
};

type Props = {
    purchases: LengthAwarePagination<Purchase>;
    purchaseStats: {
        purchase_count: number;
        total_amount: string;
        paid_amount: string;
        due_amount: string;
    };
    outlets: Pick<Outlet, 'id' | 'name' | 'code' | 'status'>[];
    suppliers: Pick<Party, 'id' | 'name'>[];
    paymentStatuses: {
        label: string;
        value: PurchasePaymentStatus;
    }[];
    queryString: QueryString;
};

const reloadProps = ['purchases', 'purchaseStats', 'queryString'];

export default function Index({
    purchases,
    purchaseStats,
    outlets,
    suppliers,
    paymentStatuses,
    queryString,
}: Props) {
    const searchTimeout = useRef<number | undefined>(undefined);

    const dateFrom = queryString.date_from
        ? parseISO(queryString.date_from)
        : undefined;

    const dateTo = queryString.date_to
        ? parseISO(queryString.date_to)
        : undefined;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchases', href: index().url },
        { title: 'List', href: index().url },
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
            <Head title="Purchases" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <Heading title="Purchases" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Purchase
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Card className="min-w-0 gap-0 py-0">
                            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <ShoppingCart
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Purchases
                                    </p>

                                    <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                        {purchaseStats.purchase_count.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 gap-0 py-0">
                            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <Wallet
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Amount
                                    </p>

                                    <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                        {formatCurrency(
                                            purchaseStats.total_amount,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 gap-0 py-0">
                            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <CircleCheck
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Paid
                                    </p>

                                    <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                        {formatCurrency(
                                            purchaseStats.paid_amount,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 gap-0 py-0">
                            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <Clock
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Due
                                    </p>

                                    <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                        {formatCurrency(
                                            purchaseStats.due_amount,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[minmax(20rem,25rem)_14rem_14rem_13rem]">
                            <div className="relative">
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
                                            visit({
                                                search: search || null,
                                            });
                                        }, 300);
                                    }}
                                />
                            </div>

                            <Select
                                value={queryString.outlet_id?.toString() ?? 'all'}
                                onValueChange={(value) =>
                                    visit({
                                        outlet_id: value === 'all' ? null : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All outlets" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">All outlets</SelectItem>

                                    {outlets.map((outlet) => (
                                        <SelectItem
                                            key={outlet.id}
                                            value={outlet.id.toString()}
                                        >
                                            {outlet.name}
                                            {outlet.code ? ` (${outlet.code})` : ''}
                                            {outlet.status === 'inactive'
                                                ? ' — Inactive'
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={queryString.supplier_id?.toString() ?? 'all'}
                                onValueChange={(value) =>
                                    visit({
                                        supplier_id: value === 'all' ? null : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All suppliers" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">All suppliers</SelectItem>

                                    {suppliers.map((supplier) => (
                                        <SelectItem
                                            key={supplier.id}
                                            value={supplier.id.toString()}
                                        >
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={queryString.payment_status ?? 'all'}
                                onValueChange={(value) =>
                                    visit({
                                        payment_status:
                                            value === 'all'
                                                ? null
                                                : (value as PurchasePaymentStatus),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Payment status" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All payment statuses
                                    </SelectItem>

                                    {paymentStatuses.map((status) => (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:w-100">
                            <DatePicker
                                id="purchase-date-from"
                                aria-label="Purchase date from"
                                value={dateFrom}
                                placeholder="From date"
                                disabledDays={dateTo ? { after: dateTo } : undefined}
                                onChange={(date) =>
                                    visit({
                                        date_from: date
                                            ? format(date, 'yyyy-MM-dd')
                                            : null,
                                    })
                                }
                            />

                            <DatePicker
                                id="purchase-date-to"
                                aria-label="Purchase date to"
                                value={dateTo}
                                placeholder="To date"
                                disabledDays={dateFrom ? { before: dateFrom } : undefined}
                                onChange={(date) =>
                                    visit({
                                        date_to: date
                                            ? format(date, 'yyyy-MM-dd')
                                            : null,
                                    })
                                }
                            />
                        </div>

                        <div className="ui-table">
                            <div className="ui-table-main">
                                <div className="ui-table-content">
                                    <table className="ui-table-element ui-table-hover">
                                        <thead>
                                            <tr>
                                                <TableHead
                                                    sortable
                                                    href={
                                                        index({
                                                            query: getSortQuery(
                                                                queryString,
                                                                'purchase_no',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort === 'purchase_no'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    only={reloadProps}
                                                >
                                                    Purchase No
                                                </TableHead>

                                                <TableHead
                                                    sortable
                                                    href={
                                                        index({
                                                            query: getSortQuery(
                                                                queryString,
                                                                'purchase_date',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort === 'purchase_date'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    only={reloadProps}
                                                >
                                                    Date
                                                </TableHead>

                                                <TableHead>Supplier</TableHead>

                                                <TableHead>Outlet</TableHead>

                                                <TableHead
                                                    sortable
                                                    href={
                                                        index({
                                                            query: getSortQuery(
                                                                queryString,
                                                                'total_amount',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort === 'total_amount'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    align="end"
                                                    only={reloadProps}
                                                >
                                                    Total
                                                </TableHead>

                                                <TableHead
                                                    sortable
                                                    href={
                                                        index({
                                                            query: getSortQuery(
                                                                queryString,
                                                                'paid_amount',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort === 'paid_amount'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    align="end"
                                                    only={reloadProps}
                                                >
                                                    Paid
                                                </TableHead>

                                                <TableHead
                                                    sortable
                                                    href={
                                                        index({
                                                            query: getSortQuery(
                                                                queryString,
                                                                'due_amount',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort === 'due_amount'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    align="end"
                                                    only={reloadProps}
                                                >
                                                    Due
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    Payment Status
                                                </TableHead>

                                                <TableHead>Created By</TableHead>

                                                <TableHead className="ui-table-empty-header-cell text-right">
                                                    <span className="sr-only">
                                                        Actions
                                                    </span>
                                                </TableHead>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {purchases.data.map((purchase) => (
                                                <tr
                                                    key={purchase.id}
                                                    className="ui-table-row"
                                                >
                                                    <td className="ui-table-cell font-medium">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {purchase.purchase_no}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-nowrap">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {format(
                                                                    parseISO(
                                                                        purchase.purchase_date,
                                                                    ),
                                                                    'MMM d, yyyy',
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {purchase.supplier?.name ?? '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {purchase.outlet?.name ?? '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    purchase.total_amount,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    purchase.paid_amount,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    purchase.due_amount,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-center">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        purchase.payment_status ===
                                                                        'paid'
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
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {purchase.createdBy?.name ?? '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right">
                                                        <div className="ui-table-actions">
                                                            <ViewAction
                                                                url={show(purchase.id)}
                                                                aria-label={`View purchase ${purchase.purchase_no}`}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {purchases.data.length === 0 && (
                                    <div className="ui-table-empty-state">
                                        <div className="ui-table-empty-state-content">
                                            {queryString.search ||
                                            queryString.outlet_id ||
                                            queryString.supplier_id ||
                                            queryString.payment_status ||
                                            queryString.date_from ||
                                            queryString.date_to
                                                ? 'No purchases found.'
                                                : 'No purchases yet.'}
                                        </div>
                                    </div>
                                )}

                                <TablePagination
                                    paginator={purchases}
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
