import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

export default function AppLogo({ title = 'Laravel Starter Kit', multiline = false }: { title?: string; multiline?: boolean }) {
    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center text-sidebar-foreground">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className={cn('leading-tight font-semibold', multiline ? 'line-clamp-2 text-balance whitespace-normal' : 'truncate')}>
                    {title}
                </span>
            </div>
        </>
    );
}
