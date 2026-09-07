import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Boxes, PackageCheck, PackageX, Search, Wallet } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { ViewAction } from '@/components/table-actions';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatQuantity, getSortQuery } from '@/lib/utils';
import { index as invoiceIndex, show as invoiceShow } from '@/routes/inventory';
import { create as createOpeningStock } from '@/routes/opening-stocks';
import { create as createAdjustment } from '@/routes/stock-adjustments';
import { create as createTransfer } from '@/routes/stock-transfers';
import type { BreadcrumbItem, LengthAwarePagination, Outlet, ProductCategory, RecordStatus, UnitOfMeasurement } from '@/types';
import { TableHead } from '@/components/table-head';
import Navigation from './components/navigation';

type InventoryItem = {
    id: number;
    product_id: number;
    product_name: string;
    variant_name: string;
    label: string;
    sku: string | null;
    brand_name: string | null;
    is_placeholder_variant: boolean;
    status: RecordStatus;
    product_status: RecordStatus;
    category: Pick<ProductCategory, 'id' | 'name'>;
    base_unit: Pick<UnitOfMeasurement, 'id' | 'name' | 'code'>;
    quantity: string;
    average_cost: string;
    stock_value: string;
    last_movement_at: string | null;
};

type QueryString = {
    outlet_id: number | null;
    category_id: number | null;
    search: string | null;
    stock_status: 'all' | 'in_stock' | 'out_of_stock';
    sort: 'product' | 'quantity' | 'average_cost' | 'stock_value' | 'last_movement_at';
    direction: 'asc' | 'desc';
};

type Props = {
    stocks: LengthAwarePagination<InventoryItem>;
    inventoryStats: {
        stock_value: string;
        in_stock_count: number;
        out_of_stock_count: number;
        variant_count: number;
    };
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    categories: Pick<ProductCategory, 'id' | 'name'>[];
    selectedOutlet: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    queryString: QueryString;
};

const reloadProps = ['stocks', 'inventoryStats', 'selectedOutlet', 'queryString'];

export default function Index({ stocks, inventoryStats, outlets, categories, selectedOutlet, queryString }: Props) {

    const searchTimeout = useRef<number | undefined>(undefined);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventory', href: invoiceIndex().url },
        { title: 'Current Stock', href: invoiceIndex().url },
    ];

    const visit = (overrides: Partial<QueryString> & { page?: number } = {}) => {
        router.visit(
            invoiceIndex({ query: { ...queryString, page: 1, ...overrides } }),
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
            <Head title="Inventory" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Navigation active="stock" />

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <Heading title="Inventory" />

                        <div className="flex flex-wrap items-center gap-2">
                            {outlets.length > 0 && (
                                <Select
                                    value={selectedOutlet?.id.toString()}
                                    onValueChange={(value) =>
                                        visit({
                                            outlet_id: Number(value),
                                            page: 1,
                                        })
                                    }
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

                            {selectedOutlet && (
                                <>
                                    <Button variant="outline" size="sm" className="h-9" asChild>
                                        <Link href={createOpeningStock({ query: { outlet_id: selectedOutlet.id } })}>
                                            Opening stock
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9" asChild>
                                        <Link href={createAdjustment({ query: { outlet_id: selectedOutlet.id } })}>
                                            Adjustment
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9" asChild>
                                        <Link href={createTransfer({ query: { outlet_id: selectedOutlet.id } })}>
                                            Transfer
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
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
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <Card className="min-w-0 gap-0 py-0">
                                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Wallet aria-hidden="true" className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                                            <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                                {formatCurrency(inventoryStats.stock_value)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="min-w-0 gap-0 py-0">
                                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <PackageCheck aria-hidden="true" className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                                            <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                                {inventoryStats.in_stock_count.toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="min-w-0 gap-0 py-0">
                                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <PackageX aria-hidden="true" className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                                            <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                                {inventoryStats.out_of_stock_count.toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="min-w-0 gap-0 py-0">
                                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Boxes aria-hidden="true" className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-muted-foreground">Variants</p>
                                            <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                                                {inventoryStats.variant_count.toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <section className="space-y-3">
                                <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_14rem_12rem_auto]">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            type="search"
                                            placeholder="Search inventory..."
                                            className="pl-9"
                                            defaultValue={queryString.search ?? ''}
                                            onChange={(event) => {
                                                const search = event.currentTarget.value.trim();

                                                window.clearTimeout(searchTimeout.current);

                                                searchTimeout.current = window.setTimeout(() => {
                                                    visit({
                                                        search: search || null,
                                                        page: 1,
                                                    });
                                                }, 300);
                                            }}
                                        />
                                    </div>

                                    <Select
                                        value={queryString.category_id?.toString() ?? 'all'}
                                        onValueChange={(value) =>
                                            visit({
                                                category_id: value === 'all' ? null : Number(value),
                                                page: 1,
                                            })
                                        }
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
                                            visit({
                                                stock_status: value,
                                                page: 1,
                                            })
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

                                <div className="ui-table">
                                    <div className="ui-table-main">
                                        <div className="ui-table-content">
                                            <table className="ui-table-element ui-table-hover">
                                                <thead>
                                                    <tr>
                                                        <TableHead
                                                            sortable
                                                            href={invoiceIndex({
                                                                query: getSortQuery(queryString, 'product'),
                                                            }).url}
                                                            direction={queryString.sort === 'product' ? queryString.direction : undefined}
                                                            only={reloadProps}
                                                        >
                                                            Product
                                                        </TableHead>

                                                        <TableHead>Category</TableHead>

                                                        <TableHead
                                                            sortable
                                                            href={invoiceIndex({
                                                                query: getSortQuery(queryString, 'quantity'),
                                                            }).url}
                                                            direction={queryString.sort === 'quantity' ? queryString.direction : undefined}
                                                            align="end"
                                                            only={reloadProps}
                                                        >
                                                            On Hand
                                                        </TableHead>

                                                        <TableHead
                                                            sortable
                                                            href={invoiceIndex({
                                                                query: getSortQuery(queryString, 'average_cost'),
                                                            }).url}
                                                            direction={queryString.sort === 'average_cost' ? queryString.direction : undefined}
                                                            align="end"
                                                            only={reloadProps}
                                                        >
                                                            Avg. Cost
                                                        </TableHead>

                                                        <TableHead
                                                            sortable
                                                            href={invoiceIndex({
                                                                query: getSortQuery(queryString, 'stock_value'),
                                                            }).url}
                                                            direction={queryString.sort === 'stock_value' ? queryString.direction : undefined}
                                                            align="end"
                                                            only={reloadProps}
                                                        >
                                                            Stock Value
                                                        </TableHead>

                                                        <TableHead
                                                            sortable
                                                            href={invoiceIndex({
                                                                query: getSortQuery(queryString, 'last_movement_at'),
                                                            }).url}
                                                            direction={
                                                                queryString.sort === 'last_movement_at' ? queryString.direction : undefined
                                                            }
                                                            only={reloadProps}
                                                        >
                                                            Last Movement
                                                        </TableHead>

                                                        <TableHead className="ui-table-empty-header-cell text-right">
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {stocks.data.map((stock) => {
                                                        const quantity = Number(stock.quantity);

                                                        const isActive = stock.status === 'active' && stock.product_status === 'active';

                                                        return (
                                                            <tr key={stock.id} className="ui-table-row">
                                                                <td className="ui-table-cell min-w-56 max-w-80">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text min-w-0 whitespace-normal">
                                                                            <div className="flex items-start gap-2">
                                                                                <div className="min-w-0">
                                                                                    <div className="font-medium wrap-anywhere">
                                                                                        {stock.label}
                                                                                    </div>

                                                                                    {(stock.brand_name || stock.sku) && (
                                                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                                                            {[stock.brand_name, stock.sku]
                                                                                                .filter(Boolean)
                                                                                                .join(' • ')}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {!isActive && (
                                                                                    <Badge variant="outline" className="shrink-0">
                                                                                        Inactive
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">{stock.category.name}</div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
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
                                                                                    {quantity > 0
                                                                                        ? 'In stock'
                                                                                        : quantity < 0
                                                                                          ? 'Negative'
                                                                                          : 'Out'}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right tabular-nums">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {formatCurrency(stock.average_cost)}

                                                                            <span className="ml-1 text-xs text-muted-foreground">
                                                                                / {stock.base_unit.code}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right font-medium tabular-nums">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {formatCurrency(stock.stock_value)}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-nowrap text-muted-foreground">
                                                                    <div className="ui-table-column">
                                                                        <div className="ui-table-text">
                                                                            {stock.last_movement_at
                                                                                ? format(parseISO(stock.last_movement_at), 'MMM d, yyyy')
                                                                                : '-'}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="ui-table-cell text-right">
                                                                    <div className="ui-table-actions">
                                                                        <ViewAction
                                                                            url={invoiceShow(stock.id, {
                                                                                query: {
                                                                                    outlet_id: selectedOutlet.id,
                                                                                },
                                                                            })}
                                                                            aria-label={`View stock history for ${stock.label}`}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {stocks.data.length === 0 && (
                                            <div className="ui-table-empty-state">
                                                <div className="ui-table-empty-state-content">
                                                    {queryString.search || queryString.category_id || queryString.stock_status !== 'all'
                                                        ? 'No inventory items match the current filters.'
                                                        : 'No inventory records are available for this outlet.'}
                                                </div>
                                            </div>
                                        )}
                                        <TablePagination paginator={stocks} only={reloadProps} />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
