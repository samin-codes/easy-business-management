import StockTransferController from '@/actions/App/Http/Controllers/StockTransferController';
import OperationCreateForm from '@/pages/inventory/components/operation-create-form';
import type { OperationProduct } from '@/pages/inventory/components/operation-items-table';
import { index } from '@/routes/stock-transfers';
import type { Outlet } from '@/types';

export default function TransfersCreate({
    outlets,
    products,
    selectedSourceOutletId,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: OperationProduct[];
    selectedSourceOutletId?: number | null;
}) {
    return (
        <OperationCreateForm
            kind="transfer"
            outlets={outlets}
            products={products}
            initialOutletId={selectedSourceOutletId}
            storeHref={StockTransferController.store().url}
            indexHref={index().url}
        />
    );
}
