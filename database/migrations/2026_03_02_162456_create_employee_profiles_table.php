<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('full_name');
            $table->string('cpf')->nullable();
            $table->string('phone')->nullable();
            $table->date('birth_date')->nullable();

            $table->string('job_title')->nullable();
            $table->boolean('can_travel')->default(false);

            $table->string('cnh_number')->nullable();
            $table->string('cnh_type')->nullable();
            $table->date('cnh_expiration')->nullable();

            $table->time('work_start')->nullable();
            $table->time('lunch_start')->nullable();
            $table->time('lunch_end')->nullable();
            $table->time('work_end')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique('user_id');
            $table->index(['company_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};