<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();

            $table->string('type'); // combustível, alimentação, etc
            $table->string('company_name')->nullable(); // prestadora / empresa
            $table->decimal('amount', 10, 2);

            $table->text('description')->nullable();

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('receipt_path')->nullable(); // imagem/pdf

            $table->string('expense_origin')->default('company'); // company|service
            $table->boolean('with_helper')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['trip_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};