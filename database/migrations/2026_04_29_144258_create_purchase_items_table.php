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
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('product_variant_id')
                ->constrained('product_variants')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('unit_of_measurement_id')
                ->constrained('unit_of_measurements')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('product_unit_conversion_id')
                ->constrained('product_unit_conversions')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->decimal('quantity', 15, 4);
            $table->decimal('base_quantity', 15, 4);
            $table->decimal('unit_cost', 15, 2);
            $table->decimal('base_unit_cost', 15, 6);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('line_total', 15, 2);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('purchase_id');
            $table->index('product_variant_id');
            $table->index('unit_of_measurement_id');
            $table->index('product_unit_conversion_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
