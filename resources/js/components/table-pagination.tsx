import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LengthAwarePagination } from '@/types';

interface TablePaginationProps<TItem> {
    paginator: LengthAwarePagination<TItem>;
    only?: string[];
    className?: string;
}

export function TablePagination<TItem>({ paginator, only, className }: TablePaginationProps<TItem>) {
    if (paginator.last_page <= 1) {
        return null;
    }

    const previousLink = paginator.links[0];
    const nextLink = paginator.links.at(-1);
    const pageLinks = paginator.links.slice(1, -1);

    return (
        <nav aria-label="Pagination" className={cn('ui-pagination', className)}>
            {previousLink?.url && (
                <Link
                    href={previousLink.url}
                    preserveScroll
                    only={only}
                    rel="prev"
                    className="ui-pagination-previous-button ui-pagination-direction-button"
                >
                    Previous
                </Link>
            )}

            <span className="ui-pagination-overview">
                Showing {paginator.from ?? 0} to {paginator.to ?? 0} of {paginator.total} results
            </span>

            {nextLink?.url && (
                <Link
                    href={nextLink.url}
                    preserveScroll
                    only={only}
                    rel="next"
                    className="ui-pagination-next-button ui-pagination-direction-button"
                >
                    Next
                </Link>
            )}

            <ol className="ui-pagination-items">
                {previousLink?.url && (
                    <li className="ui-pagination-item">
                        <Link
                            href={previousLink.url}
                            preserveScroll
                            only={only}
                            rel="prev"
                            aria-label="Previous page"
                            className="ui-pagination-item-button"
                        >
                            <ChevronLeft aria-hidden="true" className="ui-pagination-item-icon" />
                        </Link>
                    </li>
                )}

                {pageLinks.map((link, index) => {
                    const key = `${link.label}-${link.url ?? link.page ?? index}`;

                    if (link.url === null && link.page == null) {
                        return (
                            <li key={key} className="ui-pagination-item ui-pagination-item-disabled">
                                <span className="ui-pagination-item-button">
                                    <span aria-hidden="true" className="ui-pagination-item-label">
                                        {link.label}
                                    </span>
                                    <span className="sr-only">More pages</span>
                                </span>
                            </li>
                        );
                    }

                    if (link.active || !link.url) {
                        return (
                            <li key={key} className="ui-pagination-item ui-pagination-item-active">
                                <span aria-current="page" className="ui-pagination-item-button">
                                    <span className="ui-pagination-item-label">{link.label}</span>
                                </span>
                            </li>
                        );
                    }

                    return (
                        <li key={key} className="ui-pagination-item">
                            <Link
                                href={link.url}
                                preserveScroll
                                only={only}
                                aria-label={`Go to page ${link.page ?? link.label}`}
                                className="ui-pagination-item-button"
                            >
                                <span className="ui-pagination-item-label">{link.label}</span>
                            </Link>
                        </li>
                    );
                })}

                {nextLink?.url && (
                    <li className="ui-pagination-item">
                        <Link
                            href={nextLink.url}
                            preserveScroll
                            only={only}
                            rel="next"
                            aria-label="Next page"
                            className="ui-pagination-item-button"
                        >
                            <ChevronRight aria-hidden="true" className="ui-pagination-item-icon" />
                        </Link>
                    </li>
                )}
            </ol>
        </nav>
    );
}
