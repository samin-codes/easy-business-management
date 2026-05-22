import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn('px-2 -mx-1', align === 'right' && 'flex-row-reverse')}
            asChild
        >
            <Link href={href} preserveScroll={preserveScroll} only={only}>
                {label}
                <span className="flex flex-col" aria-hidden="true">
                    <ChevronUp
                        className={cn(
                            'size-3',
                            isActive && currentDirection === 'asc'
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    />
                    <ChevronDown
                        className={cn(
                            'size-3',
                            isActive && currentDirection === 'desc'
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    />
                </span>
            </Link>
        </Button>
    );
}
