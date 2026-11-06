<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('legal_name')->nullable()->after('name');
            $table->string('cnpj', 32)->nullable()->after('legal_name');

            $table->string('state', 2)->nullable()->after('city');
            $table->string('address')->nullable()->after('state');
            $table->string('address_number', 20)->nullable()->after('address');
            $table->string('neighborhood')->nullable()->after('address_number');
            $table->string('zip_code', 20)->nullable()->after('neighborhood');
            $table->string('phone', 40)->nullable()->after('zip_code');
            $table->string('company_email')->nullable()->after('phone');

            $table->string('responsible_name')->nullable()->after('company_email');
            $table->string('responsible_cpf', 32)->nullable()->after('responsible_name');
            $table->string('responsible_email')->nullable()->after('responsible_cpf');

            $table->foreignId('plan_id')->nullable()->after('plan')->constrained('plans');

            $table->timestamp('blocked_at')->nullable()->after('subscription_ends_at');
            $table->string('blocked_reason')->nullable()->after('blocked_at');

            $table->string('logo_path')->nullable()->after('blocked_reason');

            $table->index(['is_active', 'subscription_ends_at']);
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn([
                'legal_name','cnpj','state','address','address_number','neighborhood','zip_code','phone','company_email',
                'responsible_name','responsible_cpf','responsible_email','plan_id','blocked_at','blocked_reason','logo_path'
            ]);
        });
    }
};
