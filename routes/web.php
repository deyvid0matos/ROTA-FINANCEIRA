<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Account\UnlockController as AccountUnlockController;
use App\Http\Controllers\SuperAdmin\CompanyController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperDashboardController;
use App\Http\Controllers\SuperAdmin\PlanController;

use App\Http\Controllers\CompanyAdmin\EmployeeController;
use App\Http\Controllers\CompanyAdmin\VehicleController;
use App\Http\Controllers\CompanyAdmin\TripController as CompanyTripController;
use App\Http\Controllers\CompanyAdmin\TripEntryController as CompanyTripEntryController;
use App\Http\Controllers\CompanyAdmin\TripBillingController as CompanyTripBillingController;

use App\Http\Controllers\Employee\TripController as EmployeeTripController;
use App\Http\Controllers\Employee\ExpenseController as EmployeeExpenseController;
use App\Http\Controllers\Employee\EntryController as EmployeeEntryController;
use App\Http\Controllers\Employee\TripBillingController as EmployeeTripBillingController;
use App\Http\Controllers\Employee\DashboardController as EmployeeDashboardController;

Route::get('/', function () {
    return redirect()->route('login');
});

// telas públicas de bloqueio
Route::get('/account/blocked', fn () => Inertia::render('Account/Blocked'))->name('account.blocked');
Route::get('/account/expired', fn () => Inertia::render('Account/Expired'))->name('account.expired');

Route::middleware(['auth', 'verified', 'user.active'])->group(function () {

    // ===== CHAVE DE DESBLOQUEIO (sem exigir account.active) =====
    Route::get('/account/unlock', [AccountUnlockController::class, 'show'])->name('account.unlock');
    Route::post('/account/unlock', [AccountUnlockController::class, 'store'])->name('account.unlock.store');

    // ===== PROFILE (Breeze) =====
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ===== DASHBOARD ROUTER =====
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/Router');
    })->name('dashboard');

    // ===== SUPER ADMIN =====
    Route::middleware(['role:super_admin'])->group(function () {
        Route::get('/super/dashboard', SuperDashboardController::class)->name('super.dashboard');

        // Planos
        Route::get('/super/plans', [PlanController::class, 'index'])->name('super.plans.index');
        Route::get('/super/plans/create', [PlanController::class, 'create'])->name('super.plans.create');
        Route::post('/super/plans', [PlanController::class, 'store'])->name('super.plans.store');
        Route::get('/super/plans/{plan}/edit', [PlanController::class, 'edit'])->name('super.plans.edit');
        Route::put('/super/plans/{plan}', [PlanController::class, 'update'])->name('super.plans.update');

        // Empresas
        Route::get('/super/companies', [CompanyController::class, 'index'])->name('super.companies.index');
        Route::get('/super/companies/create', [CompanyController::class, 'create'])->name('super.companies.create');
        Route::post('/super/companies', [CompanyController::class, 'store'])->name('super.companies.store');

        Route::get('/super/companies/{company}/edit', [CompanyController::class, 'edit'])->name('super.companies.edit');
        Route::put('/super/companies/{company}', [CompanyController::class, 'update'])->name('super.companies.update');

        // Botões
        Route::post('/super/companies/{company}/activate', [CompanyController::class, 'activate'])->name('super.companies.activate');
        Route::post('/super/companies/{company}/deactivate', [CompanyController::class, 'deactivate'])->name('super.companies.deactivate');

        // Criar gerente
        Route::post('/super/companies/{company}/create-admin', [CompanyController::class, 'createAdmin'])->name('super.companies.createAdmin');

        // Chave
        Route::post('/super/companies/{company}/unlock-key', [CompanyController::class, 'generateUnlockKey'])->name('super.companies.unlockKey');

        // GERENTES: ativar / desativar / excluir
        Route::post('/super/companies/{company}/admins/{user}/activate', [CompanyController::class, 'activateAdmin'])
            ->name('super.companies.admins.activate');

        Route::post('/super/companies/{company}/admins/{user}/deactivate', [CompanyController::class, 'deactivateAdmin'])
            ->name('super.companies.admins.deactivate');

        Route::delete('/super/companies/{company}/admins/{user}', [CompanyController::class, 'destroyAdmin'])
            ->name('super.companies.admins.destroy');
    });

    // ===== COMPANY ADMIN =====
    Route::middleware(['role:company_admin', 'account.active'])->group(function () {
        Route::get('/company/dashboard', fn () => Inertia::render('Company/Dashboard'))->name('company.dashboard');

        // Employees
        Route::get('/company/employees', [EmployeeController::class, 'index'])->name('company.employees.index');
        Route::get('/company/employees/create', [EmployeeController::class, 'create'])->name('company.employees.create');
        Route::post('/company/employees', [EmployeeController::class, 'store'])->name('company.employees.store');
        Route::get('/company/employees/{employee}/edit', [EmployeeController::class, 'edit'])->name('company.employees.edit');
        Route::put('/company/employees/{employee}', [EmployeeController::class, 'update'])->name('company.employees.update');
        Route::post('/company/employees/{employee}/activate', [EmployeeController::class, 'activate'])->name('company.employees.activate');
        Route::post('/company/employees/{employee}/deactivate', [EmployeeController::class, 'deactivate'])->name('company.employees.deactivate');

        // Vehicles
        Route::get('/company/vehicles', [VehicleController::class, 'index'])->name('company.vehicles.index');
        Route::get('/company/vehicles/create', [VehicleController::class, 'create'])->name('company.vehicles.create');
        Route::post('/company/vehicles', [VehicleController::class, 'store'])->name('company.vehicles.store');
        Route::get('/company/vehicles/{vehicle}/edit', [VehicleController::class, 'edit'])->name('company.vehicles.edit');
        Route::put('/company/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('company.vehicles.update');
        Route::post('/company/vehicles/{vehicle}/activate', [VehicleController::class, 'activate'])->name('company.vehicles.activate');
        Route::post('/company/vehicles/{vehicle}/deactivate', [VehicleController::class, 'deactivate'])->name('company.vehicles.deactivate');

        // Trips
        Route::get('/company/trips', [CompanyTripController::class, 'index'])->name('company.trips.index');
        Route::get('/company/trips/{trip}', [CompanyTripController::class, 'show'])->name('company.trips.show');

        // Aprovação
        Route::post('/company/trips/{trip}/approve', [CompanyTripController::class, 'approve'])->name('company.trips.approve');
        Route::post('/company/trips/{trip}/reject', [CompanyTripController::class, 'reject'])->name('company.trips.reject');
        Route::post('/company/trips/{trip}/reopen', [CompanyTripController::class, 'reopen'])->name('company.trips.reopen');

        // PDF
        Route::get('/company/trips/{trip}/pdf', [CompanyTripController::class, 'pdf'])->name('company.trips.pdf');

        // NOVO: entradas lançadas pelo gerente dentro da viagem
        Route::post('/company/trips/{trip}/entries', [CompanyTripEntryController::class, 'store'])->name('company.entries.store');

        // NOVO: edição de faturamento pelo gerente
        Route::put('/company/billings/{billing}', [CompanyTripBillingController::class, 'update'])->name('company.billings.update');

        // Reports (Company Admin)
        Route::get('/company/reports', [\App\Http\Controllers\CompanyAdmin\ReportController::class, 'index'])
            ->name('company.reports.index');

        Route::get('/company/reports/pdf/summary', [\App\Http\Controllers\CompanyAdmin\ReportController::class, 'pdfSummary'])
            ->name('company.reports.pdf.summary');

        Route::get('/company/reports/pdf/detailed', [\App\Http\Controllers\CompanyAdmin\ReportController::class, 'pdfDetailed'])
            ->name('company.reports.pdf.detailed');
    });

    // ===== EMPLOYEE =====
    Route::middleware(['role:employee', 'account.active'])->group(function () {
        Route::get('/employee/dashboard', EmployeeDashboardController::class)->name('employee.dashboard');

        // Trips
        Route::get('/employee/trips', [EmployeeTripController::class, 'index'])->name('employee.trips.index');
        Route::get('/employee/trips/create', [EmployeeTripController::class, 'create'])->name('employee.trips.create');
        Route::post('/employee/trips', [EmployeeTripController::class, 'store'])->name('employee.trips.store');

        Route::get('/employee/trips/{trip}', [EmployeeTripController::class, 'show'])->name('employee.trips.show');
        Route::put('/employee/trips/{trip}', [EmployeeTripController::class, 'update'])->name('employee.trips.update');

        Route::post('/employee/trips/{trip}/finish', [EmployeeTripController::class, 'finish'])->name('employee.trips.finish');

        // PDF
        Route::get('/employee/trips/{trip}/pdf', [EmployeeTripController::class, 'pdf'])->name('employee.trips.pdf');

        // Despesas
        Route::post('/employee/trips/{trip}/expenses', [EmployeeExpenseController::class, 'store'])->name('employee.expenses.store');
        Route::post('/employee/expenses/{expense}/activate', [EmployeeExpenseController::class, 'activate'])->name('employee.expenses.activate');
        Route::post('/employee/expenses/{expense}/deactivate', [EmployeeExpenseController::class, 'deactivate'])->name('employee.expenses.deactivate');
        Route::delete('/employee/expenses/{expense}', [EmployeeExpenseController::class, 'destroy'])->name('employee.expenses.destroy');

        // Entradas
        Route::post('/employee/trips/{trip}/entries', [EmployeeEntryController::class, 'store'])->name('employee.entries.store');
        Route::post('/employee/entries/{entry}/activate', [EmployeeEntryController::class, 'activate'])->name('employee.entries.activate');
        Route::post('/employee/entries/{entry}/deactivate', [EmployeeEntryController::class, 'deactivate'])->name('employee.entries.deactivate');
        Route::delete('/employee/entries/{entry}', [EmployeeEntryController::class, 'destroy'])->name('employee.entries.destroy');

        // Faturamento posterior
        Route::post('/employee/trips/{trip}/billings', [EmployeeTripBillingController::class, 'store'])->name('employee.billings.store');
        Route::post('/employee/billings/{billing}/activate', [EmployeeTripBillingController::class, 'activate'])->name('employee.billings.activate');
        Route::post('/employee/billings/{billing}/deactivate', [EmployeeTripBillingController::class, 'deactivate'])->name('employee.billings.deactivate');
        Route::delete('/employee/billings/{billing}', [EmployeeTripBillingController::class, 'destroy'])->name('employee.billings.destroy');

        // Reports (Employee)
        Route::get('/employee/reports', [\App\Http\Controllers\Employee\ReportController::class, 'index'])
            ->name('employee.reports.index');

        Route::get('/employee/reports/pdf/summary', [\App\Http\Controllers\Employee\ReportController::class, 'pdfSummary'])
            ->name('employee.reports.pdf.summary');

        Route::get('/employee/reports/pdf/detailed', [\App\Http\Controllers\Employee\ReportController::class, 'pdfDetailed'])
            ->name('employee.reports.pdf.detailed');
    });
});

require __DIR__ . '/auth.php';