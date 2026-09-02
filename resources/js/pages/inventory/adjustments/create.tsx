import StockAdjustmentController from '@/actions/App/Http/Controllers/StockAdjustmentController';
import OperationCreateForm from '@/pages/inventory/components/operation-create-form';
import type { OperationProduct } from '@/pages/inventory/components/operation-items-table';
import { index } from '@/routes/stock-adjustments';
import type { Option, Outlet } from '@/types';

export default function AdjustmentsCreate({
    outlets,
    products,
    adjustmentReasons,
    selectedOutletId,
}: {
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    products: OperationProduct[];
    adjustmentTypes: Option[];
    adjustmentReasons: Array<Option & { types: Array<'in' | 'out'> }>;
    selectedOutletId?: number | null;
}) {
    return (
        <OperationCreateForm
            kind="adjustment"
            outlets={outlets}
            products={products}
            reasons={adjustmentReasons}
            initialOutletId={selectedOutletId}
            storeHref={StockAdjustmentController.store().url}
            indexHref={index().url}
        />
    );
}
