import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Boxes, PackageOpen, Plus, Repeat2, Search } from 'lucide-react';
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
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { index, show } from '@/routes/inventory';
import { create as createOpeningStock } from '@/routes/opening-stocks';
import { create as createAdjustment } from '@/routes/stock-adjustments';
import { create as createTransfer } from '@/routes/stock-transfers';
import type { BreadcrumbItem, LengthAwarePagination, Outlet, ProductCategory, RecordStatus, UnitOfMeasurement } from '@/types';
import InventoryNavigation from './components/inventory-navigation';

type InventoryOutlet = Pick<Outlet, 'id' | 'name' | 'code'>;

type InventoryCategory = Pick<ProductCategory, 'id' | 'name'>;

type InventoryUnit = Pick<UnitOfMeasurement, 'id' | 'name' | 'code'>;

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
    category: InventoryCategory;
    base_unit: InventoryUnit;
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

type InventoryIndexProps = {
    stocks: LengthAwarePagination<InventoryItem>;
    inventoryStats: {
        stock_value: string;
        in_stock_count: number;
        out_of_stock_count: number;
        variant_count: number;
    };
    outlets: InventoryOutlet[];
    categories: InventoryCategory[];
    selectedOutlet: InventoryOutlet | null;
    queryString: QueryString;
};

const reloadProps = ['stocks', 'inventoryStats', 'selectedOutlet', 'queryString'];

export default function InventoryIndex({ stocks, inventoryStats, outlets, categories, selectedOutlet, queryString }: InventoryIndexProps) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <InventoryNavigation active="stock" />

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <Heading title="Inventory" />

                        <div className="flex flex-wrap gap-2 lg:justify-end">
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
                                    <Button variant="outline" asChild>
                                        <Link href={createOpeningStock({ query: { outlet_id: selectedOutlet.id } })}>
                                            <PackageOpen /> Opening Stock
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={createAdjustment({ query: { outlet_id: selectedOutlet.id } })}>
                                            <Plus /> Adjustment
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={createTransfer({ query: { outlet_id: selectedOutlet.id } })}>
                                            <Repeat2 /> Transfer
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
                            <Card className="gap-0 py-0">
                                <CardContent className="grid grid-cols-2 p-0 lg:grid-cols-4">
                                    <div className="min-w-0 p-4 sm:p-5">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Inventory Value</p>
                                        <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                            {formatCurrency(inventoryStats.stock_value)}
                                        </p>
                                    </div>
                                    <div className="min-w-0 border-l p-4 sm:p-5">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">In Stock</p>
                                        <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                            {inventoryStats.in_stock_count.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="min-w-0 border-t p-4 sm:p-5 lg:border-t-0 lg:border-l">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Out of Stock</p>
                                        <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                            {inventoryStats.out_of_stock_count.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="min-w-0 border-t border-l p-4 sm:p-5 lg:border-t-0">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Variants</p>
                                        <p className="mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                                            {inventoryStats.variant_count.toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

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

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="table-hover table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <TableSortButton
                                                        label="Product"
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
                                                            <td className="max-w-80 min-w-56">
                                                                <div className="flex items-start gap-2">
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium break-words">{stock.label}</div>

                                                                        {(stock.brand_name || stock.sku) && (
                                                                            <div className="mt-0.5 text-xs text-muted-foreground">
                                                                                {[stock.brand_name, stock.sku].filter(Boolean).join(' • ')}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {!isActive && (
                                                                        <Badge variant="outline" className="shrink-0">
                                                                            Inactive
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>

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
                                                                <ViewAction
                                                                    url={show(stock.id, {
                                                                        query: {
                                                                            outlet_id: selectedOutlet.id,
                                                                        },
                                                                    })}
                                                                    aria-label={`View stock history for ${stock.label}`}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="h-28 text-center text-muted-foreground">
                                                        {queryString.search || queryString.category_id || queryString.stock_status !== 'all'
                                                            ? 'No inventory items match the current filters.'
                                                            : 'No inventory records are available for this outlet.'}
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
