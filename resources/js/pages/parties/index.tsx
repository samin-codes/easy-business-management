import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import { EditAction, ViewAction } from '@/components/table-actions';
import { TablePagination } from '@/components/table-pagination';
import { TableSortButton } from '@/components/table-sort-button';
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

export default function PartiesIndex({ parties, queryString }: { parties: LengthAwarePagination<Party>; queryString: QueryString }) {
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

                            <div className="ui-table">
                                <div className="ui-table-main">
                                    <div className="ui-table-content">
                                        <table className="ui-table-element ui-table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="ui-table-header-cell">
                                                        <TableSortButton
                                                            label="Name"
                                                            href={
                                                                index({
                                                                    query: {
                                                                        search: queryString.search ?? undefined,
                                                                        sort: 'name',
                                                                        direction:
                                                                            queryString.sort === 'name' && queryString.direction === 'asc'
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
                                                    <th className="ui-table-header-cell">Party Type</th>
                                                    <th className="ui-table-header-cell">Mobile</th>
                                                    <th className="ui-table-header-cell">Status</th>
                                                    <th className="ui-table-header-cell ui-table-empty-header-cell text-right">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parties.data.map((party) => (
                                                    <tr key={party.id} className="ui-table-row">
                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
                                                                    <div className="font-medium">{party.name}</div>
                                                                    {party.trade_name && (
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {party.trade_name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{party.party_type_label ?? '-'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">{party.mobile ?? '-'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell">
                                                            <div className="ui-table-column">
                                                                <div className="ui-table-text">
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
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="ui-table-cell text-right">
                                                            <div className="ui-table-actions">
                                                                <ViewAction url={show(party.id)} aria-label={`View ${party.name}`} />
                                                                <EditAction url={edit(party.id)} aria-label={`Edit ${party.name}`} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {parties.data.length === 0 && (
                                        <div className="ui-table-empty-state">
                                            <div className="ui-table-empty-state-content">
                                                {queryString.search ? 'No parties found.' : 'No parties yet.'}
                                            </div>
                                        </div>
                                    )}
                                    <TablePagination paginator={parties} only={reloadProps} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
