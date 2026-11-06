<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function companyId(Request $request): int
    {
        return (int) $request->user()->company_id;
    }

    private function myEmployeeProfile(Request $request): EmployeeProfile
    {
        $companyId = $this->companyId($request);

        $profile = EmployeeProfile::query()
            ->where('company_id', $companyId)
            ->where('user_id', $request->user()->id)
            ->first();

        abort_if(!$profile, 403, 'Funcionário sem perfil.');
        abort_if(!$profile->is_active, 403, 'Funcionário desativado.');

        return $profile;
    }

    public function __invoke(Request $request)
    {
        $companyId = $this->companyId($request);
        $profile = $this->myEmployeeProfile($request);

        $base = Trip::query()
            ->where('company_id', $companyId)
            ->where('employee_profile_id', $profile->id)
            ->where('is_active', true);

        // Contadores
        $total = (clone $base)->count();

        $draft = (clone $base)
            ->where('status', 'draft')
            ->whereIn('approval_status', ['draft', 'rejected'])
            ->count();

        $pending = (clone $base)
            ->where('status', 'finished')
            ->where('approval_status', 'pending')
            ->count();

        $approved = (clone $base)
            ->where('status', 'finished')
            ->where('approval_status', 'approved')
            ->count();

        $rejected = (clone $base)
            ->where('status', 'draft') // quando reprova você volta pra draft no seu fluxo
            ->where('approval_status', 'rejected')
            ->count();

        $recent = (clone $base)
            ->select(['id','city_origin','city_destination','status','approval_status','start_date','end_date','updated_at'])
            ->latest('updated_at')
            ->limit(8)
            ->get()
            ->map(function (Trip $t) {
                return [
                    'id' => $t->id,
                    'city_origin' => $t->city_origin,
                    'city_destination' => $t->city_destination,
                    'status' => $t->status,
                    'approval_status' => $t->approval_status,
                    'start_date' => $t->start_date ? $t->start_date->format('d/m/Y') : null,
                    'end_date' => $t->end_date ? $t->end_date->format('d/m/Y') : null,
                    'updated_at' => $t->updated_at ? $t->updated_at->format('d/m/Y H:i') : null,
                ];
            });

        return Inertia::render('Employee/Dashboard', [
            'stats' => [
                'total' => $total,
                'draft' => $draft,
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
            ],
            'recent' => $recent,
        ]);
    }
}