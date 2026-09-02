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
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('source_outlet_id')->constrained('outlets')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('destination_outlet_id')->constrained('outlets')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('transfer_no');
            $table->date('transfer_date');
            $table->decimal('total_value', 15, 2)->default(0);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'transfer_no']);
            $table->index(['business_id', 'transfer_date']);
            $table->index(['source_outlet_id', 'destination_outlet_id']);
            $table->index('created_by_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
