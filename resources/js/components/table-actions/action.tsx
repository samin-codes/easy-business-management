import { Link } from '@inertiajs/react';

import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type ActionColor = 'gray' | 'primary' | 'danger';
export type ActionSize = 'xs' | 'sm' | 'md';
export type ActionAppearance = 'link' | 'icon-button';

type ActionBaseProps = {
    name: string;
    label: string;
    icon: LucideIcon;
    color?: ActionColor;
    size?: ActionSize;
    appearance?: ActionAppearance;
    disabled?: boolean;
    className?: string;
};

type ActionElementProps =
    | (Omit<InertiaLinkProps, 'as' | 'children' | 'className' | 'href'> & {
          url: NonNullable<InertiaLinkProps['href']>;
      })
    | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'disabled' | 'name'> & {
          url?: never;
      });

export type ActionProps = ActionBaseProps & ActionElementProps;

export type ActionPresetProps = Omit<ActionBaseProps, 'name' | 'label' | 'icon' | 'color'> &
    Partial<Pick<ActionBaseProps, 'name' | 'label' | 'icon' | 'color'>> &
    ActionElementProps;

const colorClasses: Record<ActionAppearance, Record<ActionColor, string>> = {
    link: {
        gray: 'text-foreground/70 hover:text-foreground focus-visible:text-foreground',
        primary: 'text-primary/90 hover:text-primary focus-visible:text-primary',
        danger: 'text-destructive/90 hover:text-destructive focus-visible:text-destructive',
    },
    'icon-button': {
        gray: 'text-muted-foreground hover:text-foreground focus-visible:text-foreground',
        primary: 'text-primary/80 hover:text-primary focus-visible:text-primary',
        danger: 'text-destructive/80 hover:text-destructive focus-visible:text-destructive',
    },
};

const appearanceClasses: Record<ActionAppearance, string> = {
    link: 'hover:underline focus-visible:rounded-sm focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
    'icon-button':
        'rounded-lg focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

const sizeClasses: Record<ActionAppearance, Record<ActionSize, string>> = {
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
        appearance = 'link',
        disabled,
        className: customClassName,
        url,
        ...elementProps
    } = props;

    const className = cn(
        'inline-flex shrink-0 items-center justify-center font-medium transition duration-75 outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        appearanceClasses[appearance],
        sizeClasses[appearance][size],
        colorClasses[appearance][color],
        disabled && 'pointer-events-none opacity-70',
        customClassName,
    );

    const content = (
        <>
            <Icon aria-hidden="true" />
            {appearance === 'link' && <span>{label}</span>}
        </>
    );

    const actionProps = {
        className,
        'aria-label': appearance === 'icon-button' ? label : undefined,
        'data-slot': 'table-action',
        'data-name': name,
        'data-appearance': appearance,
        'data-size': size,
        'data-color': color,
    };

    if (url !== undefined) {
        if (disabled) {
            return (
                <span {...actionProps} aria-disabled="true">
                    {content}
                </span>
            );
        }

        const linkProps = elementProps as Omit<InertiaLinkProps, 'as' | 'children' | 'className' | 'href'>;

        return (
            <Link href={url} {...actionProps} {...linkProps}>
                {content}
            </Link>
        );
    }

    const { type = 'button', ...buttonProps } = elementProps as Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'children' | 'className' | 'disabled' | 'name'
    >;

    return (
        <button type={type} disabled={disabled} {...actionProps} {...buttonProps}>
            {content}
        </button>
    );
}
