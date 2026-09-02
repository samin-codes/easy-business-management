import StockAdjustmentController from '@/actions/App/Http/Controllers/StockAdjustmentController';
import OperationShowPage from '@/pages/inventory/components/operation-show-page';
import type { OperationShowRecord } from '@/pages/inventory/components/operation-show-page';
import { index } from '@/routes/stock-adjustments';

export default function AdjustmentsShow({ adjustment }: { adjustment: OperationShowRecord }) {
    return (
        <OperationShowPage
            kind="adjustments"
            record={adjustment}
            indexHref={index().url}
            destroyHref={StockAdjustmentController.destroy(adjustment.id).url}
        />
    );
}
