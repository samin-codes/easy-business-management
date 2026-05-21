import { router } from '@inertiajs/react';
import { SquarePen, Trash2 } from 'lucide-react';
import ProductUnitConversionController from '@/actions/App/Http/Controllers/ProductUnitConversionController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product, ProductUnitConversion } from '../types';

export default function UnitConversionTable({
    product,
    onEdit,
}: {
    product: Product;
    onEdit: (unitConversion: ProductUnitConversion) => void;
}) {
    const unitConversions = product.unit_conversions ?? [];
    const baseUnitName = product.base_unit_of_measurement.name;
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
            <div className="overflow-x-auto rounded-md border">
                <table className="table-hover table">
                    <thead>
                        <tr>
                            <th className="min-w-36">Unit</th>
                            <th className="min-w-56">Stock conversion</th>
                            <th className="w-20 text-center">Base</th>
                            <th className="w-32 text-center">Default Pur.</th>
                            <th className="w-32 text-center">Default Sale</th>
                            <th className="w-28">Status</th>
                            <th className="w-24 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {unitConversions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                                    No unit conversions yet.
                                </td>
                            </tr>
                        ) : (
                            unitConversions.map((unitConversion) => (
                                <tr
                                    key={unitConversion.id}
                                    className={unitConversion.is_base_unit ? 'table-light font-semibold' : undefined}
                                >
                                    <td>
                                        {unitConversion.unit_of_measurement.name}
                                    </td>
                                    <td>
                                        {formatStockConversion(unitConversion, baseUnitName)}
                                    </td>
                                    <td className="text-center">
                                        {unitConversion.is_base_unit ? 'Yes' : 'No'}
                                    </td>
                                    <td className="text-center">
                                        {unitConversion.is_default_purchase_unit ? 'Yes' : 'No'}
                                    </td>
                                    <td className="text-center">
                                        {unitConversion.is_default_sale_unit ? 'Yes' : 'No'}
                                    </td>
                                    <td>
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
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEdit(unitConversion)}>
                                                <SquarePen className="size-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            {!unitConversion.is_base_unit && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleDelete(unitConversion)}
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!hasAlternateUnitConversions && (
                <div className="text-sm text-muted-foreground">
                    No alternate units defined. Add one to use this product in other quantities.
                </div>
            )}
        </>
    );
}

function formatStockConversion(unitConversion: ProductUnitConversion, baseUnitName: string): string {
    return `${unitConversion.conversion_unit_quantity} ${unitConversion.unit_of_measurement.name} = ${unitConversion.base_unit_quantity} ${baseUnitName}`;
}
