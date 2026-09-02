import OperationIndexPage from '@/pages/inventory/components/operation-index-page';
import type { OperationListRecord } from '@/pages/inventory/components/operation-index-page';
import { create, index, show } from '@/routes/stock-transfers';
import type { LengthAwarePagination, Outlet } from '@/types';

export default function TransfersIndex({
    transfers,
    outlets,
    queryString,
}: {
    transfers: LengthAwarePagination<OperationListRecord>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: { search?: string | null; source_outlet_id?: number | null; destination_outlet_id?: number | null };
}) {
    return (
        <OperationIndexPage
            kind="transfers"
            records={transfers}
            outlets={outlets}
            queryString={queryString}
            indexHref={index().url}
            createHref={create().url}
            showHref={(id) => show(id).url}
        />
    );
}
