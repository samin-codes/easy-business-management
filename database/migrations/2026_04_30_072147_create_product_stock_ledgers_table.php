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
        Schema::create('product_stock_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')
                ->constrained('businesses')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('outlet_id')
                ->constrained('outlets')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('product_variant_id')
                ->constrained('product_variants')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('transaction_type');
            $table->decimal('quantity_in', 15, 4)->default(0);
            $table->decimal('quantity_out', 15, 4)->default(0);
            $table->foreignId('unit_of_measurement_id')
                ->constrained('unit_of_measurements')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('product_unit_conversion_id')
                ->nullable()
                ->constrained('product_unit_conversions')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->decimal('base_quantity', 15, 4);
            $table->decimal('unit_cost', 15, 6)->nullable();
            $table->decimal('total_cost', 15, 2)->nullable();
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->date('transaction_date');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('business_id');
            $table->index('outlet_id');
            $table->index('product_variant_id');
            $table->index('transaction_type');
            $table->index('transaction_date');
            $table->index(['source_type', 'source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_stock_ledgers');
    }
};
