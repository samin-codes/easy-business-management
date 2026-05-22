import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, SquarePen } from 'lucide-react';
import { useRef } from 'react';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { TableSortButton } from '@/components/table-sort-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index } from '@/routes/products';
import type { BreadcrumbItem, LengthAwarePagination } from '@/types';
import type { Product } from './types';

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

    const hasPages = products.last_page > 1;

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

                            <div className="overflow-x-auto rounded-md border">
                                <table className="table-hover table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <TableSortButton
                                                    label="Name"
                                                    href={index({
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
                                                    }).url}
                                                    isActive={queryString.sort === 'name'}
                                                    currentDirection={queryString.direction}
                                                    only={reloadProps}
                                                />
                                            </th>
                                            <th>Category</th>
                                            <th>Business</th>
                                            <th>Status</th>
                                            <th>Base Unit</th>
                                            <th className="text-right">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.data.length > 0 ? (
                                            products.data.map((product) => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className="font-medium">{product.name}</div>
                                                    </td>
                                                    <td>{product.category.name}</td>
                                                    <td>{product.business.name}</td>
                                                    <td>
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
                                                    </td>
                                                    <td>{product.base_unit_of_measurement?.name ?? '-'}</td>
                                                    <td className="text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <Button variant="ghost" size="icon-sm" asChild>
                                                                <Link href={edit(product.id)}>
                                                                    <SquarePen className="size-4" />
                                                                    <span className="sr-only">Edit product</span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    {queryString.search ? 'No products found.' : 'No products yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {hasPages && (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                        {`Showing ${products.from}-${products.to} of ${products.total} products`}
                                    </div>

                                    <PaginatorLinks
                                        links={products.links}
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
