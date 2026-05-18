import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, Plus, Search, SquarePen } from 'lucide-react';
import { useRef } from 'react';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import PaginatorLinks from '@/components/paginator-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index, show } from '@/routes/parties';
import type { BreadcrumbItem, LengthAwarePagination, Party } from '@/types';

type QueryString = {
    search: string | null;
    sort: 'name' | 'created_at';
    direction: 'asc' | 'desc';
};

export default function PartiesIndex({
    parties,
    queryString,
}: {
    parties: LengthAwarePagination<Party>;
    queryString: QueryString;
}) {
    const searchTimeout = useRef<number | undefined>(undefined);
    const reloadProps = ['parties', 'queryString'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Parties', href: index().url },
        { title: 'List', href: index().url },
    ];

    const { flash, errors } = usePage<{
        flash: { status?: string };
        errors: Record<string, string>;
    }>().props;

    const nextNameDirection = queryString.sort === 'name' && queryString.direction === 'asc' ? 'desc' : 'asc';
    const hasPages = parties.last_page > 1;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parties" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="mb-8 flex items-center justify-between">
                        <Heading title="Parties" />
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New Party
                            </Link>
                        </Button>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {flash.status}
                        </div>
                    )}

                    {errors.party && <AlertError errors={[errors.party]} title="Party deletion blocked." />}

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search parties..."
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

                            <div className="overflow-hidden rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-transparent">
                                                <th className="h-10 px-4 text-left align-middle font-medium">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="-ml-3 h-8 px-3 font-medium"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={index({
                                                                query: {
                                                                    search: queryString.search ?? undefined,
                                                                    sort: 'name',
                                                                    direction: nextNameDirection,
                                                                    page: 1,
                                                                },
                                                            })}
                                                            preserveScroll
                                                            only={reloadProps}
                                                        >
                                                            Name
                                                            <span className="flex flex-col" aria-hidden="true">
                                                                <ChevronUp
                                                                    className={
                                                                        queryString.sort === 'name' &&
                                                                        queryString.direction === 'asc'
                                                                            ? 'size-3 text-primary'
                                                                            : 'size-3 text-muted-foreground'
                                                                    }
                                                                />
                                                                <ChevronDown
                                                                    className={
                                                                        queryString.sort === 'name' &&
                                                                        queryString.direction === 'desc'
                                                                            ? 'size-3 text-primary'
                                                                            : 'size-3 text-muted-foreground'
                                                                    }
                                                                />
                                                            </span>
                                                        </Link>
                                                    </Button>
                                                </th>
                                                <th className="h-10 px-4 text-left align-middle font-medium">
                                                    Party Type
                                                </th>
                                                <th className="h-10 px-4 text-left align-middle font-medium">Mobile</th>
                                                <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                                                <th className="h-10 px-4 text-right align-middle font-medium">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {parties.data.length > 0 ? (
                                                parties.data.map((party) => (
                                                    <tr
                                                        key={party.id}
                                                        className="border-b transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-3 align-middle">
                                                            <div className="font-medium">{party.name}</div>
                                                            {party.trade_name && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {party.trade_name}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 align-middle">
                                                            {party.party_type_label ?? '-'}
                                                        </td>
                                                        <td className="px-4 py-3 align-middle">
                                                            {party.mobile ?? '-'}
                                                        </td>
                                                        <td className="px-4 py-3 align-middle">
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    party.status === 'active'
                                                                        ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                                        : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                                                                }
                                                            >
                                                                {party.status_label ?? '-'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right align-middle">
                                                            <div className="flex justify-end gap-3">
                                                                <Button variant="ghost" size="icon-sm" asChild>
                                                                    <Link href={show(party.id)}>
                                                                        <Eye className="size-4" />
                                                                        <span className="sr-only">View party</span>
                                                                    </Link>
                                                                </Button>
                                                                <Button variant="ghost" size="icon-sm" asChild>
                                                                    <Link href={edit(party.id)}>
                                                                        <SquarePen className="size-4" />
                                                                        <span className="sr-only">Edit party</span>
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="h-24 px-4 text-center align-middle text-sm text-muted-foreground"
                                                    >
                                                        {queryString.search ? 'No parties found.' : 'No parties yet.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {hasPages && (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground sm:shrink-0 sm:whitespace-nowrap">
                                        {`Showing ${parties.from}-${parties.to} of ${parties.total} parties`}
                                    </div>

                                    <PaginatorLinks
                                        links={parties.links}
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
