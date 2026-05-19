import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { PurchaseFormData, PurchaseItemFormData } from '../types';

export type PurchaseSummaryPatch = Partial<
    Pick<PurchaseFormData, 'discount_amount' | 'transport_cost' | 'labour_cost' | 'other_cost' | 'paid_amount'>
>;

type PurchaseSummaryProps = {
    items: PurchaseItemFormData[];
    discountAmount: string;
    transportCost: string;
    labourCost: string;
    otherCost: string;
    paidAmount: string;
    errors: Record<string, string>;
    onChange: (patch: PurchaseSummaryPatch) => void;
};

export default function PurchaseSummary({
    items,
    discountAmount,
    transportCost,
    labourCost,
    otherCost,
    paidAmount,
    errors,
    onChange,
}: PurchaseSummaryProps) {
    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
    }, 0);
    const total =
        subtotal + (Number(transportCost) || 0) + (Number(labourCost) || 0) + (Number(otherCost) || 0) - (Number(discountAmount) || 0);
    const paidAmountValue = Number(paidAmount) || 0;
    const due = total - paidAmountValue;
    const paymentStatus = paidAmountValue <= 0 ? 'unpaid' : paidAmountValue >= total ? 'paid' : 'partial';

    return (
        <div className="mt-6">
            <div className="flex justify-end">
                <div className="w-full max-w-sm">
                    <div className="mb-3 text-base font-medium">Summary</div>
                    <div className="space-y-1 overflow-hidden rounded-lg border bg-card p-4">
                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">Subtotal</span>
                            <span className="text-sm font-medium tabular-nums">{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Transport Cost</span>
                            <Input
                                id="transport_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={transportCost}
                                onChange={(event) =>
                                    onChange({
                                        transport_cost: event.target.value,
                                    })
                                }
                                className="no-number-spinner h-9 w-36 text-right"
                                aria-invalid={Boolean(errors.transport_cost)}
                            />
                        </div>
                        {errors.transport_cost && <div className="text-right text-xs text-red-500">{errors.transport_cost}</div>}

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Labour Cost</span>
                            <Input
                                id="labour_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={labourCost}
                                onChange={(event) =>
                                    onChange({
                                        labour_cost: event.target.value,
                                    })
                                }
                                className="no-number-spinner h-9 w-36 text-right"
                                aria-invalid={Boolean(errors.labour_cost)}
                            />
                        </div>
                        {errors.labour_cost && <div className="text-right text-xs text-red-500">{errors.labour_cost}</div>}

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Other Cost</span>
                            <Input
                                id="other_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={otherCost}
                                onChange={(event) =>
                                    onChange({
                                        other_cost: event.target.value,
                                    })
                                }
                                className="no-number-spinner h-9 w-36 text-right"
                                aria-invalid={Boolean(errors.other_cost)}
                            />
                        </div>
                        {errors.other_cost && <div className="text-right text-xs text-red-500">{errors.other_cost}</div>}

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Discount Amount</span>
                            <Input
                                id="discount_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={discountAmount}
                                onChange={(event) =>
                                    onChange({
                                        discount_amount: event.target.value,
                                    })
                                }
                                className="no-number-spinner h-9 w-36 text-right"
                                aria-invalid={Boolean(errors.discount_amount)}
                            />
                        </div>
                        {errors.discount_amount && <div className="text-right text-xs text-red-500">{errors.discount_amount}</div>}

                        <div className="border-t border-border" />
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm font-medium">Total Amount</span>
                            <span className="text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
                        </div>
                        <div className="border-t border-border" />

                        <div className="flex items-center justify-between gap-4 py-1">
                            <span className="text-sm text-muted-foreground">Paid Amount</span>
                            <Input
                                id="paid_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={paidAmount}
                                onChange={(event) =>
                                    onChange({
                                        paid_amount: event.target.value,
                                    })
                                }
                                className="no-number-spinner h-9 w-36 text-right"
                                aria-invalid={Boolean(errors.paid_amount)}
                            />
                        </div>
                        {errors.paid_amount && <div className="text-right text-xs text-red-500">{errors.paid_amount}</div>}

                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">Due Amount</span>
                            <span
                                className={
                                    'text-sm font-semibold tabular-nums ' +
                                    (paymentStatus === 'paid'
                                        ? 'text-emerald-600'
                                        : paymentStatus === 'partial'
                                          ? 'text-amber-600'
                                          : 'text-red-600')
                                }
                            >
                                {formatCurrency(due)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">Payment Status</span>
                            <Badge
                                variant="outline"
                                className={
                                    paymentStatus === 'paid'
                                        ? 'border-transparent bg-emerald-100 text-emerald-800'
                                        : paymentStatus === 'partial'
                                          ? 'border-transparent bg-amber-100 text-amber-800'
                                          : 'border-transparent bg-red-100 text-red-800'
                                }
                            >
                                {paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
