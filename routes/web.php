<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DemoTableController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\PartyContactPersonController;
use App\Http\Controllers\PartyController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductUnitConversionController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('table', DemoTableController::class)->name('table');

    Route::singleton('business', BusinessController::class);
    Route::resource('businesses.outlets', OutletController::class)
        ->except(['index', 'show'])
        ->scoped();
    Route::resource('product-categories', ProductCategoryController::class)->except(['show']);
    Route::resource('products', ProductController::class)->except(['show']);
    Route::post('products/{product}/unit-conversions', [ProductUnitConversionController::class, 'store'])
        ->name('products.unit-conversions.store');
    Route::patch('products/{product}/unit-conversions/{product_unit_conversion}', [ProductUnitConversionController::class, 'update'])
        ->name('products.unit-conversions.update');
    Route::delete('products/{product}/unit-conversions/{product_unit_conversion}', [ProductUnitConversionController::class, 'destroy'])
        ->name('products.unit-conversions.destroy');
    Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])
        ->name('products.variants.store');
    Route::patch('products/{product}/variants/{product_variant}', [ProductVariantController::class, 'update'])
        ->name('products.variants.update');
    Route::delete('products/{product}/variants/{product_variant}', [ProductVariantController::class, 'destroy'])
        ->name('products.variants.destroy');
    Route::resource('parties', PartyController::class);
    Route::resource('parties.party-contact-persons', PartyContactPersonController::class)
        ->except(['index', 'show'])
        ->scoped();
    Route::resource('purchases', PurchaseController::class)->except(['edit', 'update']);
});

require __DIR__.'/settings.php';
