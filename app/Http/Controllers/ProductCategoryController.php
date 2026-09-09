<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Http\Requests\SaveProductCategoryRequest;
use App\Models\Business;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
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

        $productCategories = ProductCategory::query()
            ->with('business:id,name')
            ->withCount('products')
            ->whereBelongsTo($business)
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction)
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('product-categories/index', [
            'productCategories' => $productCategories,
            'queryString' => [
                'page' => $request->query('page') !== null ? $productCategories->currentPage() : null,
                'search' => $search !== '' ? $search : null,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('product-categories/create', [
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function store(SaveProductCategoryRequest $request): RedirectResponse
    {
        $productCategory = ProductCategory::create($request->validated());

        return to_route('product-categories.edit', $productCategory)
            ->with('status', 'Product category created successfully.');
    }

    public function edit(ProductCategory $productCategory): Response
    {
        return Inertia::render('product-categories/edit', [
            'productCategory' => $productCategory,
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function update(SaveProductCategoryRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->update($request->validated());

        return to_route('product-categories.edit', $productCategory)
            ->with('status', 'Product category updated successfully.');
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {

        if ($productCategory->products()->exists()) {
            throw ValidationException::withMessages([
                'productCategory' => 'Delete the related products before deleting this product category.',
            ]);
        }

        $productCategory->delete();

        return to_route('product-categories.index')
            ->with('status', 'Product category deleted successfully.');
    }
}
