import { router } from '@inertiajs/react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import ProductVariantController from '@/actions/App/Http/Controllers/ProductVariantController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product, ProductVariant } from '../types';

export default function ProductVariantsSection({
    product,
    onCreate,
    onEdit,
}: {
    product: Product;
    onCreate: () => void;
    onEdit: (productVariant: ProductVariant) => void;
}) {
    const productVariants = product.product_variants ?? [];

    const handleDelete = (productVariant: ProductVariant) => {
        if (!confirm(`Delete the variant "${productVariant.variant_name}"?`)) {
            return;
        }

        router.delete(
            ProductVariantController.destroy({
                product,
                product_variant: productVariant.id,
            }),
            {
                preserveScroll: true,
                errorBag: 'productVariant',
                onError: (errors: Record<string, string>) => {
                    alert(errors.product_variant ?? 'Unable to delete this variant.');
                },
            },
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="text-base font-medium">Product Variants</div>
                <Button type="button" size="sm" onClick={onCreate}>
                    <Plus className="size-4" />
                    Add Variant
                </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b">
                            <th className="h-10 min-w-72 px-3 text-left align-middle font-medium">Variant</th>
                            <th className="h-10 min-w-48 px-3 text-left align-middle font-medium">Specs</th>
                            <th className="h-10 w-28 px-3 text-center align-middle font-medium">Placeholder</th>
                            <th className="h-10 w-40 px-3 text-left align-middle font-medium">Status</th>
                            <th className="h-10 w-24 px-3 text-right align-middle font-medium">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {productVariants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                                    No variants yet.
                                </td>
                            </tr>
                        ) : (
                            productVariants.map((productVariant) => (
                                <tr key={productVariant.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="px-3 py-3 align-top">
                                        <div className="space-y-1">
                                            <div className="font-medium">{productVariant.variant_name}</div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Brand: </span>
                                                <span className="font-medium text-foreground">{productVariant.brand?.name ?? '-'}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">SKU: {productVariant.sku}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <div className="space-y-1 text-sm">
                                            <div>Grade: {formatGrade(productVariant)}</div>
                                            <div>Size: {formatSize(productVariant)}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center align-top">
                                        <div className="flex min-h-9 items-center justify-center">
                                            {productVariant.is_placeholder_variant ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <div className="flex min-h-9 items-center">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    productVariant.status === 'active'
                                                        ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                        : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                                                }
                                            >
                                                {productVariant.status_label}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-right align-top">
                                        <div className="flex min-h-9 items-center justify-end gap-1">
                                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEdit(productVariant)}>
                                                <SquarePen className="size-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleDelete(productVariant)}
                                            >
                                                <Trash2 className="size-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatGrade(variant: ProductVariant): string {
    if (!variant.grade_value || !variant.grade_unit) {
        return '-';
    }

    return `${formatDecimal(variant.grade_value)} ${variant.grade_unit.symbol}`;
}

function formatDecimal(value: string): string {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return value;
    }

    return new Intl.NumberFormat('en', {
        maximumFractionDigits: 2,
    }).format(numberValue);
}

function formatSize(variant: ProductVariant): string {
    if (variant.size_label) {
        return variant.size_label;
    }

    if (!variant.width || !variant.height || !variant.size_unit) {
        return '-';
    }

    return `${variant.width}x${variant.height} ${variant.size_unit.symbol}`;
}
