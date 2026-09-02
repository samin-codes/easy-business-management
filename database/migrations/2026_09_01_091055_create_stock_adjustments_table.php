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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('outlet_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('adjustment_no');
            $table->date('adjustment_date');
            $table->string('type');
            $table->string('reason');
            $table->decimal('total_value', 15, 2)->default(0);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'adjustment_no']);
            $table->index(['business_id', 'outlet_id', 'adjustment_date']);
            $table->index(['type', 'reason']);
            $table->index('created_by_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
