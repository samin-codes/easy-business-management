import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import { EditAction } from '@/components/table-actions';
import { TablePagination } from '@/components/table-pagination';
import { TableSortButton } from '@/components/table-sort-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index } from '@/routes/products';
import type { BreadcrumbItem, LengthAwarePagination, Product } from '@/types';

type QueryString = {
    search: string | null;
    sort: 'name' | 'created_at';
    direction: 'asc' | 'desc';
};

export default function ProductsIndex({ products, queryString }: { products: LengthAwarePagination<Product>; queryString: QueryString }) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['products', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: index().url },
        { title: 'List', href: index().url },
    ];

    const { flash, errors } = usePage<{
        flash: { status?: string };
        errors: Record<string, string>;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="mb-8 flex items-center justify-between">
                        <Heading title="Products" />
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Product
                            </Link>
                        </Button>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}

                    {errors.product && <AlertError errors={[errors.product]} title="Product deletion blocked." />}

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search products..."
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

                            <div className="ui-table">
                                <div className="ui-table-main">
                                    {products.data.length > 0 ? (
                                        <div className="ui-table-content">
                                            <table className="ui-table-element ui-table-hover ui-table-striped">
                                                <thead>
                                                    <tr>
                                                        <th
                                                            aria-sort={
                                                                queryString.sort === 'name'
                                                                    ? queryString.direction === 'asc'
                                                                        ? 'ascending'
                                                                        : 'descending'
                                                                    : undefined
                                                            }
                                                            className={
                                                                queryString.sort === 'name'
                                                                    ? 'ui-table-header-cell ui-table-header-cell-sorted'
                                                                    : 'ui-table-header-cell'
                                                            }
                                                        >
                                                            <TableSortButton
                                                                label="Name"
                                                                href={
                                                                    index({
                                                                        query: {
                                                                            search: queryString.search ?? undefined,
                                                                            sort: 'name',
                                                                            direction:
                                                                                queryString.sort === 'name' &&
                                                                                queryString.direction === 'asc'
                                                                                    ? 'desc'
                                                                                    : 'asc',
                                                                            page: 1,
                                                                        },
                                                                    }).url
                                                                }
                                                                isActive={queryString.sort === 'name'}
                                                                currentDirection={queryString.direction}
                                                                only={reloadProps}
                                                            />
                                                        </th>
                                                        <th className="ui-table-header-cell">Category</th>
                                                        <th className="ui-table-header-cell">Business</th>
                                                        <th className="ui-table-header-cell">Status</th>
                                                        <th className="ui-table-header-cell">Base Unit</th>
                                                        <th className="ui-table-header-cell ui-table-empty-header-cell w-px">
                                                            <span className="sr-only">Actions</span>
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {products.data.map((product) => (
                                                        <tr key={product.id} className="ui-table-row">
                                                            <td className="ui-table-cell font-medium">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">{product.name}</div>
                                                                </div>
                                                            </td>
                                                            <td className="ui-table-cell">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">{product.category?.name ?? '-'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="ui-table-cell">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">{product.business?.name ?? '-'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="ui-table-cell">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={
                                                                                product.status === 'active'
                                                                                    ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                                                    : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                                                                            }
                                                                        >
                                                                            {product.status_label ?? '-'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="ui-table-cell">
                                                                <div className="ui-table-column">
                                                                    <div className="ui-table-text">
                                                                        {product.base_unit_of_measurement?.name ?? '-'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="ui-table-cell w-px whitespace-nowrap">
                                                                <div className="ui-table-actions">
                                                                    <EditAction
                                                                        url={edit(product.id)}
                                                                        aria-label={`Edit ${product.name}`}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="ui-table-empty-state">
                                            <div className="ui-table-empty-state-content">
                                                {queryString.search ? 'No products found.' : 'No products yet.'}
                                            </div>
                                        </div>
                                    )}

                                    <TablePagination paginator={products} only={reloadProps} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
