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
        Schema::create('product_grade_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('symbol');
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index('status');
        });

        $this->seed();
    }

    private function seed(): void
    {
        $now = now();

        DB::table('product_grade_units')->insertOrIgnore([
            [
                'name' => 'Grams per Square Meter',
                'code' => 'GSM',
                'symbol' => 'gsm',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ounce',
                'code' => 'OZ',
                'symbol' => 'oz',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Millimeter',
                'code' => 'MM',
                'symbol' => 'mm',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ply',
                'code' => 'PLY',
                'symbol' => 'ply',
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
        Schema::dropIfExists('product_grade_units');
    }
};
