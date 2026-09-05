import { router } from '@inertiajs/react';
import ProductVariantController from '@/actions/App/Http/Controllers/ProductVariantController';
import { DeleteAction, EditAction } from '@/components/table-actions';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductVariant } from '@/types';

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
        <div className="ui-table">
            <div className="ui-table-main">
                <div className="ui-table-content">
                    <table className="ui-table-element">
                        <thead>
                            <tr className="ui-table-row">
                                <th className="ui-table-header-cell min-w-72">Variant</th>
                                <th className="ui-table-header-cell min-w-48">Specs</th>
                                <th className="ui-table-header-cell w-28 text-center">Placeholder</th>
                                <th className="ui-table-header-cell w-40">Status</th>
                                <th className="ui-table-header-cell ui-table-empty-header-cell w-24 text-right">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {productVariants.map((productVariant) => (
                                <tr key={productVariant.id} className="ui-table-row">
                                    <td className="ui-table-cell align-top">
                                        <div className="ui-table-column">
                                            <div className="ui-table-text">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{productVariant.variant_name}</div>

                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Brand: </span>
                                                        <span className="font-medium text-foreground">
                                                            {productVariant.brand?.name ?? '-'}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-muted-foreground">SKU: {productVariant.sku ?? '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="ui-table-cell align-top">
                                        <div className="ui-table-column">
                                            <div className="ui-table-text">
                                                <div className="space-y-1 text-sm">
                                                    <div>Grade: {formatGrade(productVariant)}</div>
                                                    <div>Size: {formatSize(productVariant)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="ui-table-cell text-center align-top">
                                        <div className="ui-table-column">
                                            <div className="ui-table-text">{productVariant.is_placeholder_variant ? 'Yes' : 'No'}</div>
                                        </div>
                                    </td>

                                    <td className="ui-table-cell align-top">
                                        <div className="ui-table-column">
                                            <div className="ui-table-text">
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
                                        </div>
                                    </td>

                                    <td className="ui-table-cell text-right align-top">
                                        <div className="ui-table-actions">
                                            <EditAction
                                                appearance="icon-button"
                                                label={`Edit ${productVariant.variant_name}`}
                                                onClick={() => onEdit(productVariant)}
                                            />

                                            <DeleteAction
                                                appearance="icon-button"
                                                label={`Delete ${productVariant.variant_name}`}
                                                onClick={() => handleDelete(productVariant)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {productVariants.length === 0 && (
                    <div className="ui-table-empty-state">
                        <div className="ui-table-empty-state-content">No variants yet.</div>
                    </div>
                )}
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
