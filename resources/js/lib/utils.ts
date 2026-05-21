import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    return currencyFormatter.format(numericValue);
}

export const formatDecimal = (value: string | number, places = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    return Number.isNaN(num) ? String(value) : num.toFixed(places);
};

export const formatInteger = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    return Number.isNaN(num) ? String(value) : Math.trunc(num).toString();
};

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}
