import { Link } from '@inertiajs/react';
import { Boxes, ClipboardPlus, PackageOpen, Repeat2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as openingStocksIndex } from '@/routes/opening-stocks';
import { index as adjustmentsIndex } from '@/routes/stock-adjustments';
import { index as transfersIndex } from '@/routes/stock-transfers';

const links = [
    { label: 'Current Stock', href: inventoryIndex().url, icon: Boxes },
    { label: 'Opening Stock', href: openingStocksIndex().url, icon: PackageOpen },
    { label: 'Adjustments', href: adjustmentsIndex().url, icon: ClipboardPlus },
    { label: 'Transfers', href: transfersIndex().url, icon: Repeat2 },
];

export default function InventoryNavigation({ active }: { active: 'stock' | 'opening' | 'adjustments' | 'transfers' }) {
    const activeLabel = { stock: 'Current Stock', opening: 'Opening Stock', adjustments: 'Adjustments', transfers: 'Transfers' }[active];

    return (
        <nav aria-label="Inventory sections" className="overflow-x-auto border-b">
            <div className="flex min-w-max gap-1">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={cn(
                            'flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                            link.label === activeLabel
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <link.icon className="size-4" />
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
