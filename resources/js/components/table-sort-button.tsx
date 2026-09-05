import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableSortButtonProps {
    label: string;
    href: string;
    isActive: boolean;
    currentDirection: 'asc' | 'desc';
    align?: 'left' | 'right';
    preserveScroll?: boolean;
    only?: string[];
}

export function TableSortButton({
    label,
    href,
    isActive,
    currentDirection,
    align = 'left',
    preserveScroll = true,
    only,
}: TableSortButtonProps) {
    const SortIcon = isActive && currentDirection === 'asc' ? ChevronUp : ChevronDown;

    return (
        <Link
            href={href}
            preserveScroll={preserveScroll}
            only={only}
            aria-label={label}
            className={cn(
                'ui-table-header-cell-sort-button',
                isActive && 'ui-table-header-cell-sort-button-sorted',
                align === 'right' && 'justify-end rtl:flex-row-reverse',
            )}
        >
            {label}
            <SortIcon aria-hidden="true" className="ui-table-header-cell-sort-icon" />
        </Link>
    );
}
