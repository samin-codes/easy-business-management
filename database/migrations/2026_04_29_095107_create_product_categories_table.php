<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['business_id', 'name']);
        });

        $this->seed();
    }

    private function seed(): void
    {
        $businessId = DB::table('businesses')->value('id');
        $now = now();

        DB::table('product_categories')->insertOrIgnore([
            [
                'business_id' => $businessId,
                'name' => 'Offset Paper',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'business_id' => $businessId,
                'name' => 'Art Card',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'business_id' => $businessId,
                'name' => 'Duplex Board',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'business_id' => $businessId,
                'name' => 'Newsprint',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'business_id' => $businessId,
                'name' => 'Sticker Paper',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'business_id' => $businessId,
                'name' => 'Board',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
