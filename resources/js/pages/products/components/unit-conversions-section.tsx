import { router } from '@inertiajs/react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import ProductUnitConversionController from '@/actions/App/Http/Controllers/ProductUnitConversionController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product, ProductUnitConversion } from '../types';

export default function UnitConversionsSection({
    product,
    onCreate,
    onEdit,
}: {
    product: Product;
    onCreate: () => void;
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
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="text-base font-medium">Unit Conversions</div>
                <Button type="button" size="sm" onClick={onCreate}>
                    <Plus className="size-4" />
                    Add Unit Conversion
                </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b">
                            <th className="h-10 min-w-36 px-3 text-left align-middle font-medium">Unit</th>
                            <th className="h-10 min-w-56 px-3 text-left align-middle font-medium">Stock conversion</th>
                            <th className="h-10 w-20 px-3 text-center align-middle font-medium">Base</th>
                            <th className="h-10 w-32 px-3 text-center align-middle font-medium">Default Pur.</th>
                            <th className="h-10 w-32 px-3 text-center align-middle font-medium">Default Sale</th>
                            <th className="h-10 w-28 px-3 text-left align-middle font-medium">Status</th>
                            <th className="h-10 w-24 px-3 text-right align-middle font-medium">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {unitConversions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                                    No unit conversions yet.
                                </td>
                            </tr>
                        ) : (
                            unitConversions.map((unitConversion) => (
                                <tr
                                    key={unitConversion.id}
                                    className={
                                        unitConversion.is_base_unit
                                            ? 'border-b bg-muted/30 font-semibold'
                                            : 'border-b transition-colors hover:bg-muted/50'
                                    }
                                >
                                    <td className="px-3 py-3 align-top">
                                        <div className="flex min-h-9 items-center">{unitConversion.unit_of_measurement.name}</div>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <div className="flex min-h-9 items-center">
                                            {formatStockConversion(unitConversion, baseUnitName)}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center align-top">
                                        <div className="flex min-h-9 items-center justify-center">
                                            {unitConversion.is_base_unit ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center align-top">
                                        <div className="flex min-h-9 items-center justify-center">
                                            {unitConversion.is_default_purchase_unit ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center align-top">
                                        <div className="flex min-h-9 items-center justify-center">
                                            {unitConversion.is_default_sale_unit ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <div className="flex min-h-9 items-center">
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
                                    </td>
                                    <td className="px-3 py-3 text-right align-top">
                                        <div className="flex min-h-9 items-center justify-end gap-1">
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
        </div>
    );
}

function formatStockConversion(unitConversion: ProductUnitConversion, baseUnitName: string): string {
    return `${unitConversion.conversion_unit_quantity} ${unitConversion.unit_of_measurement.name} = ${unitConversion.base_unit_quantity} ${baseUnitName}`;
}
