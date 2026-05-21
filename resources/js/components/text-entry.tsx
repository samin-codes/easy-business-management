import { Copy } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TextEntryColor = 'gray' | 'blue' | 'success' | 'danger' | 'warning';

type TextEntrySize = 'xs' | 'sm' | 'md' | 'lg';
type TextEntryWeight = 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
type TextEntryFontFamily = 'sans' | 'serif' | 'mono';

export type TextEntryProps = {
    label: string;
    value?: ReactNode;
    placeholder?: ReactNode;
    inlineLabel?: boolean;
    hiddenLabel?: boolean;
    badge?: boolean;
    color?: TextEntryColor;
    icon?: ReactNode;
    iconColor?: TextEntryColor;
    iconPosition?: 'before' | 'after';
    size?: TextEntrySize;
    weight?: TextEntryWeight;
    fontFamily?: TextEntryFontFamily;
    limit?: number;
    words?: number;
    lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
    wrap?: boolean;
    copyable?: boolean;
    copyMessage?: string;
    copyMessageDuration?: number;
    prefix?: ReactNode;
    suffix?: ReactNode;
    prefixAction?: ReactNode;
    suffixAction?: ReactNode;
    className?: string;
};

const badgeColorClasses: Record<TextEntryColor, string> = {
    gray: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    blue: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    success: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    danger: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    warning: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
};

const textColorClasses: Record<TextEntryColor, string> = {
    gray: 'text-foreground',
    blue: 'text-blue-700 dark:text-blue-300',
    success: 'text-emerald-700 dark:text-emerald-300',
    danger: 'text-red-700 dark:text-red-300',
    warning: 'text-amber-700 dark:text-amber-300',
};

const iconColorClasses: Record<TextEntryColor, string> = {
    gray: 'text-foreground',
    blue: 'text-blue-600 dark:text-blue-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
};

const sizeClasses: Record<TextEntrySize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
};

const weightClasses: Record<TextEntryWeight, string> = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
};

const fontFamilyClasses: Record<TextEntryFontFamily, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
};

const lineClampClasses: Record<NonNullable<TextEntryProps['lineClamp']>, string> = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    5: 'line-clamp-5',
    6: 'line-clamp-6',
};

function hasDisplayValue(value: ReactNode): boolean {
    return value !== null && value !== undefined && value !== '';
}

function getTextValue(value: ReactNode): string | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }

    return null;
}

function limitCharacters(value: string, limit?: number): string {
    if (!limit || value.length <= limit) {
        return value;
    }

    return `${value.slice(0, limit)}...`;
}

function limitWords(value: string, words?: number): string {
    if (!words) {
        return value;
    }

    const parts = value.trim().split(/\s+/);

    if (parts.length <= words) {
        return value;
    }

    return `${parts.slice(0, words).join(' ')}...`;
}

export function TextEntry({
    label,
    value,
    placeholder = '-',
    inlineLabel = false,
    hiddenLabel = false,
    badge = false,
    color = 'gray',
    icon,
    iconColor,
    iconPosition = 'before',
    size = 'sm',
    weight = 'normal',
    fontFamily = 'sans',
    limit,
    words,
    lineClamp,
    wrap = true,
    copyable = false,
    copyMessage = 'Copied!',
    copyMessageDuration = 1500,
    prefix,
    suffix,
    prefixAction,
    suffixAction,
    className,
}: TextEntryProps) {
    const [copied, setCopied] = useState(false);
    const hasValue = hasDisplayValue(value);
    const textValue = hasValue ? getTextValue(value) : null;
    const formattedTextValue = textValue ? limitCharacters(limitWords(textValue, words), limit) : null;
    const displayValue = hasValue ? (formattedTextValue ?? value) : placeholder;
    const copyValue = hasValue ? textValue : null;
    const canCopy = copyable && copyValue !== null;
    const resolvedIconColor = iconColor ?? color;

    const copyToClipboard = async () => {
        if (!copyValue) {
            return;
        }

        await navigator.clipboard.writeText(copyValue);

        setCopied(true);
        window.setTimeout(() => setCopied(false), copyMessageDuration);
    };

    const iconElement = icon ? <span className={cn('shrink-0', iconColorClasses[resolvedIconColor])}>{icon}</span> : null;

    const valueElement =
        badge && hasValue ? (
            <Badge variant="outline" className={badgeColorClasses[color]}>
                {displayValue}
            </Badge>
        ) : (
            <span
                className={cn(
                    'min-w-0',
                    hasValue ? textColorClasses[color] : 'text-muted-foreground',
                    wrap ? 'break-words' : 'truncate whitespace-nowrap',
                    lineClamp && lineClampClasses[lineClamp],
                )}
            >
                {displayValue}
            </span>
        );

    return (
        <div className={cn(inlineLabel ? 'grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4' : 'space-y-1', className)}>
            <dt className={cn('text-sm text-muted-foreground', hiddenLabel && 'sr-only')}>{label}</dt>

            <dd
                className={cn(
                    'flex min-w-0 items-center gap-2',
                    sizeClasses[size],
                    weightClasses[weight],
                    fontFamilyClasses[fontFamily],
                )}
            >
                {prefixAction}
                {prefix && <span className="shrink-0 text-muted-foreground">{prefix}</span>}
                {iconPosition === 'before' && iconElement}
                {valueElement}
                {iconPosition === 'after' && iconElement}
                {suffix && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
                {suffixAction}

                {canCopy && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title={copied ? copyMessage : `Copy ${label}`}
                        aria-label={copied ? copyMessage : `Copy ${label}`}
                        onClick={() => void copyToClipboard()}
                    >
                        <Copy className="size-3" />
                    </Button>
                )}
            </dd>
        </div>
    );
}
