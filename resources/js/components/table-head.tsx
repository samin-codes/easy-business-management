import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    sortable?: boolean;
    href?: string;
    direction?: 'asc' | 'desc';
    align?: 'start' | 'end';
    only?: string[];
    className?: string;
};

export function TableHead({
    children,
    sortable = false,
    href,
    direction,
    align = 'start',
    only,
    className,
}: Props) {
    const isSorted = direction !== undefined;
    const SortIcon = isSorted && direction === 'asc' ? ChevronUp : ChevronDown;

    return (
        <th
            aria-sort={
                direction === 'asc'
                    ? 'ascending'
                    : direction === 'desc'
                      ? 'descending'
                      : undefined
            }
            className={cn(
                'ui-table-header-cell',
                isSorted && 'ui-table-header-cell-sorted',
                align === 'end' && 'text-right',
                className,
            )}
        >
            {sortable && href ? (
                <Link
                    href={href}
                    preserveScroll
                    only={only}
                    className={cn(
                        'ui-table-header-cell-sort-button',
                        isSorted && 'ui-table-header-cell-sort-button-sorted',
                        align === 'end' && 'justify-end rtl:flex-row-reverse',
                    )}
                >
                    {children}

                    <SortIcon
                        aria-hidden="true"
                        className="ui-table-header-cell-sort-icon"
                    />
                </Link>
            ) : (
                children
            )}
        </th>
    );
}
