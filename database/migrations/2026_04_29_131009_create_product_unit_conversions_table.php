<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_unit_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('unit_of_measurement_id')
                ->constrained('unit_of_measurements')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->decimal('conversion_factor_to_base', 15, 6);
            $table->boolean('is_base_unit')->default(false);
            $table->boolean('is_default_purchase_unit')->default(false);
            $table->boolean('is_default_sale_unit')->default(false);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(
                ['product_id', 'unit_of_measurement_id'],
                'product_unit_conversions_product_unit_of_measurement_unique'
            );
            $table->index('product_id');
            $table->index('unit_of_measurement_id');
            $table->index('status');
            $table->index('is_base_unit');
            $table->index('is_default_purchase_unit');
            $table->index('is_default_sale_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_unit_conversions');
    }
};
