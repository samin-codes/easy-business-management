import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Boxes, CircleDollarSign, Eye, PackageCheck, PackageX, Search } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { TableSortButton } from '@/components/table-sort-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index, show } from '@/routes/inventory';
import type { BreadcrumbItem, LengthAwarePagination } from '@/types';
import type { Category, Outlet, Stock } from './types';

type QueryString = {
    outlet_id: number | null;
    category_id: number | null;
    search: string | null;
    stock_status: 'all' | 'in_stock' | 'out_of_stock';
    sort: 'product' | 'quantity' | 'average_cost' | 'stock_value' | 'last_movement_at';
    direction: 'asc' | 'desc';
};

type InventoryIndexProps = {
    stocks: LengthAwarePagination<Stock>;
    summary: {
        inventory_value: string;
        in_stock_variants: number;
        out_of_stock_variants: number;
        total_variants: number;
    };
    outlets: Outlet[];
    categories: Category[];
    selectedOutlet: Outlet | null;
    queryString: QueryString;
};

const reloadProps = ['stocks', 'summary', 'selectedOutlet', 'queryString'];

export default function InventoryIndex({ stocks, summary, outlets, categories, selectedOutlet, queryString }: InventoryIndexProps) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const hasPages = stocks.last_page > 1;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: index().url },
        { title: 'Current Stock', href: index().url },
    ];

    const query = (overrides: Partial<QueryString> & { page?: number } = {}) => ({
        outlet_id: overrides.outlet_id ?? queryString.outlet_id ?? undefined,
        category_id: overrides.category_id === null ? undefined : (overrides.category_id ?? queryString.category_id ?? undefined),
        search: overrides.search === null ? undefined : (overrides.search ?? queryString.search ?? undefined),
        stock_status: overrides.stock_status ?? queryString.stock_status,
        sort: overrides.sort ?? queryString.sort,
        direction: overrides.direction ?? queryString.direction,
        page: overrides.page ?? 1,
    });

    const visit = (overrides: Partial<QueryString> & { page?: number } = {}) => {
        router.get(
            index({ query: query(overrides) }).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: reloadProps,
            },
        );
    };

    const summaryCards = [
        {
            label: 'Inventory Value',
            value: formatCurrency(summary.inventory_value),
            icon: CircleDollarSign,
            iconClassName: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        },
        {
            label: 'In-stock Variants',
            value: summary.in_stock_variants.toLocaleString(),
            icon: PackageCheck,
            iconClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        },
        {
            label: 'Out of Stock',
            value: summary.out_of_stock_variants.toLocaleString(),
            icon: PackageX,
            iconClassName: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        },
        {
            label: 'Total Variants',
            value: summary.total_variants.toLocaleString(),
            icon: Boxes,
            iconClassName: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading title="Inventory" description="Current stock is shown in each product's base unit." />

                        {outlets.length > 0 && (
                            <Select
                                value={selectedOutlet?.id.toString()}
                                onValueChange={(value) => visit({ outlet_id: Number(value), page: 1 })}
                            >
                                <SelectTrigger className="w-full sm:w-64">
                                    <SelectValue placeholder="Select outlet" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    {outlets.map((outlet) => (
                                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                            {outlet.name} ({outlet.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedOutlet === null ? (
                        <Card>
                            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                <Boxes className="size-10 text-muted-foreground" />
                                <div>
                                    <h2 className="font-semibold">No active outlet available</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add or activate an outlet from Business settings to view inventory.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {summaryCards.map((card) => (
                                    <Card key={card.label} className="gap-0 py-5">
                                        <CardContent className="flex items-center justify-between gap-4 px-5">
                                            <div className="min-w-0">
                                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                                <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{card.value}</p>
                                            </div>
                                            <div className={`rounded-lg p-2.5 ${card.iconClassName}`}>
                                                <card.icon className="size-5" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <section className="space-y-4">
                                <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_14rem_12rem_auto]">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search product, variant, brand or SKU..."
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

                                    <Select
                                        value={queryString.category_id?.toString() ?? 'all'}
                                        onValueChange={(value) => visit({ category_id: value === 'all' ? null : Number(value), page: 1 })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={queryString.stock_status}
                                        onValueChange={(value: QueryString['stock_status']) =>
                                            visit({ stock_status: value, page: 1 })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All stock statuses</SelectItem>
                                            <SelectItem value="in_stock">In stock</SelectItem>
                                            <SelectItem value="out_of_stock">Out of stock</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {(queryString.search || queryString.category_id || queryString.stock_status !== 'all') && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                visit({
                                                    search: null,
                                                    category_id: null,
                                                    stock_status: 'all',
                                                    page: 1,
                                                })
                                            }
                                        >
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
                                                        label="Product / Variant"
                                                        href={
                                                            index({
                                                                query: query({
                                                                    sort: 'product',
                                                                    direction:
                                                                        queryString.sort === 'product' && queryString.direction === 'asc'
                                                                            ? 'desc'
                                                                            : 'asc',
                                                                }),
                                                            }).url
                                                        }
                                                        isActive={queryString.sort === 'product'}
                                                        currentDirection={queryString.direction}
                                                        only={reloadProps}
                                                    />
                                                </th>
                                                <th>SKU</th>
                                                <th>Category</th>
                                                <th className="text-right">
                                                    <TableSortButton
                                                        label="On Hand"
                                                        href={
                                                            index({
                                                                query: query({
                                                                    sort: 'quantity',
                                                                    direction:
                                                                        queryString.sort === 'quantity' && queryString.direction === 'asc'
                                                                            ? 'desc'
                                                                            : 'asc',
                                                                }),
                                                            }).url
                                                        }
                                                        isActive={queryString.sort === 'quantity'}
                                                        currentDirection={queryString.direction}
                                                        align="right"
                                                        only={reloadProps}
                                                    />
                                                </th>
                                                <th className="text-right">
                                                    <TableSortButton
                                                        label="Avg. Cost"
                                                        href={
                                                            index({
                                                                query: query({
                                                                    sort: 'average_cost',
                                                                    direction:
                                                                        queryString.sort === 'average_cost' &&
                                                                        queryString.direction === 'asc'
                                                                            ? 'desc'
                                                                            : 'asc',
                                                                }),
                                                            }).url
                                                        }
                                                        isActive={queryString.sort === 'average_cost'}
                                                        currentDirection={queryString.direction}
                                                        align="right"
                                                        only={reloadProps}
                                                    />
                                                </th>
                                                <th className="text-right">
                                                    <TableSortButton
                                                        label="Stock Value"
                                                        href={
                                                            index({
                                                                query: query({
                                                                    sort: 'stock_value',
                                                                    direction:
                                                                        queryString.sort === 'stock_value' &&
                                                                        queryString.direction === 'asc'
                                                                            ? 'desc'
                                                                            : 'asc',
                                                                }),
                                                            }).url
                                                        }
                                                        isActive={queryString.sort === 'stock_value'}
                                                        currentDirection={queryString.direction}
                                                        align="right"
                                                        only={reloadProps}
                                                    />
                                                </th>
                                                <th>
                                                    <TableSortButton
                                                        label="Last Movement"
                                                        href={
                                                            index({
                                                                query: query({
                                                                    sort: 'last_movement_at',
                                                                    direction:
                                                                        queryString.sort === 'last_movement_at' &&
                                                                        queryString.direction === 'desc'
                                                                            ? 'asc'
                                                                            : 'desc',
                                                                }),
                                                            }).url
                                                        }
                                                        isActive={queryString.sort === 'last_movement_at'}
                                                        currentDirection={queryString.direction}
                                                        only={reloadProps}
                                                    />
                                                </th>
                                                <th className="text-right">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stocks.data.length > 0 ? (
                                                stocks.data.map((stock) => {
                                                    const quantity = Number(stock.quantity);
                                                    const isActive = stock.status === 'active' && stock.product_status === 'active';

                                                    return (
                                                        <tr key={stock.id}>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    <div>
                                                                        <div className="font-medium">{stock.label}</div>
                                                                        {stock.brand_name && (
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {stock.brand_name}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {!isActive && <Badge variant="outline">Inactive</Badge>}
                                                                </div>
                                                            </td>
                                                            <td className="text-muted-foreground">{stock.sku || '-'}</td>
                                                            <td>{stock.category.name}</td>
                                                            <td className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span className="font-medium tabular-nums">
                                                                        {formatQuantity(stock.quantity)} {stock.base_unit.code}
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            quantity > 0
                                                                                ? 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                                                                : quantity < 0
                                                                                  ? 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                                                                                  : 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                                                        }
                                                                    >
                                                                        {quantity > 0 ? 'In stock' : quantity < 0 ? 'Negative' : 'Out'}
                                                                    </Badge>
                                                                </div>
                                                            </td>
                                                            <td className="text-right tabular-nums">
                                                                {formatCurrency(stock.average_cost)}
                                                                <span className="ml-1 text-xs text-muted-foreground">
                                                                    / {stock.base_unit.code}
                                                                </span>
                                                            </td>
                                                            <td className="text-right font-medium tabular-nums">
                                                                {formatCurrency(stock.stock_value)}
                                                            </td>
                                                            <td className="text-nowrap text-muted-foreground">
                                                                {stock.last_movement_at
                                                                    ? format(parseISO(stock.last_movement_at), 'MMM d, yyyy')
                                                                    : '-'}
                                                            </td>
                                                            <td className="text-right">
                                                                <Button variant="ghost" size="icon-sm" asChild>
                                                                    <Link
                                                                        href={show(stock.id, {
                                                                            query: {
                                                                                outlet_id: selectedOutlet.id,
                                                                            },
                                                                        })}
                                                                    >
                                                                        <Eye className="size-4" />
                                                                        <span className="sr-only">
                                                                            View stock history for {stock.label}
                                                                        </span>
                                                                    </Link>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} className="h-28 text-center text-muted-foreground">
                                                        No inventory items match the current filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {hasPages && (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                            {`Showing ${stocks.from}-${stocks.to} of ${stocks.total} variants`}
                                        </div>
                                        <PaginatorLinks
                                            links={stocks.links}
                                            only={reloadProps}
                                            className="mx-0 w-auto justify-start sm:justify-end"
                                        />
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
