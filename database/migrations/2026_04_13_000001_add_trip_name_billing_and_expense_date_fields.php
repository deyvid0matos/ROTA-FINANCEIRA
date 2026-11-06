<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            if (!Schema::hasColumn('trips', 'trip_name')) {
                $table->string('trip_name')->nullable()->after('vehicle_id');
            }

            if (!Schema::hasColumn('trips', 'billing_material_description')) {
                $table->text('billing_material_description')->nullable()->after('route_description');
            }

            if (!Schema::hasColumn('trips', 'billing_material_amount')) {
                $table->decimal('billing_material_amount', 10, 2)->nullable()->after('billing_material_description');
            }
        });

        Schema::table('expenses', function (Blueprint $table) {
            if (!Schema::hasColumn('expenses', 'expense_date')) {
                $table->date('expense_date')->nullable()->after('amount');
            }

            if (!Schema::hasColumn('expenses', 'city_name')) {
                $table->string('city_name')->nullable()->after('longitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (Schema::hasColumn('expenses', 'expense_date')) {
                $table->dropColumn('expense_date');
            }

            if (Schema::hasColumn('expenses', 'city_name')) {
                $table->dropColumn('city_name');
            }
        });

        Schema::table('trips', function (Blueprint $table) {
            if (Schema::hasColumn('trips', 'trip_name')) {
                $table->dropColumn('trip_name');
            }

            if (Schema::hasColumn('trips', 'billing_material_description')) {
                $table->dropColumn('billing_material_description');
            }

            if (Schema::hasColumn('trips', 'billing_material_amount')) {
                $table->dropColumn('billing_material_amount');
            }
        });
    }
};
