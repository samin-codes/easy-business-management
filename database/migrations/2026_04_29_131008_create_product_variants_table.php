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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('variant_name');
            $table->string('sku')->nullable();
            $table->foreignId('brand_id')
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->decimal('grade_value', 10, 2)->nullable();
            $table->foreignId('grade_unit_id')
                ->nullable()
                ->constrained('product_grade_units')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->unsignedSmallInteger('width')->nullable();
            $table->unsignedSmallInteger('height')->nullable();
            $table->foreignId('size_unit_id')
                ->nullable()
                ->constrained('product_size_units')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->string('size_label')->nullable();
            $table->boolean('is_placeholder_variant')->default(false);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index('product_id');
            $table->index('brand_id');
            $table->index('grade_value');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
