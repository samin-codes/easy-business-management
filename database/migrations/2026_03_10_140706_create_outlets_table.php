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
        Schema::create('outlets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('mobile');
            $table->string('email')->nullable();
            $table->string('outlet_type')->nullable();
            $table->text('address_line')->nullable();
            $table->string('district')->nullable();
            $table->string('area_type')->nullable();
            $table->string('area_name')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('status');
            $table->timestamps();

            $table->index('business_id');
            $table->index('name');
            $table->index('code');
            $table->unique(['business_id', 'code']);
        });

        $this->seed();
    }

    private function seed(): void
    {
        $now = now();

        DB::table('outlets')->insert([
            [
                'business_id' => 1,
                'name' => 'Pragati Enterprise',
                'code' => 'PE01',
                'mobile' => '01711475908',
                'outlet_type' => 'shop',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    private function seed(): void
    {
        $now = now();

        DB::table('outlets')->insert([
            [
                'business_id' => 1,
                'name' => 'Pragati Enterprise',
                'mobile' => '01711475908',
                'outlet_type' => 'shop',
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
        Schema::dropIfExists('outlets');
    }
};
