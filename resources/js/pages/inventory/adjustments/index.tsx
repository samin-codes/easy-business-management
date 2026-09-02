import OperationIndexPage from '@/pages/inventory/components/operation-index-page';
import type { OperationListRecord } from '@/pages/inventory/components/operation-index-page';
import { create, index, show } from '@/routes/stock-adjustments';
import type { LengthAwarePagination, Outlet } from '@/types';

export default function AdjustmentsIndex({
    adjustments,
    outlets,
    queryString,
}: {
    adjustments: LengthAwarePagination<OperationListRecord>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: { search?: string | null; outlet_id?: number | null };
}) {
    return (
        <OperationIndexPage
            kind="adjustments"
            records={adjustments}
            outlets={outlets}
            queryString={queryString}
            indexHref={index().url}
            createHref={create().url}
            showHref={(id) => show(id).url}
        />
    );
}
