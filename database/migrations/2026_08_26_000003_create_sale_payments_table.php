<?php

use App\Enums\PaymentMethod;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('customer_party_id')->constrained('parties')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->default(PaymentMethod::Cash->value);
            $table->string('reference_no')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['business_id', 'sale_id']);
            $table->index('customer_party_id');
            $table->index('created_by_id');
            $table->index('payment_date');
            $table->index('payment_method');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_payments');
    }
};
