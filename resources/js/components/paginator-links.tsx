import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import type { LengthAwarePaginationLink } from '@/types';

export default function PaginatorLinks({
    links,
    only,
    className,
}: {
    links: LengthAwarePaginationLink[];
    only?: string[];
    className?: string;
}) {
    if (links.length <= 3) {
        return null;
    }

    const previousLink = links[0];
    const nextLink = links.at(-1);
    const pageLinks = links.slice(1, -1);

    return (
        <Pagination className={className}>
            <PaginationContent>
                <PaginationItem>
                    {previousLink?.url ? (
                        <PaginationLink asChild size="default" className="gap-1 px-2.5 sm:pl-2.5">
                            <Link href={previousLink.url} preserveScroll only={only}>
                                <ChevronLeftIcon />
                                <span className="hidden sm:block">Previous</span>
                            </Link>
                        </PaginationLink>
                    ) : (
                        <PaginationPrevious aria-disabled tabIndex={-1} className="pointer-events-none opacity-50" />
                    )}
                </PaginationItem>

                {pageLinks.map((link, index) => {
                    const label = link.label;

                    return (
                        <PaginationItem key={`${link.label}-${link.url ?? link.page ?? index}`}>
                            {link.url === null && link.page == null ? (
                                <PaginationEllipsis />
                            ) : link.active ? (
                                <PaginationLink className="pointer-events-none" isActive>
                                    {label}
                                </PaginationLink>
                            ) : link.url ? (
                                <PaginationLink asChild>
                                    <Link href={link.url} preserveScroll only={only}>
                                        {label}
                                    </Link>
                                </PaginationLink>
                            ) : (
                                <PaginationLink className="pointer-events-none" isActive>
                                    {label}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    {nextLink?.url ? (
                        <PaginationLink asChild size="default" className="gap-1 px-2.5 sm:pr-2.5">
                            <Link href={nextLink.url} preserveScroll only={only}>
                                <span className="hidden sm:block">Next</span>
                                <ChevronRightIcon />
                            </Link>
                        </PaginationLink>
                    ) : (
                        <PaginationNext aria-disabled tabIndex={-1} className="pointer-events-none opacity-50" />
                    )}
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
