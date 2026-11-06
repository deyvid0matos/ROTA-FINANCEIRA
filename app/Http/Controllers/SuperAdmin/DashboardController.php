<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $now = Carbon::now();

        $companiesTotal = Company::query()->count();
        $companiesActive = Company::query()->where('is_active', true)->count();
        $companiesBlocked = Company::query()->where('is_active', false)->count();
        $companiesExpired = Company::query()->whereNotNull('subscription_ends_at')->where('subscription_ends_at', '<', $now)->count();

        $expiring7 = Company::query()
            ->where('is_active', true)
            ->whereNotNull('subscription_ends_at')
            ->whereBetween('subscription_ends_at', [$now, $now->copy()->addDays(7)])
            ->count();

        $expiring30 = Company::query()
            ->where('is_active', true)
            ->whereNotNull('subscription_ends_at')
            ->whereBetween('subscription_ends_at', [$now, $now->copy()->addDays(30)])
            ->count();

        $usersTotal = User::query()->count();

        $tripsTotal = Trip::query()->count();
        $tripsPendingApproval = Trip::query()->where('approval_status', 'pending')->count();
        $tripsFinishedToday = Trip::query()
            ->whereNotNull('finished_at')
            ->whereBetween('finished_at', [$now->copy()->startOfDay(), $now->copy()->endOfDay()])
            ->count();

        $companiesExpiringSoon = Company::query()
            ->where('is_active', true)
            ->whereNotNull('subscription_ends_at')
            ->whereBetween('subscription_ends_at', [$now, $now->copy()->addDays(30)])
            ->orderBy('subscription_ends_at')
            ->limit(8)
            ->get(['id', 'name', 'subscription_ends_at', 'plan']);

        $companiesBlockedList = Company::query()
            ->where('is_active', false)
            ->latest('blocked_at')
            ->limit(8)
            ->get(['id', 'name', 'blocked_at', 'blocked_reason']);

        return Inertia::render('Super/Dashboard', [
            'metrics' => [
                'companies_total' => $companiesTotal,
                'companies_active' => $companiesActive,
                'companies_blocked' => $companiesBlocked,
                'companies_expired' => $companiesExpired,
                'companies_expiring_7' => $expiring7,
                'companies_expiring_30' => $expiring30,
                'users_total' => $usersTotal,
                'trips_total' => $tripsTotal,
                'trips_pending_approval' => $tripsPendingApproval,
                'trips_finished_today' => $tripsFinishedToday,
            ],
            'alerts' => [
                'expiring_soon' => $companiesExpiringSoon,
                'blocked' => $companiesBlockedList,
            ],
        ]);
    }
}
