import OpeningStockController from '@/actions/App/Http/Controllers/OpeningStockController';
import OperationCreateForm from '@/pages/inventory/components/operation-create-form';
import type { OperationProduct } from '@/pages/inventory/components/operation-items-table';
import { index } from '@/routes/opening-stocks';
import type { Outlet } from '@/types';

export default function OpeningStocksCreate({
    outlets,
    products,
    selectedOutletId,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: OperationProduct[];
    selectedOutletId?: number | null;
}) {
    return (
        <OperationCreateForm
            kind="opening"
            outlets={outlets}
            products={products}
            initialOutletId={selectedOutletId}
            storeHref={OpeningStockController.store().url}
            indexHref={index().url}
        />
    );
}
