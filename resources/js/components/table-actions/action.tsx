import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ActionColor = 'gray' | 'primary' | 'danger';
export type ActionSize = 'xs' | 'sm' | 'md';
export type ActionDisplayMode = 'link' | 'icon-button';

type SharedActionProps = {
    name: string;
    label: string;
    icon: LucideIcon;
    color?: ActionColor;
    size?: ActionSize;
    display?: ActionDisplayMode;
    disabled?: boolean;
    className?: string;
};

type ActionLinkElementProps = Omit<InertiaLinkProps, 'as' | 'children' | 'className' | 'href'> & {
    url: NonNullable<InertiaLinkProps['href']>;
};

type ActionButtonElementProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'disabled' | 'name'> & {
    url?: never;
};

type ActionElementProps = ActionLinkElementProps | ActionButtonElementProps;
type ActionPresetDefaults = Pick<SharedActionProps, 'color' | 'icon' | 'label' | 'name'>;

export type ActionProps = SharedActionProps & ActionElementProps;
export type ActionPresetProps = Omit<SharedActionProps, keyof ActionPresetDefaults> & Partial<ActionPresetDefaults> & ActionElementProps;

const colorClasses: Record<ActionDisplayMode, Record<ActionColor, string>> = {
    link: {
        gray: 'text-foreground/70',
        primary: 'text-primary',
        danger: 'text-destructive',
    },
    'icon-button': {
        gray: 'text-muted-foreground hover:text-foreground',
        primary: 'text-primary/70 hover:text-primary',
        danger: 'text-destructive/70 hover:text-destructive',
    },
};

const displayClasses: Record<ActionDisplayMode, string> = {
    link: 'hover:underline focus-visible:rounded-sm focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
    'icon-button':
        'rounded-lg focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

const sizeClasses: Record<ActionDisplayMode, Record<ActionSize, string>> = {
    link: {
        xs: 'gap-0.5 text-xs [&_svg]:size-3.5',
        sm: 'gap-1 text-sm [&_svg]:size-4',
        md: 'gap-1.5 text-sm [&_svg]:size-5',
    },
    'icon-button': {
        xs: 'size-7 [&_svg]:size-4',
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-9 [&_svg]:size-5',
    },
};

export function Action(props: ActionProps) {
    const {
        name,
        label,
        icon: Icon,
        color = 'gray',
        size = 'sm',
        display = 'link',
        disabled,
        className: customClassName,
        url,
        ...elementProps
    } = props;
    const className = cn(
        'inline-flex shrink-0 items-center justify-center font-medium transition duration-75 outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        displayClasses[display],
        sizeClasses[display][size],
        colorClasses[display][color],
        disabled && 'pointer-events-none opacity-70',
        customClassName,
    );
    const content = (
        <>
            <Icon aria-hidden="true" />
            {display === 'link' && <span>{label}</span>}
        </>
    );
    const accessibilityProps = display === 'icon-button' ? { 'aria-label': label } : {};
    const dataProps = {
        'data-slot': 'table-action',
        'data-name': name,
        'data-display': display,
        'data-size': size,
        'data-color': color,
    };

    if (url !== undefined) {
        if (disabled) {
            return (
                <span className={className} aria-disabled="true" {...accessibilityProps} {...dataProps}>
                    {content}
                </span>
            );
        }

        const linkProps = elementProps as Omit<InertiaLinkProps, 'as' | 'children' | 'className' | 'href'>;

        return (
            <Link href={url} className={className} {...accessibilityProps} {...dataProps} {...linkProps}>
                {content}
            </Link>
        );
    }

    const { type = 'button', ...buttonProps } = elementProps as Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'children' | 'className' | 'disabled' | 'name'
    >;

    return (
        <button type={type} className={className} disabled={disabled} {...accessibilityProps} {...dataProps} {...buttonProps}>
            {content}
        </button>
    );
}
