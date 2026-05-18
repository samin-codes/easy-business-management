<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Http\Requests\SaveProductRequest;
use App\Models\Brand;
use App\Models\Business;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductGradeUnit;
use App\Models\ProductSizeUnit;
use App\Models\UnitOfMeasurement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = trim((string) $request->query('search', ''));
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'created_at';
        }

        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $products = Product::query()
            ->with(['business:id,name', 'category:id,name', 'baseUnitOfMeasurement:id,name,code'])
            ->whereBelongsTo($business)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'queryString' => [
                'search' => $search !== '' ? $search : null,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        $business = Business::current();

        $productCategories = ProductCategory::query()
            ->with('business:id,name')
            ->whereBelongsTo($business)
            ->orderBy('name')
            ->get(['id', 'business_id', 'name']);

        $unitOfMeasurements = UnitOfMeasurement::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('products/create', [
            'productCategories' => $productCategories,
            'unitOfMeasurements' => $unitOfMeasurements,
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function store(SaveProductRequest $request): RedirectResponse
    {
        $product = DB::transaction(function () use ($request): Product {
            $product = Product::create($request->validated());

            $product->unitConversions()->create([
                'unit_of_measurement_id' => $product->base_unit_of_measurement_id,
                'conversion_factor_to_base' => 1,
                'is_base_unit' => true,
                'is_default_purchase_unit' => true,
                'is_default_sale_unit' => true,
                'status' => 'active',
            ]);

            return $product;
        });

        return to_route('products.edit', $product)
            ->with('status', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $business = Business::current();
        $product->load([
            'baseUnitOfMeasurement:id,name,code',
            'productVariants.brand:id,name',
            'productVariants.gradeUnit:id,name,code,symbol',
            'productVariants.sizeUnit:id,name,code,symbol',
            'unitConversions.unitOfMeasurement:id,name,code',
        ]);

        $productCategories = ProductCategory::query()
            ->with('business:id,name')
            ->whereBelongsTo($business)
            ->orderBy('name')
            ->get(['id', 'business_id', 'name']);

        $brands = Brand::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $productGradeUnits = ProductGradeUnit::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'symbol']);

        $productSizeUnits = ProductSizeUnit::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'symbol']);

        $unitOfMeasurements = UnitOfMeasurement::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('products/edit', [
            'product' => $product,
            'brands' => $brands,
            'productCategories' => $productCategories,
            'unitOfMeasurements' => $unitOfMeasurements,
            'productGradeUnits' => $productGradeUnits,
            'productSizeUnits' => $productSizeUnits,
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function update(SaveProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return to_route('products.edit', $product)
            ->with('status', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->purchaseItems()->exists() || $product->stocks()->exists()) {
            throw ValidationException::withMessages([
                'product' => 'Delete the related purchase items or stocks before deleting this product.',
            ]);
        }

        $product->delete();

        return to_route('products.index')
            ->with('status', 'Product deleted successfully.');
    }
}
