export function numberValue(value: string): number {
    return Number(value) || 0;
}

export function formatCurrency(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
