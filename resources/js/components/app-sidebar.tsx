import { Link } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    LayoutGrid,
    Package,
    ShoppingCart,
    Tags,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { show as businessShow } from '@/routes/business';
import { index as partyIndex } from '@/routes/parties';
import { index as productCategoryIndex } from '@/routes/product-categories';
import { index as productIndex } from '@/routes/products';
import { index as purchaseIndex } from '@/routes/purchases';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Business',
        href: businessShow(),
        icon: BriefcaseBusiness,
    },
    {
        title: 'Product Categories',
        href: productCategoryIndex(),
        icon: Tags,
    },
    {
        title: 'Products',
        href: productIndex(),
        icon: Package,
    },
    {
        title: 'Parties',
        href: partyIndex(),
        icon: Users,
    },
    {
        title: 'Purchases',
        href: purchaseIndex(),
        icon: ShoppingCart,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
