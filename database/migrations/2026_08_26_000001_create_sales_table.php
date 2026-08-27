<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('outlet_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('customer_party_id')->constrained('parties')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('sale_no');
            $table->date('sale_date');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->string('payment_status')->default('unpaid');
            $table->string('status')->default('confirmed');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['business_id', 'sale_no']);
            $table->index(['business_id', 'outlet_id']);
            $table->index('customer_party_id');
            $table->index('created_by_id');
            $table->index('sale_date');
            $table->index('payment_status');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
