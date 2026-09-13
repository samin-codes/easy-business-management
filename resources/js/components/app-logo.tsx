import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo({ title = 'Laravel Starter Kit' }: { title?: string }) {
    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center text-sidebar-foreground">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="line-clamp-2 leading-tight font-semibold whitespace-normal">{title}</span>
            </div>
        </>
    );
}
