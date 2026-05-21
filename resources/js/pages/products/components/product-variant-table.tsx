import { router } from '@inertiajs/react';
import { SquarePen, Trash2 } from 'lucide-react';
import ProductVariantController from '@/actions/App/Http/Controllers/ProductVariantController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product, ProductVariant } from '../types';

export default function ProductVariantTable({ product, onEdit }: { product: Product; onEdit: (productVariant: ProductVariant) => void }) {
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
        <div className="overflow-x-auto rounded-md border">
            <table className="table-hover table">
                <thead>
                    <tr>
                        <th className="min-w-72">Variant</th>
                        <th className="min-w-48">Specs</th>
                        <th className="w-28 text-center">Placeholder</th>
                        <th className="w-40">Status</th>
                        <th className="w-24 text-right">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {productVariants.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                No variants yet.
                            </td>
                        </tr>
                    ) : (
                        productVariants.map((productVariant) => (
                            <tr key={productVariant.id}>
                                <td className="align-top">
                                    <div className="space-y-1">
                                        <div className="font-medium">{productVariant.variant_name}</div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Brand: </span>
                                            <span className="font-medium text-foreground">{productVariant.brand?.name ?? '-'}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">SKU: {productVariant.sku ?? '-'}</div>
                                    </div>
                                </td>
                                <td className="align-top">
                                    <div className="space-y-1 text-sm">
                                        <div>Grade: {formatGrade(productVariant)}</div>
                                        <div>Size: {formatSize(productVariant)}</div>
                                    </div>
                                </td>
                                <td className="text-center align-top">{productVariant.is_placeholder_variant ? 'Yes' : 'No'}</td>
                                <td className="align-top">
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
                                </td>
                                <td className="text-right align-top">
                                    <div className="flex justify-end gap-1">
                                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEdit(productVariant)}>
                                            <SquarePen className="size-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleDelete(productVariant)}>
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
