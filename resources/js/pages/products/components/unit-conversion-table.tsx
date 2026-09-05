import { router } from '@inertiajs/react';
import ProductUnitConversionController from '@/actions/App/Http/Controllers/ProductUnitConversionController';
import { DeleteAction, EditAction } from '@/components/table-actions';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductUnitConversion } from '@/types';

export default function UnitConversionTable({
    product,
    onEdit,
}: {
    product: Product;
    onEdit: (unitConversion: ProductUnitConversion) => void;
}) {
    const unitConversions = product.unit_conversions ?? [];
    const baseUnitName = product.base_unit_of_measurement?.name ?? 'Base unit';

    const hasAlternateUnitConversions = unitConversions.some((unitConversion) => !unitConversion.is_base_unit);

    const handleDelete = (unitConversion: ProductUnitConversion) => {
        if (!confirm('Are you sure you want to delete this unit conversion?')) {
            return;
        }

        router.delete(
            ProductUnitConversionController.destroy({
                product,
                product_unit_conversion: unitConversion.id,
            }),
            {
                preserveScroll: true,
                errorBag: 'productUnitConversion',
                onError: (errors: Record<string, string>) => {
                    alert(errors.product_unit_conversion ?? 'Unable to delete this unit conversion.');
                },
            },
        );
    };

    return (
        <>
            <div className="ui-table">
                <div className="ui-table-main">
                    <div className="ui-table-content">
                        <table className="ui-table-element">
                            <thead>
                                <tr className="ui-table-row">
                                    <th className="ui-table-header-cell min-w-36">Unit</th>
                                    <th className="ui-table-header-cell min-w-56">Stock conversion</th>
                                    <th className="ui-table-header-cell w-20 text-center">Base</th>
                                    <th className="ui-table-header-cell w-32 text-center">Default Pur.</th>
                                    <th className="ui-table-header-cell w-32 text-center">Default Sale</th>
                                    <th className="ui-table-header-cell w-28">Status</th>
                                    <th className="ui-table-header-cell ui-table-empty-header-cell w-24 text-right">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {unitConversions.map((unitConversion) => (
                                    <tr
                                        key={unitConversion.id}
                                        className={unitConversion.is_base_unit ? 'ui-table-row bg-muted/30 font-semibold' : 'ui-table-row'}
                                    >
                                        <td className="ui-table-cell">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">{getUnitName(unitConversion)}</div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">{formatStockConversion(unitConversion, baseUnitName)}</div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell text-center">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">{unitConversion.is_base_unit ? 'Yes' : 'No'}</div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell text-center">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    {unitConversion.is_default_purchase_unit ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell text-center">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">{unitConversion.is_default_sale_unit ? 'Yes' : 'No'}</div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell">
                                            <div className="ui-table-column">
                                                <div className="ui-table-text">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            unitConversion.status === 'active'
                                                                ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                                : 'border-transparent bg-gray-300 text-gray-800 hover:bg-gray-300'
                                                        }
                                                    >
                                                        {unitConversion.status_label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="ui-table-cell text-right">
                                            <div className="ui-table-actions">
                                                <EditAction
                                                    appearance="icon-button"
                                                    label={`Edit ${getUnitName(unitConversion)}`}
                                                    onClick={() => onEdit(unitConversion)}
                                                />

                                                {!unitConversion.is_base_unit && (
                                                    <DeleteAction
                                                        appearance="icon-button"
                                                        label={`Delete ${getUnitName(unitConversion)}`}
                                                        onClick={() => handleDelete(unitConversion)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {unitConversions.length === 0 && (
                        <div className="ui-table-empty-state">
                            <div className="ui-table-empty-state-content">No unit conversions yet.</div>
                        </div>
                    )}
                </div>
            </div>

            {!hasAlternateUnitConversions && (
                <div className="text-sm text-muted-foreground">
                    No alternate units defined. Add one to use this product in other quantities.
                </div>
            )}
        </>
    );
}

function getUnitName(unitConversion: ProductUnitConversion): string {
    return unitConversion.unit_of_measurement?.name ?? '-';
}

function formatStockConversion(unitConversion: ProductUnitConversion, baseUnitName: string): string {
    return `${unitConversion.conversion_unit_quantity} ${getUnitName(unitConversion)} = ${unitConversion.base_unit_quantity} ${baseUnitName}`;
}
