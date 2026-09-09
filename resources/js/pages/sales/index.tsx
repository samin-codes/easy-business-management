import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    CircleCheck,
    Clock,
    Plus,
    Receipt,
    Search,
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
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, getSortQuery } from '@/lib/utils';
import { create, index, show } from '@/routes/sales';
import type {
    BreadcrumbItem,
    LengthAwarePagination,
    Outlet,
    Party,
    Sale,
    SalePaymentStatus,
} from '@/types';

type QueryString = {
    outlet_id: number | null;
    customer_id: number | null;
    payment_status: SalePaymentStatus | null;
    date_from: string | null;
    date_to: string | null;
    search: string | null;
    sort:
        | 'sale_no'
        | 'sale_date'
        | 'total_amount'
        | 'paid_amount'
        | 'due_amount';
    direction: 'asc' | 'desc';
};

type Props = {
    sales: LengthAwarePagination<Sale>;
    saleStats: {
        sale_count: number;
        total_amount: string;
        paid_amount: string;
        due_amount: string;
    };
    outlets: Pick<Outlet, 'id' | 'name' | 'code' | 'status'>[];
    customers: Pick<Party, 'id' | 'name'>[];
    paymentStatuses: {
        label: string;
        value: SalePaymentStatus;
    }[];
    queryString: QueryString;
};

const reloadProps = ['sales', 'saleStats', 'queryString'];

export default function Index({
    sales,
    saleStats,
    outlets,
    customers,
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
        { title: 'Sales', href: index().url },
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
            <Head title="Sales" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <Heading title="Sales" />

                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Sale
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Card className="min-w-0 gap-0 py-0">
                            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <Receipt
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Sales
                                    </p>

                                    <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                        {saleStats.sale_count.toLocaleString()}
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
                                            saleStats.total_amount,
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
                                            saleStats.paid_amount,
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
                                            saleStats.due_amount,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[25rem_14rem_14rem_13rem]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    placeholder="Search sale no..."
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
                                    queryString.outlet_id?.toString() ?? 'all'
                                }
                                onValueChange={(value) =>
                                    visit({
                                        outlet_id:
                                            value === 'all'
                                                ? null
                                                : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All outlets" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All outlets
                                    </SelectItem>

                                    {outlets.map((outlet) => (
                                        <SelectItem
                                            key={outlet.id}
                                            value={outlet.id.toString()}
                                        >
                                            {outlet.name}
                                            {outlet.code
                                                ? ` (${outlet.code})`
                                                : ''}
                                            {outlet.status === 'inactive'
                                                ? ' — Inactive'
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={
                                    queryString.customer_id?.toString() ??
                                    'all'
                                }
                                onValueChange={(value) =>
                                    visit({
                                        customer_id:
                                            value === 'all'
                                                ? null
                                                : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All customers" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All customers
                                    </SelectItem>

                                    {customers.map((customer) => (
                                        <SelectItem
                                            key={customer.id}
                                            value={customer.id.toString()}
                                        >
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={
                                    queryString.payment_status ?? 'all'
                                }
                                onValueChange={(value) =>
                                    visit({
                                        payment_status:
                                            value === 'all'
                                                ? null
                                                : (value as SalePaymentStatus),
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
                                id="sale-date-from"
                                aria-label="Sale date from"
                                value={dateFrom}
                                placeholder="From date"
                                disabledDays={
                                    dateTo
                                        ? { after: dateTo }
                                        : undefined
                                }
                                onChange={(date) =>
                                    visit({
                                        date_from: date
                                            ? format(date, 'yyyy-MM-dd')
                                            : null,
                                    })
                                }
                            />

                            <DatePicker
                                id="sale-date-to"
                                aria-label="Sale date to"
                                value={dateTo}
                                placeholder="To date"
                                disabledDays={
                                    dateFrom
                                        ? { before: dateFrom }
                                        : undefined
                                }
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
                                                                'sale_no',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort ===
                                                        'sale_no'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    only={reloadProps}
                                                >
                                                    Sale No
                                                </TableHead>

                                                <TableHead
                                                    sortable
                                                    href={
                                                        index({
                                                            query: getSortQuery(
                                                                queryString,
                                                                'sale_date',
                                                            ),
                                                        }).url
                                                    }
                                                    direction={
                                                        queryString.sort ===
                                                        'sale_date'
                                                            ? queryString.direction
                                                            : undefined
                                                    }
                                                    only={reloadProps}
                                                >
                                                    Date
                                                </TableHead>

                                                <TableHead>
                                                    Customer
                                                </TableHead>

                                                <TableHead>
                                                    Outlet
                                                </TableHead>

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
                                                        queryString.sort ===
                                                        'total_amount'
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
                                                        queryString.sort ===
                                                        'paid_amount'
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
                                                        queryString.sort ===
                                                        'due_amount'
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
                                            {sales.data.map((sale) => (
                                                <tr
                                                    key={sale.id}
                                                    className="ui-table-row"
                                                >
                                                    <td className="ui-table-cell font-medium">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {sale.sale_no}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-nowrap">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {format(
                                                                    parseISO(
                                                                        sale.sale_date,
                                                                    ),
                                                                    'MMM d, yyyy',
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {sale.customer
                                                                    ?.name ??
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {sale.outlet
                                                                    ?.name ??
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    sale.total_amount,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    sale.paid_amount,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right tabular-nums">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {formatCurrency(
                                                                    sale.due_amount,
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
                                                                        sale.payment_status ===
                                                                        'paid'
                                                                            ? 'border-transparent bg-emerald-100 text-emerald-800'
                                                                            : sale.payment_status ===
                                                                                'partial'
                                                                              ? 'border-transparent bg-amber-100 text-amber-800'
                                                                              : 'border-transparent bg-red-100 text-red-800'
                                                                    }
                                                                >
                                                                    {sale.payment_status_label ??
                                                                        sale.payment_status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell">
                                                        <div className="ui-table-column">
                                                            <div className="ui-table-text">
                                                                {sale.created_by
                                                                    ?.name ??
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="ui-table-cell text-right">
                                                        <div className="ui-table-actions">
                                                            <ViewAction
                                                                url={show(
                                                                    sale.id,
                                                                )}
                                                                aria-label={`View sale ${sale.sale_no}`}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {sales.data.length === 0 && (
                                    <div className="ui-table-empty-state">
                                        <div className="ui-table-empty-state-content">
                                            {queryString.search ||
                                            queryString.outlet_id ||
                                            queryString.customer_id ||
                                            queryString.payment_status ||
                                            queryString.date_from ||
                                            queryString.date_to
                                                ? 'No sales found.'
                                                : 'No sales yet.'}
                                        </div>
                                    </div>
                                )}

                                <TablePagination
                                    paginator={sales}
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
