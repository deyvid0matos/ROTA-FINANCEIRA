<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();

            $table->string('city_origin');
            $table->string('city_destination');

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->text('route_description')->nullable();

            $table->unsignedInteger('km_start')->nullable();
            $table->unsignedInteger('km_end')->nullable();
            $table->unsignedInteger('total_km')->nullable();

            $table->string('km_start_photo_path')->nullable();
            $table->string('km_end_photo_path')->nullable();

            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            $table->integer('extra_minutes')->default(0);

            $table->string('status')->default('draft'); // draft|finished
            $table->timestamp('finished_at')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['employee_profile_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};