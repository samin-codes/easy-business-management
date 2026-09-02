import OpeningStockController from '@/actions/App/Http/Controllers/OpeningStockController';
import OperationShowPage from '@/pages/inventory/components/operation-show-page';
import type { OperationShowRecord } from '@/pages/inventory/components/operation-show-page';
import { index } from '@/routes/opening-stocks';

export default function OpeningStocksShow({ openingStock }: { openingStock: OperationShowRecord }) {
    return (
        <OperationShowPage
            kind="opening"
            record={openingStock}
            indexHref={index().url}
            destroyHref={OpeningStockController.destroy(openingStock.id).url}
        />
    );
}
