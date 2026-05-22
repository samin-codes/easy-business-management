import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, SquarePen } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { TableSortButton } from '@/components/table-sort-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index } from '@/routes/product-categories';
import type { BreadcrumbItem, LengthAwarePagination } from '@/types';
import type { ProductCategory } from './types';

type QueryString = {
    search: string | null;
    sort: 'name' | 'created_at';
    direction: 'asc' | 'desc';
};

export default function ProductCategoriesIndex({
    productCategories,
    queryString,
}: {
    productCategories: LengthAwarePagination<ProductCategory>;
    queryString: QueryString;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['productCategories', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Categories', href: index().url },
        { title: 'List', href: index().url },
    ];

    const { flash } = usePage<{
        flash: { status?: string };
    }>().props;

    const hasPages = productCategories.last_page > 1;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Categories" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="mb-8 flex items-center justify-between">
                        <Heading title="Product Categories" />
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Category
                            </Link>
                        </Button>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search categories..."
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
                                            <th>Business</th>
                                            <th>Status</th>
                                            <th className="text-right">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productCategories.data.length > 0 ? (
                                            productCategories.data.map((productCategory) => (
                                                <tr key={productCategory.id}>
                                                    <td>
                                                        <div className="font-medium">{productCategory.name}</div>
                                                    </td>
                                                    <td>{productCategory.business?.name ?? '-'}</td>
                                                    <td>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                productCategory.status === 'active'
                                                                    ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                                    : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                                                            }
                                                        >
                                                            {productCategory.status_label ?? '-'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <Button variant="ghost" size="icon-sm" asChild>
                                                                <Link href={edit(productCategory.id)}>
                                                                    <SquarePen className="size-4" />
                                                                    <span className="sr-only">Edit product category</span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    {queryString.search ? 'No product categories found.' : 'No product categories yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {hasPages && (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                        {`Showing ${productCategories.from}-${productCategories.to} of ${productCategories.total} categories`}
                                    </div>

                                    <PaginatorLinks
                                        links={productCategories.links}
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
