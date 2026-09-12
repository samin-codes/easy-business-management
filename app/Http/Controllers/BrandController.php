<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Http\Requests\SaveBrandRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $queryString = $this->getQueryString($request);

        $brands = Brand::query()
            ->when($queryString['search'] !== null, fn ($query) => $query
                ->where('name', 'like', "%{$queryString['search']}%"))
            ->orderBy($queryString['sort'], $queryString['direction'])
            ->orderBy('id', 'desc')
            ->paginate(10, ['id', 'name', 'status'], 'page', $queryString['page'] ?? 1)
            ->withQueryString();

        if ($brands->currentPage() > $brands->lastPage()) {
            $request->session()->reflash();

            return to_route('brands.index', [
                ...$queryString,
                'page' => $brands->lastPage(),
            ]);
        }

        return Inertia::render('brands/index', [
            'brands' => $brands,
            'queryString' => $queryString,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('brands/create', [
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function store(SaveBrandRequest $request): RedirectResponse
    {
        $brand = Brand::create($request->validated());

        return to_route('brands.edit', ['brand' => $brand, ...$this->getQueryString($request)])
            ->with('status', 'Brand created successfully.');
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('brands/edit', [
            'brand' => $brand,
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function update(SaveBrandRequest $request, Brand $brand): RedirectResponse
    {
        $brand->update($request->validated());

        return to_route('brands.edit', ['brand' => $brand, ...$this->getQueryString($request)])
            ->with('status', 'Brand updated successfully.');
    }

    public function destroy(Request $request, Brand $brand): RedirectResponse
    {
        if ($brand->productVariants()->exists()) {
            throw ValidationException::withMessages([
                'brand' => 'This brand is currently in use. Remove it from all product variants before deleting it.',
            ]);
        }

        $brand->delete();

        return to_route('brands.index', $this->getQueryString($request))
            ->with('status', 'Brand deleted successfully.');
    }

    /**
     * @return array{page: int|null, search: string|null, sort: string, direction: string}
     */
    private function getQueryString(Request $request): array
    {
        $search = $request->string('search')->trim()->limit(255, '')->toString();
        $direction = $request->query('direction', 'asc');

        return [
            'page' => $request->query('page') !== null ? max(1, $request->integer('page')) : null,
            'search' => $search !== '' ? $search : null,
            'sort' => 'name',
            'direction' => in_array($direction, ['asc', 'desc'], true) ? $direction : 'asc',
        ];
    }
}
