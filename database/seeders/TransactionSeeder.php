<?php

namespace Database\Seeders;

use App\Enums\PaymentMethod;
use App\Enums\ProductStockLedgerTransactionType;
use App\Enums\PurchasePaymentStatus;
use App\Enums\PurchaseStatus;
use App\Enums\SalePaymentStatus;
use App\Enums\SaleStatus;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Party;
use App\Models\ProductStock;
use App\Models\ProductStockLedger;
use App\Models\ProductUnitConversion;
use App\Models\ProductVariant;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TransactionSeeder extends Seeder
{
    private const DATASET_NOTE_PREFIX = 'Demo dataset:';

    private Business $business;

    private User $admin;

    /** @var Collection<string, Outlet> */
    private Collection $outlets;

    /** @var Collection<string, Party> */
    private Collection $parties;

    /** @var Collection<string, ProductVariant> */
    private Collection $variants;

    /** @var Collection<string, ProductUnitConversion> */
    private Collection $conversions;

    public function run(): void
    {
        $this->loadReferences();

        DB::transaction(function (): void {
            $this->resetSeededTransactions();

            $events = collect([
                ...$this->openingEvents(),
                ...$this->purchaseEvents(),
                ...$this->movementEvents(),
                ...$this->saleEvents(),
            ])->sortBy(fn (array $event): string => $event['date'].'-'.match ($event['type']) {
                'opening' => '1',
                'purchase' => '2',
                'transfer', 'adjustment' => '3',
                'sale' => '4',
            });

            $purchaseIndex = 0;
            $saleIndex = 0;

            foreach ($events as $event) {
                match ($event['type']) {
                    'opening' => $this->createOpeningStock($event),
                    'purchase' => $this->createPurchase($event, ++$purchaseIndex),
                    'transfer' => $this->createTransfer($event),
                    'adjustment' => $this->createAdjustment($event),
                    'sale' => $this->createSale($event, ++$saleIndex),
                };
            }
        });
    }

    private function loadReferences(): void
    {
        $this->business = Business::current();
        $this->admin = User::query()->oldest('id')->firstOrFail();
        $this->outlets = Outlet::query()->whereBelongsTo($this->business)->whereIn('code', ['MAIN', 'WH01', 'UTR'])->get()->keyBy('code');
        $this->parties = Party::query()->whereBelongsTo($this->business)->get()->keyBy('name');
        $this->variants = ProductVariant::query()
            ->with('product:id,business_id,name,base_unit_of_measurement_id')
            ->whereHas('product', fn ($query) => $query->where('business_id', $this->business->id))
            ->get()
            ->keyBy('sku');
        $this->conversions = ProductUnitConversion::query()
            ->with('unitOfMeasurement:id,code')
            ->whereIn('product_id', $this->variants->pluck('product_id')->unique())
            ->get()
            ->keyBy(fn (ProductUnitConversion $conversion): string => $conversion->product_id.':'.$conversion->unitOfMeasurement->code);

        if ($this->outlets->count() !== 3 || $this->variants->count() < 31) {
            throw new RuntimeException('Transaction seeder references are incomplete. Run the prerequisite seeders first.');
        }
    }

    private function resetSeededTransactions(): void
    {
        $outletIds = $this->outlets->pluck('id');

        if (Purchase::query()->whereIn('outlet_id', $outletIds)->where(fn ($query) => $query
            ->whereNull('note')->orWhere('note', 'not like', self::DATASET_NOTE_PREFIX.'%'))->exists()) {
            throw new RuntimeException('A seeded outlet contains an unrelated purchase. Seeded transactions were not replaced.');
        }

        if (Sale::query()->whereIn('outlet_id', $outletIds)->where(fn ($query) => $query
            ->whereNull('note')->orWhere('note', 'not like', self::DATASET_NOTE_PREFIX.'%'))->exists()) {
            throw new RuntimeException('A seeded outlet contains an unrelated sale. Seeded transactions were not replaced.');
        }

        if (ProductStockLedger::query()->whereIn('outlet_id', $outletIds)->whereNull('source_type')
            ->where(fn ($query) => $query->whereNull('note')->orWhere('note', 'not like', self::DATASET_NOTE_PREFIX.'%'))->exists()) {
            throw new RuntimeException('A seeded outlet contains an unrelated manual stock movement. Seeded transactions were not replaced.');
        }

        $purchaseItemIds = PurchaseItem::query()
            ->whereHas('purchase', fn ($query) => $query->whereIn('outlet_id', $outletIds)->where('note', 'like', self::DATASET_NOTE_PREFIX.'%'))
            ->pluck('id');
        $saleItemIds = SaleItem::query()
            ->whereHas('sale', fn ($query) => $query->whereIn('outlet_id', $outletIds)->where('note', 'like', self::DATASET_NOTE_PREFIX.'%'))
            ->pluck('id');

        ProductStockLedger::query()->where('source_type', PurchaseItem::class)->whereIn('source_id', $purchaseItemIds)->delete();
        ProductStockLedger::query()->where('source_type', SaleItem::class)->whereIn('source_id', $saleItemIds)->delete();
        ProductStockLedger::query()->whereIn('outlet_id', $outletIds)->whereNull('source_type')->where('note', 'like', self::DATASET_NOTE_PREFIX.'%')->delete();
        Purchase::query()->whereIn('outlet_id', $outletIds)->where('note', 'like', self::DATASET_NOTE_PREFIX.'%')->delete();
        Sale::query()->whereIn('outlet_id', $outletIds)->where('note', 'like', self::DATASET_NOTE_PREFIX.'%')->delete();
        ProductStock::query()->whereIn('outlet_id', $outletIds)->delete();
    }

    private function createOpeningStock(array $event): void
    {
        $outlet = $this->outlet($event['outlet']);
        $variant = $this->variant($event['sku']);
        $conversion = $this->conversion($variant, $event['unit']);
        $baseQuantity = round($event['quantity'] * (float) $conversion->conversion_factor_to_base, 4);
        $baseUnitCost = round($event['unit_cost'] / (float) $conversion->conversion_factor_to_base, 6);
        $totalCost = round($baseQuantity * $baseUnitCost, 2);

        ProductStockLedger::query()->create([
            ...$this->ledgerIdentity($outlet, $variant, $event['date']),
            'transaction_type' => ProductStockLedgerTransactionType::OpeningStock,
            'quantity_in' => $event['quantity'], 'quantity_out' => 0,
            'unit_of_measurement_id' => $conversion->unit_of_measurement_id,
            'product_unit_conversion_id' => $conversion->id,
            'base_quantity' => $baseQuantity, 'unit_cost' => $event['unit_cost'], 'total_cost' => $totalCost,
            'note' => self::DATASET_NOTE_PREFIX.' Opening stock count on 1 May 2026.',
        ]);
        $this->updateStock($outlet, $variant, $baseQuantity, $totalCost, $event['date']);
    }

    private function createPurchase(array $event, int $index): void
    {
        $outlet = $this->outlet($event['outlet']);
        $items = collect($event['items'])->map(fn (array $item): array => $this->preparePurchaseItem($item));
        $subtotal = round($items->sum('line_total'), 2);
        $discount = $index % 3 === 0 ? 500 : ($index % 5 === 0 ? 250 : 0);
        $transport = $outlet->code === 'WH01' ? 900 : 350;
        $labour = $index % 2 === 0 ? 250 : 150;
        $other = $index % 7 === 0 ? 175 : 0;
        $total = round($subtotal + $transport + $labour + $other - $discount, 2);

        $purchase = Purchase::query()->create([
            'business_id' => $this->business->id, 'outlet_id' => $outlet->id,
            'supplier_party_id' => $this->party($event['party'])->id, 'created_by_id' => $this->admin->id,
            'purchase_no' => Purchase::generatePurchaseNumber($outlet->id, CarbonImmutable::parse($event['date'])),
            'purchase_date' => $event['date'], 'subtotal' => $subtotal, 'discount_amount' => $discount,
            'transport_cost' => $transport, 'labour_cost' => $labour, 'other_cost' => $other,
            'total_amount' => $total, 'paid_amount' => 0, 'due_amount' => $total,
            'payment_status' => PurchasePaymentStatus::Unpaid, 'status' => PurchaseStatus::Confirmed,
            'note' => self::DATASET_NOTE_PREFIX.' '.$event['note'],
        ]);

        foreach ($items as $item) {
            $variant = $this->variant($item['sku']);
            unset($item['sku']);
            $purchaseItem = $purchase->items()->create($item);
            $purchaseItem->productStockLedgers()->create([
                ...$this->ledgerIdentity($outlet, $variant, $event['date']),
                'transaction_type' => ProductStockLedgerTransactionType::Purchase,
                'quantity_in' => $purchaseItem->quantity, 'quantity_out' => 0,
                'unit_of_measurement_id' => $purchaseItem->unit_of_measurement_id,
                'product_unit_conversion_id' => $purchaseItem->product_unit_conversion_id,
                'base_quantity' => $purchaseItem->base_quantity, 'unit_cost' => $purchaseItem->unit_cost,
                'total_cost' => $purchaseItem->line_total, 'note' => $purchaseItem->note,
            ]);
            $this->updateStock($outlet, $variant, (float) $purchaseItem->base_quantity, (float) $purchaseItem->line_total, $event['date']);
        }

        $this->seedPurchasePayments($purchase, $index);
    }

    private function preparePurchaseItem(array $item): array
    {
        [$sku, $unit, $quantity, $unitCost] = $item;
        $variant = $this->variant($sku);
        $conversion = $this->conversion($variant, $unit);
        $factor = (float) $conversion->conversion_factor_to_base;

        return [
            'sku' => $sku, 'product_variant_id' => $variant->id,
            'unit_of_measurement_id' => $conversion->unit_of_measurement_id,
            'product_unit_conversion_id' => $conversion->id,
            'quantity' => round($quantity, 4), 'base_quantity' => round($quantity * $factor, 4),
            'unit_cost' => round($unitCost, 2), 'base_unit_cost' => round($unitCost / $factor, 6),
            'discount_amount' => 0, 'line_total' => round($quantity * $unitCost, 2),
            'note' => null,
        ];
    }

    private function createSale(array $event, int $index): void
    {
        $outlet = $this->outlet($event['outlet']);
        $preparedItems = collect($event['items'])->map(fn (array $item): array => $this->prepareSaleItem($outlet, $item));
        $subtotal = round($preparedItems->sum('line_total'), 2);
        $discount = $index % 4 === 0 ? min(350, round($subtotal * 0.03, 2)) : 0;
        $total = round($subtotal - $discount, 2);
        $sale = Sale::query()->create([
            'business_id' => $this->business->id, 'outlet_id' => $outlet->id,
            'customer_party_id' => $this->party($event['party'])->id, 'created_by_id' => $this->admin->id,
            'sale_no' => Sale::generateSaleNumber($outlet->id, CarbonImmutable::parse($event['date'])),
            'sale_date' => $event['date'], 'subtotal' => $subtotal, 'discount_amount' => $discount,
            'total_amount' => $total, 'paid_amount' => 0, 'due_amount' => $total,
            'payment_status' => SalePaymentStatus::Unpaid, 'status' => SaleStatus::Confirmed,
            'note' => self::DATASET_NOTE_PREFIX.' '.$event['note'],
        ]);

        foreach ($preparedItems as $item) {
            $variant = $this->variant($item['sku']);
            unset($item['sku']);
            $saleItem = $sale->items()->create($item);
            $saleItem->productStockLedgers()->create([
                ...$this->ledgerIdentity($outlet, $variant, $event['date']),
                'transaction_type' => ProductStockLedgerTransactionType::Sale,
                'quantity_in' => 0, 'quantity_out' => $saleItem->quantity,
                'unit_of_measurement_id' => $saleItem->unit_of_measurement_id,
                'product_unit_conversion_id' => $saleItem->product_unit_conversion_id,
                'base_quantity' => $saleItem->base_quantity, 'unit_cost' => $saleItem->inventory_unit_cost,
                'total_cost' => $saleItem->inventory_total_cost, 'note' => $saleItem->note,
            ]);
            $this->updateStock($outlet, $variant, -(float) $saleItem->base_quantity, -(float) $saleItem->inventory_total_cost, $event['date']);
        }
        $this->seedSalePayments($sale, $index);
    }

    private function prepareSaleItem(Outlet $outlet, array $item): array
    {
        [$sku, $unit, $quantity, $unitPrice] = $item;
        $variant = $this->variant($sku);
        $conversion = $this->conversion($variant, $unit);
        $factor = (float) $conversion->conversion_factor_to_base;
        $baseQuantity = round($quantity * $factor, 4);
        $stock = $this->stock($outlet, $variant);

        if ((float) $stock->quantity + 0.00005 < $baseQuantity) {
            throw new RuntimeException("Insufficient stock while seeding {$sku} at {$outlet->code}.");
        }

        $inventoryUnitCost = round((float) $stock->average_cost, 6);

        return [
            'sku' => $sku, 'product_variant_id' => $variant->id,
            'unit_of_measurement_id' => $conversion->unit_of_measurement_id,
            'product_unit_conversion_id' => $conversion->id,
            'quantity' => round($quantity, 4), 'base_quantity' => $baseQuantity,
            'unit_price' => round($unitPrice, 2), 'base_unit_price' => round($unitPrice / $factor, 6),
            'line_total' => round($quantity * $unitPrice, 2),
            'inventory_unit_cost' => $inventoryUnitCost,
            'inventory_total_cost' => round($baseQuantity * $inventoryUnitCost, 2),
            'note' => null,
        ];
    }

    private function createTransfer(array $event): void
    {
        $from = $this->outlet($event['from']);
        $to = $this->outlet($event['to']);
        $variant = $this->variant($event['sku']);
        $conversion = $this->baseConversion($variant);
        $stock = $this->stock($from, $variant);
        $quantity = round($event['quantity'], 4);
        $unitCost = round((float) $stock->average_cost, 6);
        $totalCost = round($quantity * $unitCost, 2);
        $note = self::DATASET_NOTE_PREFIX.' '.$event['note'];

        $this->createManualLedger($from, $variant, $conversion, ProductStockLedgerTransactionType::TransferOut, 0, $quantity, $quantity, $unitCost, $totalCost, $event['date'], $note);
        $this->updateStock($from, $variant, -$quantity, -$totalCost, $event['date']);
        $this->createManualLedger($to, $variant, $conversion, ProductStockLedgerTransactionType::TransferIn, $quantity, 0, $quantity, $unitCost, $totalCost, $event['date'], $note);
        $this->updateStock($to, $variant, $quantity, $totalCost, $event['date']);
    }

    private function createAdjustment(array $event): void
    {
        $outlet = $this->outlet($event['outlet']);
        $variant = $this->variant($event['sku']);
        $conversion = $this->baseConversion($variant);
        $quantity = round($event['quantity'], 4);
        $note = self::DATASET_NOTE_PREFIX.' '.$event['note'];

        if ($event['direction'] === 'in') {
            $unitCost = round($event['unit_cost'], 6);
            $totalCost = round($quantity * $unitCost, 2);
            $this->createManualLedger($outlet, $variant, $conversion, ProductStockLedgerTransactionType::AdjustmentIn, $quantity, 0, $quantity, $unitCost, $totalCost, $event['date'], $note);
            $this->updateStock($outlet, $variant, $quantity, $totalCost, $event['date']);

            return;
        }

        $stock = $this->stock($outlet, $variant);
        $unitCost = round((float) $stock->average_cost, 6);
        $totalCost = round($quantity * $unitCost, 2);
        $this->createManualLedger($outlet, $variant, $conversion, ProductStockLedgerTransactionType::AdjustmentOut, 0, $quantity, $quantity, $unitCost, $totalCost, $event['date'], $note);
        $this->updateStock($outlet, $variant, -$quantity, -$totalCost, $event['date']);
    }

    private function createManualLedger(Outlet $outlet, ProductVariant $variant, ProductUnitConversion $conversion, ProductStockLedgerTransactionType $type, float $quantityIn, float $quantityOut, float $baseQuantity, float $unitCost, float $totalCost, string $date, string $note): void
    {
        ProductStockLedger::query()->create([
            ...$this->ledgerIdentity($outlet, $variant, $date), 'transaction_type' => $type,
            'quantity_in' => $quantityIn, 'quantity_out' => $quantityOut,
            'unit_of_measurement_id' => $conversion->unit_of_measurement_id,
            'product_unit_conversion_id' => $conversion->id, 'base_quantity' => $baseQuantity,
            'unit_cost' => $unitCost, 'total_cost' => $totalCost, 'note' => $note,
        ]);
    }

    private function seedPurchasePayments(Purchase $purchase, int $index): void
    {
        $status = $index <= 6 ? PurchasePaymentStatus::Paid : ($index <= 12 ? PurchasePaymentStatus::Partial : PurchasePaymentStatus::Unpaid);
        $paidAmount = match ($status) {
            PurchasePaymentStatus::Paid => (float) $purchase->total_amount,
            PurchasePaymentStatus::Partial => round((float) $purchase->total_amount * ($index % 2 === 0 ? 0.55 : 0.4), 2),
            PurchasePaymentStatus::Unpaid => 0,
        };
        $this->createPayments($purchase, $paidAmount, in_array($index, [1, 2, 7, 8], true) ? 2 : 1);
    }

    private function seedSalePayments(Sale $sale, int $index): void
    {
        $status = $index <= 8 ? SalePaymentStatus::Paid : ($index <= 16 ? SalePaymentStatus::Partial : SalePaymentStatus::Unpaid);
        $paidAmount = match ($status) {
            SalePaymentStatus::Paid => (float) $sale->total_amount,
            SalePaymentStatus::Partial => round((float) $sale->total_amount * ($index % 2 === 0 ? 0.6 : 0.45), 2),
            SalePaymentStatus::Unpaid => 0,
        };
        $this->createPayments($sale, $paidAmount, in_array($index, [1, 2, 3, 9, 10, 11], true) ? 2 : 1);
    }

    private function createPayments(Purchase|Sale $document, float $paidAmount, int $installments): void
    {
        if ($paidAmount <= 0) {
            return;
        }

        $firstAmount = round($paidAmount * 0.6, 2);
        $amounts = $installments === 2 ? [$firstAmount, round($paidAmount - $firstAmount, 2)] : [$paidAmount];
        $methods = [PaymentMethod::Cash, PaymentMethod::BankTransfer, PaymentMethod::MobileBanking, PaymentMethod::Cheque];
        $isPurchase = $document instanceof Purchase;
        $documentDate = CarbonImmutable::parse($isPurchase ? $document->purchase_date : $document->sale_date);

        foreach ($amounts as $paymentIndex => $amount) {
            $method = $methods[($document->id + $paymentIndex) % count($methods)];
            $document->payments()->create([
                'business_id' => $this->business->id,
                $isPurchase ? 'supplier_party_id' : 'customer_party_id' => $isPurchase ? $document->supplier_party_id : $document->customer_party_id,
                'created_by_id' => $this->admin->id,
                'payment_date' => $documentDate->addDays($paymentIndex * 7)->toDateString(), 'amount' => $amount,
                'payment_method' => $method,
                'reference_no' => $method === PaymentMethod::Cash ? null : sprintf('%s-%04d-%d', $isPurchase ? 'PP' : 'SP', $document->id, $paymentIndex + 1),
                'note' => $installments === 2 ? 'Installment '.($paymentIndex + 1).' of 2.' : 'Payment recorded in full.',
            ]);
        }

        $totalPaid = round((float) $document->payments()->sum('amount'), 2);
        $total = (float) $document->total_amount;
        $document->update([
            'paid_amount' => $totalPaid, 'due_amount' => round($total - $totalPaid, 2),
            'payment_status' => match (true) {
                $totalPaid <= 0 => $isPurchase ? PurchasePaymentStatus::Unpaid : SalePaymentStatus::Unpaid,
                $totalPaid >= $total => $isPurchase ? PurchasePaymentStatus::Paid : SalePaymentStatus::Paid,
                default => $isPurchase ? PurchasePaymentStatus::Partial : SalePaymentStatus::Partial,
            },
        ]);
    }

    private function updateStock(Outlet $outlet, ProductVariant $variant, float $quantityChange, float $valueChange, string $date): void
    {
        $stock = $this->stock($outlet, $variant);
        $quantity = round((float) $stock->quantity + $quantityChange, 4);
        $value = round((float) $stock->stock_value + $valueChange, 2);

        if ($quantity < -0.00005) {
            throw new RuntimeException("Negative stock prevented for {$variant->sku} at {$outlet->code}.");
        }

        if ($quantity <= 0.00005) {
            $quantity = 0;
            $value = 0;
        }

        $stock->fill([
            'quantity' => $quantity,
            'average_cost' => $quantity > 0 ? round($value / $quantity, 6) : 0,
            'stock_value' => max(0, $value),
            'last_movement_at' => CarbonImmutable::parse($date)->setTime(17, 0),
        ])->save();
    }

    private function stock(Outlet $outlet, ProductVariant $variant): ProductStock
    {
        $stock = ProductStock::query()->firstOrCreate(
            ['outlet_id' => $outlet->id, 'product_variant_id' => $variant->id],
            ['business_id' => $this->business->id, 'quantity' => 0, 'average_cost' => 0, 'stock_value' => 0],
        );

        return ProductStock::query()->lockForUpdate()->findOrFail($stock->id);
    }

    private function ledgerIdentity(Outlet $outlet, ProductVariant $variant, string $date): array
    {
        return ['business_id' => $this->business->id, 'outlet_id' => $outlet->id, 'product_variant_id' => $variant->id, 'transaction_date' => $date];
    }

    private function outlet(string $code): Outlet
    {
        return $this->outlets->get($code) ?? throw new RuntimeException("Missing seeded outlet {$code}.");
    }

    private function party(string $name): Party
    {
        return $this->parties->get($name) ?? throw new RuntimeException("Missing seeded party {$name}.");
    }

    private function variant(string $sku): ProductVariant
    {
        return $this->variants->get($sku) ?? throw new RuntimeException("Missing seeded SKU {$sku}.");
    }

    private function conversion(ProductVariant $variant, string $unitCode): ProductUnitConversion
    {
        return $this->conversions->get($variant->product_id.':'.$unitCode) ?? throw new RuntimeException("Missing {$unitCode} conversion for {$variant->sku}.");
    }

    private function baseConversion(ProductVariant $variant): ProductUnitConversion
    {
        return $this->conversions
            ->where('product_id', $variant->product_id)
            ->where('unit_of_measurement_id', $variant->product->base_unit_of_measurement_id)
            ->first() ?? throw new RuntimeException("Missing base-unit conversion for {$variant->sku}.");
    }

    private function openingEvents(): array
    {
        return collect([
            ['WH01', 'OFF-80-A4-005', 120, 330], ['WH01', 'OFF-55-2336-001', 90, 245], ['WH01', 'OFF-60-2336-002', 75, 270],
            ['WH01', 'ART-230-2336-009', 24, 590], ['WH01', 'ART-250-2336-010', 20, 660], ['WH01', 'DUP-250-GB-015', 850, 84],
            ['WH01', 'DUP-300-WB-019', 600, 102], ['WH01', 'NEW-45-2336-021', 1200, 49], ['WH01', 'NEW-45-ROLL-024', 18, 7200],
            ['WH01', 'STK-GLS-2030-025', 28, 820], ['WH01', 'STK-PVC-ROLL-028', 20, 5400], ['WH01', 'BRD-MILL-32OZ-029', 32, 1650],
            ['MAIN', 'OFF-80-A4-005', 30, 335], ['MAIN', 'OFF-80-A4-006', 18, 360], ['MAIN', 'OFF-60-2336-002', 15, 280],
            ['MAIN', 'OFF-80-2336-004', 12, 350], ['MAIN', 'ART-250-2336-010', 8, 690], ['MAIN', 'STK-GLS-2030-025', 6, 850],
            ['MAIN', 'NEW-45-2336-021', 100, 51], ['UTR', 'OFF-80-A4-005', 12, 340], ['UTR', 'OFF-80-A4-006', 8, 365],
            ['UTR', 'STK-MAT-2030-026', 4, 880],
        ])->map(fn (array $row): array => ['type' => 'opening', 'date' => '2026-05-01', 'outlet' => $row[0], 'sku' => $row[1], 'quantity' => $row[2], 'unit' => $this->baseUnitCode($row[1]), 'unit_cost' => $row[3]])->all();
    }

    private function purchaseEvents(): array
    {
        return [
            ['type' => 'purchase', 'date' => '2026-05-05', 'outlet' => 'WH01', 'party' => 'Bengal Paper Mills', 'note' => 'Bulk copy paper and newsprint delivery.', 'items' => [['OFF-80-A4-005', 'carton', 20, 1650], ['OFF-55-2336-001', 'ream', 80, 252], ['NEW-45-2336-021', 'kg', 500, 52]]],
            ['type' => 'purchase', 'date' => '2026-05-09', 'outlet' => 'WH01', 'party' => 'Metro Paper & Board Traders', 'note' => 'Board and art-card replenishment.', 'items' => [['DUP-250-GB-015', 'kg', 600, 88], ['ART-230-2336-009', 'ream', 20, 620], ['STK-GLS-2030-025', 'ream', 15, 900]]],
            ['type' => 'purchase', 'date' => '2026-05-14', 'outlet' => 'WH01', 'party' => 'Eastern Paper Imports', 'note' => 'Imported A4 copy paper consignment.', 'items' => [['OFF-80-A4-006', 'ream', 75, 370], ['OFF-80-A4-005', 'carton', 12, 1700]]],
            ['type' => 'purchase', 'date' => '2026-05-20', 'outlet' => 'MAIN', 'party' => 'Padma Paper Depot', 'note' => 'Direct shop replenishment before print-season demand.', 'items' => [['OFF-80-A4-005', 'carton', 4, 1725], ['ART-250-2336-010', 'ream', 6, 710]]],
            ['type' => 'purchase', 'date' => '2026-05-27', 'outlet' => 'WH01', 'party' => 'Meghna Board Supply', 'note' => 'Heavy board stock for packaging customers.', 'items' => [['DUP-300-GB-016', 'kg', 700, 96], ['BRD-HARD-SON-120-030', 'bundle', 25, 2100]]],
            ['type' => 'purchase', 'date' => '2026-06-03', 'outlet' => 'WH01', 'party' => 'Bengal Paper Mills', 'note' => 'Monthly offset-paper allocation.', 'items' => [['OFF-60-2336-002', 'ream', 90, 278], ['OFF-70-2336-003', 'ream', 70, 312]]],
            ['type' => 'purchase', 'date' => '2026-06-10', 'outlet' => 'MAIN', 'party' => 'Sonar Bangla Paper & Packaging', 'note' => 'Urgent A4 and sticker supply for retail counter.', 'items' => [['OFF-80-A4-005', 'carton', 3, 1750], ['STK-MAT-2030-026', 'ream', 8, 930]]],
            ['type' => 'purchase', 'date' => '2026-06-18', 'outlet' => 'WH01', 'party' => 'Metro Paper & Board Traders', 'note' => 'Mixed glossy and matte card delivery.', 'items' => [['ART-250-GLS-013', 'ream', 18, 760], ['ART-300-MAT-014', 'ream', 14, 890]]],
            ['type' => 'purchase', 'date' => '2026-06-25', 'outlet' => 'UTR', 'party' => 'Eastern Paper Imports', 'note' => 'Small branch copy-paper delivery.', 'items' => [['OFF-80-A4-005', 'carton', 3, 1775], ['OFF-80-A4-006', 'ream', 10, 385]]],
            ['type' => 'purchase', 'date' => '2026-07-02', 'outlet' => 'WH01', 'party' => 'Padma Paper Depot', 'note' => 'Newsprint restock for publication orders.', 'items' => [['NEW-48-2336-022', 'kg', 800, 55], ['NEW-52-2336-023', 'kg', 650, 59]]],
            ['type' => 'purchase', 'date' => '2026-07-09', 'outlet' => 'WH01', 'party' => 'Bengal Paper Mills', 'note' => 'Offset stock for July wholesale demand.', 'items' => [['OFF-80-2336-004', 'ream', 75, 345], ['OFF-100-2030-007', 'ream', 45, 430]]],
            ['type' => 'purchase', 'date' => '2026-07-16', 'outlet' => 'WH01', 'party' => 'Meghna Board Supply', 'note' => 'White-back duplex and mill-board delivery.', 'items' => [['DUP-300-WB-019', 'kg', 500, 105], ['BRD-MILL-32OZ-029', 'bundle', 20, 1725]]],
            ['type' => 'purchase', 'date' => '2026-07-23', 'outlet' => 'MAIN', 'party' => 'Buriganga Print Materials', 'note' => 'Main shop A4 and glossy sticker refill.', 'items' => [['OFF-80-A4-005', 'carton', 3, 1760], ['STK-GLS-2030-025', 'ream', 5, 920]]],
            ['type' => 'purchase', 'date' => '2026-07-30', 'outlet' => 'WH01', 'party' => 'Eastern Paper Imports', 'note' => 'PVC sticker and newsprint-roll shipment.', 'items' => [['STK-PVC-ROLL-028', 'roll', 16, 5600], ['NEW-45-ROLL-024', 'roll', 12, 7450]]],
            ['type' => 'purchase', 'date' => '2026-08-05', 'outlet' => 'WH01', 'party' => 'Metro Paper & Board Traders', 'note' => 'August art-card assortment.', 'items' => [['ART-260-2030-011', 'ream', 20, 735], ['ART-300-2030-012', 'ream', 18, 860]]],
            ['type' => 'purchase', 'date' => '2026-08-12', 'outlet' => 'UTR', 'party' => 'Sonar Bangla Paper & Packaging', 'note' => 'Branch A4 and glossy sticker refill.', 'items' => [['OFF-80-A4-005', 'carton', 2, 1790], ['STK-GLS-2030-025', 'ream', 4, 940]]],
            ['type' => 'purchase', 'date' => '2026-08-19', 'outlet' => 'WH01', 'party' => 'Bengal Paper Mills', 'note' => 'Late-August offset and cream-wove stock.', 'items' => [['OFF-80-CRM-008', 'ream', 55, 390], ['OFF-55-2336-001', 'ream', 60, 258]]],
            ['type' => 'purchase', 'date' => '2026-08-25', 'outlet' => 'MAIN', 'party' => 'Padma Paper Depot', 'note' => 'Counter stock top-up before month end.', 'items' => [['OFF-80-A4-006', 'ream', 10, 390], ['OFF-80-A4-005', 'carton', 2, 1800]]],
        ];
    }

    private function movementEvents(): array
    {
        return [
            ['type' => 'transfer', 'date' => '2026-05-18', 'from' => 'WH01', 'to' => 'MAIN', 'sku' => 'OFF-80-A4-005', 'quantity' => 15, 'note' => 'Warehouse to main-shop A4 replenishment.'],
            ['type' => 'transfer', 'date' => '2026-06-15', 'from' => 'WH01', 'to' => 'UTR', 'sku' => 'OFF-80-A4-005', 'quantity' => 8, 'note' => 'Warehouse to Uttara copy-paper replenishment.'],
            ['type' => 'adjustment', 'date' => '2026-06-22', 'outlet' => 'MAIN', 'sku' => 'OFF-80-A4-005', 'direction' => 'in', 'quantity' => 1.5, 'unit_cost' => 342, 'note' => 'Stock-count correction for unopened A4 packs.'],
            ['type' => 'adjustment', 'date' => '2026-07-06', 'outlet' => 'WH01', 'sku' => 'DUP-250-GB-015', 'direction' => 'in', 'quantity' => 10, 'unit_cost' => 86, 'note' => 'Warehouse weighment correction.'],
            ['type' => 'transfer', 'date' => '2026-07-14', 'from' => 'WH01', 'to' => 'MAIN', 'sku' => 'OFF-80-A4-005', 'quantity' => 12, 'note' => 'Second A4 branch replenishment.'],
            ['type' => 'adjustment', 'date' => '2026-08-10', 'outlet' => 'MAIN', 'sku' => 'OFF-80-A4-005', 'direction' => 'out', 'quantity' => 0.5, 'note' => 'Damaged ream removed after shelf inspection.'],
            ['type' => 'adjustment', 'date' => '2026-08-20', 'outlet' => 'UTR', 'sku' => 'OFF-80-A4-006', 'direction' => 'out', 'quantity' => 0.5, 'note' => 'Branch stock-count shortage correction.'],
        ];
    }

    private function saleEvents(): array
    {
        return [
            ['type' => 'sale', 'date' => '2026-06-06', 'outlet' => 'MAIN', 'party' => 'City Print & Packaging', 'note' => 'Regular print-run supply.', 'items' => [['OFF-80-A4-005', 'ream', 5, 430], ['OFF-60-2336-002', 'ream', 3, 355]]],
            ['type' => 'sale', 'date' => '2026-06-09', 'outlet' => 'MAIN', 'party' => 'Green Leaf Press', 'note' => 'Counter sale with A4 assortment.', 'items' => [['OFF-80-A4-006', 'ream', 3, 460], ['OFF-80-A4-005', 'ream', 2, 435]]],
            ['type' => 'sale', 'date' => '2026-06-12', 'outlet' => 'UTR', 'party' => 'Pixel Print House', 'note' => 'Uttara branch pickup.', 'items' => [['OFF-80-A4-005', 'ream', 2, 445], ['OFF-80-A4-006', 'ream', 1, 470]]],
            ['type' => 'sale', 'date' => '2026-06-16', 'outlet' => 'MAIN', 'party' => 'Dhaka Stationery Wholesale', 'note' => 'Loose-sheet order for stationery resale.', 'items' => [['OFF-80-A4-005', 'sheet', 500, 1.05], ['STK-GLS-2030-025', 'ream', 1, 1080]]],
            ['type' => 'sale', 'date' => '2026-06-20', 'outlet' => 'MAIN', 'party' => 'Classic Publications', 'note' => 'Publication sample print stock.', 'items' => [['ART-250-2336-010', 'ream', 1, 860], ['OFF-80-2336-004', 'ream', 2, 445]]],
            ['type' => 'sale', 'date' => '2026-06-24', 'outlet' => 'UTR', 'party' => 'Nova Packaging', 'note' => 'Clearance of branch matte-sticker stock.', 'items' => [['STK-MAT-2030-026', 'ream', 4, 1100], ['OFF-80-A4-005', 'ream', 1, 450]]],
            ['type' => 'sale', 'date' => '2026-06-28', 'outlet' => 'MAIN', 'party' => 'Sonar Bangla Paper & Packaging', 'note' => 'Mixed paper order for urgent production.', 'items' => [['OFF-80-A4-005', 'ream', 3, 440], ['NEW-45-2336-021', 'kg', 20, 68]]],
            ['type' => 'sale', 'date' => '2026-07-03', 'outlet' => 'MAIN', 'party' => 'City Print & Packaging', 'note' => 'Monthly packaging-material supply.', 'items' => [['OFF-80-A4-005', 'ream', 2, 445], ['OFF-80-2336-004', 'ream', 2, 450]]],
            ['type' => 'sale', 'date' => '2026-07-07', 'outlet' => 'UTR', 'party' => 'Green Leaf Press', 'note' => 'Small branch replenishment.', 'items' => [['OFF-80-A4-005', 'ream', 1.5, 455], ['OFF-80-A4-006', 'ream', 1, 475]]],
            ['type' => 'sale', 'date' => '2026-07-11', 'outlet' => 'MAIN', 'party' => 'Pixel Print House', 'note' => 'Sticker and A4 combination order.', 'items' => [['STK-GLS-2030-025', 'ream', 2, 1120], ['OFF-80-A4-005', 'ream', 1, 450]]],
            ['type' => 'sale', 'date' => '2026-07-15', 'outlet' => 'MAIN', 'party' => 'Classic Publications', 'note' => 'Text and cover paper delivery.', 'items' => [['OFF-80-A4-005', 'ream', 4, 450], ['ART-250-2336-010', 'ream', 1, 870]]],
            ['type' => 'sale', 'date' => '2026-07-19', 'outlet' => 'UTR', 'party' => 'Dhaka Stationery Wholesale', 'note' => 'Branch copy-paper wholesale order.', 'items' => [['OFF-80-A4-006', 'ream', 2, 480], ['OFF-80-A4-005', 'ream', 1, 458]]],
            ['type' => 'sale', 'date' => '2026-07-23', 'outlet' => 'MAIN', 'party' => 'Nova Packaging', 'note' => 'Offset paper for packaging inserts.', 'items' => [['OFF-60-2336-002', 'ream', 3, 365]]],
            ['type' => 'sale', 'date' => '2026-07-27', 'outlet' => 'MAIN', 'party' => 'Buriganga Print Materials', 'note' => 'A4 counter pickup.', 'items' => [['OFF-80-A4-005', 'ream', 2, 455]]],
            ['type' => 'sale', 'date' => '2026-07-31', 'outlet' => 'UTR', 'party' => 'Pixel Print House', 'note' => 'End-of-month A4 purchase.', 'items' => [['OFF-80-A4-005', 'ream', 1, 460]]],
            ['type' => 'sale', 'date' => '2026-08-03', 'outlet' => 'MAIN', 'party' => 'City Print & Packaging', 'note' => 'Premium art-card sample order.', 'items' => [['ART-250-2336-010', 'ream', 1, 890]]],
            ['type' => 'sale', 'date' => '2026-08-06', 'outlet' => 'MAIN', 'party' => 'Green Leaf Press', 'note' => 'A4 paper for short print run.', 'items' => [['OFF-80-A4-005', 'ream', 3, 460]]],
            ['type' => 'sale', 'date' => '2026-08-09', 'outlet' => 'UTR', 'party' => 'Classic Publications', 'note' => 'Branch copy-paper pickup.', 'items' => [['OFF-80-A4-006', 'ream', 1, 485]]],
            ['type' => 'sale', 'date' => '2026-08-12', 'outlet' => 'MAIN', 'party' => 'Nova Packaging', 'note' => 'Matte sticker paper order.', 'items' => [['STK-MAT-2030-026', 'ream', 1, 1160]]],
            ['type' => 'sale', 'date' => '2026-08-15', 'outlet' => 'MAIN', 'party' => 'Dhaka Stationery Wholesale', 'note' => 'Mid-month A4 wholesale order.', 'items' => [['OFF-80-A4-005', 'ream', 2, 465]]],
            ['type' => 'sale', 'date' => '2026-08-18', 'outlet' => 'UTR', 'party' => 'Sonar Bangla Paper & Packaging', 'note' => 'Uttara A4 pickup.', 'items' => [['OFF-80-A4-005', 'ream', 1, 470]]],
            ['type' => 'sale', 'date' => '2026-08-21', 'outlet' => 'MAIN', 'party' => 'Classic Publications', 'note' => 'Newsprint for publication proofing.', 'items' => [['NEW-45-2336-021', 'kg', 25, 70]]],
            ['type' => 'sale', 'date' => '2026-08-24', 'outlet' => 'MAIN', 'party' => 'Pixel Print House', 'note' => 'A4 paper counter sale.', 'items' => [['OFF-80-A4-005', 'ream', 1, 470]]],
            ['type' => 'sale', 'date' => '2026-08-27', 'outlet' => 'MAIN', 'party' => 'City Print & Packaging', 'note' => 'Month-end premium copy-paper order.', 'items' => [['OFF-80-A4-006', 'ream', 2, 495]]],
        ];
    }

    private function baseUnitCode(string $sku): string
    {
        $variant = $this->variant($sku);

        return $this->baseConversion($variant)->unitOfMeasurement->code;
    }
}
