<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProductVariantRequest;
use App\Models\Business;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class ProductVariantController extends Controller
{
    public function store(SaveProductVariantRequest $request, Product $product): RedirectResponse
    {
        $this->ensureCurrentBusinessProduct($product);

        $productVariant = $product->productVariants()->create($request->validated());

        return to_route('products.edit', $product)
            ->with('status', "Variant {$productVariant->variant_name} created successfully.");
    }

    public function update(
        SaveProductVariantRequest $request,
        Product $product,
        ProductVariant $productVariant,
    ): RedirectResponse {
        $this->ensureProductVariantOwnership($product, $productVariant);

        $productVariant->update($request->validated());

        return to_route('products.edit', $product)
            ->with('status', 'Variant updated successfully.');
    }

    public function destroy(Product $product, ProductVariant $productVariant): RedirectResponse
    {
        $this->ensureProductVariantOwnership($product, $productVariant);

        if ($productVariant->purchaseItems()->exists() || $productVariant->stockLedgers()->exists() || $productVariant->stocks()->exists()) {
            throw ValidationException::withMessages([
                'product_variant' => 'Delete the related purchase items or stocks before deleting this variant.',
            ]);
        }

        $productVariant->delete();

        return to_route('products.edit', $product)
            ->with('status', 'Variant deleted successfully.');
    }

    private function ensureCurrentBusinessProduct(Product $product): void
    {
        abort_unless($product->business_id === Business::current()->id, 404);
    }

    private function ensureProductVariantOwnership(Product $product, ProductVariant $productVariant): void
    {
        $this->ensureCurrentBusinessProduct($product);
        abort_unless($productVariant->product_id === $product->id, 404);
    }
}
