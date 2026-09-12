import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import { DeleteAction, EditAction } from '@/components/table-actions';
import { TableHead } from '@/components/table-head';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { getSortQuery } from '@/lib/utils';
import { create, destroy, edit, index } from '@/routes/brands';
import type { Brand, BreadcrumbItem, LengthAwarePagination } from '@/types';
type QueryString = {
    page: number | null;
    search: string | null;
    sort: 'name';
    direction: 'asc' | 'desc';
};

const reloadProps = ['brands', 'queryString'];

export default function Index({ brands, queryString }: { brands: LengthAwarePagination<Brand>; queryString: QueryString }) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const { flash, errors } = usePage<{ flash: { status?: string }; errors: Record<string, string> }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Brands', href: index({ query: queryString }).url },
        { title: 'List', href: index({ query: queryString }).url },
    ];

    const handleDelete = (brand: Brand) => {
        if (!confirm(`Delete the brand "${brand.name}"?`)) {
            return;
        }

        router.delete(destroy(brand.id, { query: queryString }).url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brands" />
            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <Heading title="Brands" />
                        <Button asChild>
                            <Link href={create({ query: queryString })}>
                                <Plus />
                                New Brand
                            </Link>
                        </Button>
                    </div>
                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}
                    {errors.brand && <AlertError errors={[errors.brand]} title="Unable to delete brand" />}
                    <section className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    aria-label="Search brands"
                                    placeholder="Search brands..."
                                    className="pl-9"
                                    defaultValue={queryString.search ?? ''}
                                    onChange={(event) => {
                                        const search = event.currentTarget.value.trim();
                                        window.clearTimeout(searchTimeout.current);
                                        searchTimeout.current = window.setTimeout(() => {
                                            router.get(
                                                index().url,
                                                { ...queryString, search: search || undefined, page: 1 },
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
                                {brands.data.length > 0 ? (
                                    <div className="ui-table-content">
                                        <table className="ui-table-element ui-table-hover ui-table-striped">
                                            <thead>
                                                <tr>
                                                    <TableHead
                                                        sortable
                                                        href={index({ query: getSortQuery(queryString, 'name') }).url}
                                                        direction={queryString.direction}
                                                        only={reloadProps}
                                                    >
                                                        Name
                                                    </TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-px">
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {brands.data.map((brand) => (
                                                    <tr key={brand.id} className="ui-table-row">
                                                        <td className="ui-table-cell font-medium">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{brand.name}</div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            brand.status === 'active'
                                                                                ? 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                                                                : 'border-transparent bg-muted text-muted-foreground'
                                                                        }
                                                                    >
                                                                        {brand.status === 'active' ? 'Active' : 'Inactive'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell w-px whitespace-nowrap">
                                                            <div className="ui-table-actions">
                                                                <EditAction
                                                                    url={edit(brand.id, { query: queryString })}
                                                                    aria-label={`Edit ${brand.name}`}
                                                                />
                                                                <DeleteAction
                                                                    onClick={() => handleDelete(brand)}
                                                                    aria-label={`Delete ${brand.name}`}
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
                                            {queryString.search ? 'No brands found.' : 'No brands yet.'}
                                        </div>
                                    </div>
                                )}
                                <TablePagination paginator={brands} only={reloadProps} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
