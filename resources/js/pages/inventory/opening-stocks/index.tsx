import OperationIndexPage from '@/pages/inventory/components/operation-index-page';
import type { OperationListRecord } from '@/pages/inventory/components/operation-index-page';
import { create, index, show } from '@/routes/opening-stocks';
import type { LengthAwarePagination, Outlet } from '@/types';

export default function OpeningStocksIndex({
    openingStocks,
    outlets,
    queryString,
}: {
    openingStocks: LengthAwarePagination<OperationListRecord>;
    outlets: Pick<Outlet, 'id' | 'name'>[];
    queryString: { search?: string | null; outlet_id?: number | null };
}) {
    return (
        <OperationIndexPage
            kind="opening"
            records={openingStocks}
            outlets={outlets}
            queryString={queryString}
            indexHref={index().url}
            createHref={create().url}
            showHref={(id) => show(id).url}
        />
    );
}
