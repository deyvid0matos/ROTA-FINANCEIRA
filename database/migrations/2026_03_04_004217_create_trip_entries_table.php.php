<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trip_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();

            $table->string('type'); // saldo inicial, reembolso, etc
            $table->decimal('amount', 10, 2);

            $table->text('description')->nullable();

            $table->string('receipt_path')->nullable(); // imagem/pdf
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['trip_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_entries');
    }
};