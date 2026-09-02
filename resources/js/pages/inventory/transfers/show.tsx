import StockTransferController from '@/actions/App/Http/Controllers/StockTransferController';
import OperationShowPage from '@/pages/inventory/components/operation-show-page';
import type { OperationShowRecord } from '@/pages/inventory/components/operation-show-page';
import { index } from '@/routes/stock-transfers';

export default function TransfersShow({ transfer }: { transfer: OperationShowRecord }) {
    return (
        <OperationShowPage
            kind="transfers"
            record={transfer}
            indexHref={index().url}
            destroyHref={StockTransferController.destroy(transfer.id).url}
        />
    );
}
