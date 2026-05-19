import { Head } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CircleX,
    Columns3,
    MoreHorizontal,
    Search,
    SlidersHorizontal,
    ArrowUpDown,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const rows = [
    {
        id: 'INV001',
        paymentStatus: 'Paid',
        totalAmount: '$250.00',
        paymentMethod: 'Credit card',
        checked: true,
    },
    {
        id: 'INV002',
        paymentStatus: 'Pending',
        totalAmount: '$150.00',
        paymentMethod: 'PayPal',
        checked: false,
    },
    {
        id: 'INV003',
        paymentStatus: 'Unpaid',
        totalAmount: '$350.00',
        paymentMethod: 'Bank transfer',
        checked: false,
    },
    {
        id: 'INV004',
        paymentStatus: 'Paid',
        totalAmount: '$450.00',
        paymentMethod: 'Credit card',
        checked: true,
    },
    {
        id: 'INV005',
        paymentStatus: 'Paid',
        totalAmount: '$550.00',
        paymentMethod: 'PayPal',
        checked: false,
    },
];

export default function DemoTablePage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Demo', href: '/table' },
        { title: 'Table', href: '/table' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Demo Table" />

            <div className="px-4 py-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <Heading
                        title="Demo Table"
                        description="Basic shadcn-style data table chrome recreated with a semantic HTML table and Tailwind classes."
                        className="mb-8"
                    />

                    <section className="space-y-4">
                        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative w-full sm:max-w-sm">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input value="INV00" readOnly className="pl-9" aria-label="Filter invoices" />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button variant="outline" size="sm" className="h-8">
                                            Status
                                            <ChevronDown />
                                        </Button>
                                        <span className="inline-flex h-8 items-center rounded-md border bg-muted px-2.5 text-xs font-medium text-foreground">
                                            Paid
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                                            Reset
                                            <CircleX />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8">
                                        <SlidersHorizontal />
                                        View
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <Columns3 />
                                        Columns
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-transparent">
                                                <th className="h-10 w-12 px-4 text-left align-middle font-medium">
                                                    <Checkbox checked aria-label="Select all" />
                                                </th>
                                                <th className="h-10 px-4 text-left align-middle font-medium">
                                                    <Button variant="ghost" size="sm" className="-ml-3 h-8 px-3 font-medium">
                                                        Payment Status
                                                        <ArrowUpDown />
                                                    </Button>
                                                </th>
                                                <th className="h-10 px-4 text-left align-middle font-medium">
                                                    <Button variant="ghost" size="sm" className="-ml-3 h-8 px-3 font-medium">
                                                        Email
                                                        <ArrowUpDown />
                                                    </Button>
                                                </th>
                                                <th className="h-10 px-4 text-left align-middle font-medium">Amount</th>
                                                <th className="h-10 px-4 text-right align-middle font-medium">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="[&_tr:last-child]:border-0">
                                            {rows.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    data-state={row.checked ? 'selected' : undefined}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted/50"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <Checkbox checked={row.checked} aria-label={`Select ${row.id}`} />
                                                    </td>
                                                    <td className="px-4 py-3 align-middle font-medium">{row.paymentStatus}</td>
                                                    <td className="px-4 py-3 align-middle lowercase">
                                                        {row.id.toLowerCase()}
                                                        @example.com
                                                    </td>
                                                    <td className="px-4 py-3 align-middle">{row.totalAmount}</td>
                                                    <td className="px-4 py-3 text-right align-middle">
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreHorizontal />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="text-sm text-muted-foreground">2 of 5 row(s) selected.</div>

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">Rows per page</p>
                                        <Button variant="outline" size="sm" className="h-8 w-[70px] justify-between">
                                            10
                                            <ChevronDown />
                                        </Button>
                                    </div>

                                    <div className="text-sm font-medium">Page 1 of 10</div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="hidden size-8 lg:inline-flex">
                                            <ChevronsLeft />
                                            <span className="sr-only">First page</span>
                                        </Button>
                                        <Button variant="outline" size="icon" className="size-8">
                                            <ChevronLeft />
                                            <span className="sr-only">Previous page</span>
                                        </Button>
                                        <Button variant="outline" size="icon" className="size-8">
                                            <ChevronRight />
                                            <span className="sr-only">Next page</span>
                                        </Button>
                                        <Button variant="outline" size="icon" className="hidden size-8 lg:inline-flex">
                                            <ChevronsRight />
                                            <span className="sr-only">Last page</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-dashed bg-card p-6 shadow-xs">
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b">
                                            <th className="h-10 px-4 text-left align-middle font-medium">Payment Status</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium">Email</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={3} className="h-24 px-4 text-center align-middle text-sm text-muted-foreground">
                                                No results.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
