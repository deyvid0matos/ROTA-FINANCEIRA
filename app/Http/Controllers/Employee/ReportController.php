<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Trip;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
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

    private function baseQuery(Request $request)
    {
        $companyId = $this->companyId($request);
        $profile = $this->myEmployeeProfile($request);

        $q = Trip::query()
            ->where('company_id', $companyId)
            ->where('employee_profile_id', $profile->id)
            ->with(['employeeProfile:id,full_name', 'vehicle:id,plate,brand,model'])
            ->withSum(['entries as active_entries_sum' => function ($qq) {
                $qq->where('is_active', true);
            }], 'amount')
            ->withSum(['expenses as active_expenses_sum' => function ($qq) {
                $qq->where('is_active', true);
            }], 'amount')
            ->latest('updated_at');

        // filtros
        if ($request->filled('trip_id')) {
            $q->where('id', (int) $request->trip_id);
        }

        if ($request->filled('origin')) {
            $q->where('city_origin', 'like', '%' . $request->origin . '%');
        }

        if ($request->filled('destination')) {
            $q->where('city_destination', 'like', '%' . $request->destination . '%');
        }

        if ($request->filled('date_from')) {
            $q->whereDate('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $q->whereDate('end_date', '<=', $request->date_to);
        }

        if ($request->filled('situation')) {
            $s = $request->situation;

            if ($s === 'draft') $q->where('status', 'draft');
            if ($s === 'pending') $q->where('status', 'finished')->where('approval_status', 'pending');
            if ($s === 'approved') $q->where('approval_status', 'approved');
            if ($s === 'rejected') $q->where('approval_status', 'rejected');
        }

        if ($request->filled('expense_type')) {
            $q->whereHas('expenses', function ($qq) use ($request) {
                $qq->where('type', 'like', '%' . $request->expense_type . '%');
            });
        }

        if ($request->filled('entry_type')) {
            $q->whereHas('entries', function ($qq) use ($request) {
                $qq->where('type', 'like', '%' . $request->entry_type . '%');
            });
        }

        return $q;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'trip_id', 'origin', 'destination',
            'date_from', 'date_to',
            'situation', 'expense_type', 'entry_type',
        ]);

        $trips = $this->baseQuery($request)
            ->paginate(10)
            ->withQueryString();

        $trips->through(function (Trip $t) {
            $ae = (float) ($t->active_entries_sum ?? 0);
            $ax = (float) ($t->active_expenses_sum ?? 0);

            return [
                'id' => $t->id,
                'trip_name' => $t->trip_name,
                'city_origin' => $t->city_origin,
                'city_destination' => $t->city_destination,
                'start_date' => $t->start_date ? $t->start_date->format('d/m/Y') : null,
                'end_date' => $t->end_date ? $t->end_date->format('d/m/Y') : null,
                'status' => $t->status,
                'approval_status' => $t->approval_status,
                'employee_name' => $t->employeeProfile?->full_name,
                'vehicle_label' => $t->vehicle ? trim(($t->vehicle->brand ?? '') . ' ' . ($t->vehicle->model ?? '')) . ' - ' . ($t->vehicle->plate ?? '') : null,
                'totals' => [
                    'active_entries' => number_format($ae, 2, '.', ''),
                    'active_expenses' => number_format($ax, 2, '.', ''),
                    'balance' => number_format($ae - $ax, 2, '.', ''),
                ],
            ];
        });

        return Inertia::render('Employee/Reports/Index', [
            'trips' => $trips,
            'filters' => $filters,
        ]);
    }

    public function pdfSummary(Request $request)
    {
        $filters = $request->only([
            'trip_id', 'origin', 'destination',
            'date_from', 'date_to',
            'situation', 'expense_type', 'entry_type',
        ]);

        $rows = $this->baseQuery($request)->limit(500)->get()->map(function (Trip $t) {
            $ae = (float) ($t->active_entries_sum ?? 0);
            $ax = (float) ($t->active_expenses_sum ?? 0);

            return [
                'id' => $t->id,
                'trip_name' => $t->trip_name,
                'route' => ($t->trip_name ? ($t->trip_name . ' — ') : '') . $t->city_origin . ' → ' . $t->city_destination,
                'dates' => ($t->start_date ? $t->start_date->format('d/m/Y') : '-') . ' → ' . ($t->end_date ? $t->end_date->format('d/m/Y') : '-'),
                'status' => $t->status,
                'approval_status' => $t->approval_status,
                'employee' => $t->employeeProfile?->full_name,
                'vehicle' => $t->vehicle ? trim(($t->vehicle->brand ?? '') . ' ' . ($t->vehicle->model ?? '')) . ' - ' . ($t->vehicle->plate ?? '') : '-',
                'billing_material_amount' => (float) ($t->billing_material_amount ?? 0),
                'active_entries' => $ae,
                'active_expenses' => $ax,
                'balance' => $ae - $ax,
            ];
        })->values()->all();

        $pdf = Pdf::loadView('pdf.reports_summary', [
            'title' => 'Relatório (Resumo)',
            'generatedAt' => now()->format('d/m/Y H:i'),
            'filters' => $filters,
            'rows' => $rows,
        ])->setPaper('A4', 'portrait');

        return $pdf->stream('relatorio-resumo.pdf');
    }

    public function pdfDetailed(Request $request)
    {
        $filters = $request->only([
            'trip_id', 'origin', 'destination',
            'date_from', 'date_to',
            'situation', 'expense_type', 'entry_type',
        ]);

        $trips = $this->baseQuery($request)
            ->with([
                'entries' => fn ($q) => $q->latest(),
                'expenses' => fn ($q) => $q->latest(),
            ])
            ->limit(200)
            ->get();

        $pdf = Pdf::loadView('pdf.reports_detailed', [
    'title' => 'Relatório (Detalhado)',
    'generatedAt' => now()->format('d/m/Y H:i'),
    'filters' => $filters,
    'trips' => $trips,
    'companyLogoPath' => $trips->first()?->company?->logo_path
        ? public_path('storage/'.$trips->first()->company->logo_path)
        : null,
])->setPaper('A4','portrait');

        return $pdf->stream('relatorio-detalhado.pdf');
    }
}