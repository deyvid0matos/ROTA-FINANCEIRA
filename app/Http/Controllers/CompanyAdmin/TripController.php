<?php

namespace App\Http\Controllers\CompanyAdmin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TripController extends Controller
{
    private function companyId(Request $request): int
    {
        return (int) $request->user()->company_id;
    }

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $filter = $request->query('status', 'pending');

        $q = Trip::query()
            ->where('company_id', $companyId)
            ->with(['employeeProfile:id,full_name', 'vehicle:id,plate,brand,model'])
            ->latest('updated_at');

        if ($filter === 'live') {
            $q->where('status', 'draft');
        } elseif ($filter === 'pending') {
            $q->where('approval_status', 'pending')
                ->where('status', 'finished');
        } elseif ($filter === 'approved') {
            $q->where('approval_status', 'approved')
                ->where('status', 'finished');
        } elseif ($filter === 'rejected') {
            $q->where('approval_status', 'rejected');
        } else {
            $q->where(function ($qq) {
                $qq->whereIn('approval_status', ['pending', 'approved', 'rejected'])
                    ->orWhere('status', 'finished')
                    ->orWhere('status', 'draft');
            });
        }

        $trips = $q->paginate(10)->withQueryString();

        $trips->through(function (Trip $t) {
            return [
                'id' => $t->id,
                'trip_name' => $t->trip_name,
                'city_origin' => $t->city_origin,
                'city_destination' => $t->city_destination,
                'start_date' => $t->start_date ? $t->start_date->format('d/m/Y') : null,
                'end_date' => $t->end_date ? $t->end_date->format('d/m/Y') : null,
                'total_km' => $t->total_km,
                'status' => $t->status,
                'approval_status' => $t->approval_status,
                'employee_profile' => $t->employeeProfile ? [
                    'id' => $t->employeeProfile->id,
                    'full_name' => $t->employeeProfile->full_name,
                ] : null,
                'vehicle' => $t->vehicle ? [
                    'id' => $t->vehicle->id,
                    'plate' => $t->vehicle->plate,
                    'brand' => $t->vehicle->brand,
                    'model' => $t->vehicle->model,
                ] : null,
            ];
        });

        return Inertia::render('Company/Trips/Index', [
            'trips' => $trips,
            'filter' => $filter,
        ]);
    }

    public function show(Request $request, Trip $trip)
    {
        $companyId = $this->companyId($request);
        abort_if($trip->company_id !== $companyId, 404);

        $trip->load([
            'employeeProfile:id,full_name',
            'vehicle:id,plate,brand,model',
            'expenses' => fn ($q) => $q->latest(),
            'entries' => fn ($q) => $q->latest(),
            'billings' => fn ($q) => $q->latest('billing_date')->latest('id'),
        ]);

        $activeExpenses = (float) $trip->expenses()->where('is_active', true)->sum('amount');
        $allExpenses = (float) $trip->expenses()->sum('amount');

        $activeEntries = (float) $trip->entries()->where('is_active', true)->sum('amount');
        $allEntries = (float) $trip->entries()->sum('amount');

        $balanceActive = $activeEntries - $activeExpenses;
        $activeBillings = (float) $trip->billings()->where('is_active', true)->sum('amount');
        $allBillings = (float) $trip->billings()->sum('amount');

        return Inertia::render('Company/Trips/Show', [
            'trip' => [
                'id' => $trip->id,
                'status' => $trip->status,
                'approval_status' => $trip->approval_status,
                'rejection_reason' => $trip->rejection_reason,

                'trip_name' => $trip->trip_name,
                'city_origin' => $trip->city_origin,
                'city_destination' => $trip->city_destination,

                'start_date' => $trip->start_date ? $trip->start_date->format('d/m/Y') : null,
                'end_date' => $trip->end_date ? $trip->end_date->format('d/m/Y') : null,

                'route_description' => $trip->route_description,
                'km_start' => $trip->km_start,
                'km_end' => $trip->km_end,
                'total_km' => $trip->total_km,
                'extra_minutes' => $trip->extra_minutes,

                'employee' => $trip->employeeProfile,
                'vehicle' => $trip->vehicle,

                'km_start_photo_url' => $trip->km_start_photo_path ? Storage::url($trip->km_start_photo_path) : null,
                'km_end_photo_url' => $trip->km_end_photo_path ? Storage::url($trip->km_end_photo_path) : null,

                'totals' => [
                    'active_entries' => number_format($activeEntries, 2, '.', ''),
                    'all_entries' => number_format($allEntries, 2, '.', ''),
                    'active_expenses' => number_format($activeExpenses, 2, '.', ''),
                    'all_expenses' => number_format($allExpenses, 2, '.', ''),
                    'balance_active' => number_format($balanceActive, 2, '.', ''),
                    'active_billings' => number_format($activeBillings, 2, '.', ''),
                    'all_billings' => number_format($allBillings, 2, '.', ''),
                ],

                'entries' => $trip->entries->map(fn ($e) => [
                    'id' => $e->id,
                    'type' => $e->type,
                    'amount' => (string) $e->amount,
                    'description' => $e->description,
                    'is_active' => $e->is_active,
                    'receipt_url' => $e->receipt_path ? Storage::url($e->receipt_path) : null,
                ]),

                'expenses' => $trip->expenses->map(fn ($e) => [
                    'id' => $e->id,
                    'type' => $e->type,
                    'company_name' => $e->company_name,
                    'amount' => (string) $e->amount,
                    'expense_date' => $e->expense_date ? $e->expense_date->format('d/m/Y') : null,
                    'description' => $e->description,
                    'latitude' => $e->latitude,
                    'longitude' => $e->longitude,
                    'city_name' => $e->city_name,
                    'expense_origin' => $e->expense_origin,
                    'with_helper' => $e->with_helper,
                    'is_active' => $e->is_active,
                    'receipt_url' => $e->receipt_path ? Storage::url($e->receipt_path) : null,
                ]),

                'billings' => $trip->billings->map(fn ($b) => [
                    'id' => $b->id,
                    'billing_date' => $b->billing_date ? $b->billing_date->format('d/m/Y') : null,
                    'description' => $b->description,
                    'amount' => (string) $b->amount,
                    'notes' => $b->notes,
                    'is_active' => $b->is_active,
                ]),
            ],
        ]);
    }

    public function approve(Request $request, Trip $trip)
    {
        $companyId = $this->companyId($request);
        abort_if($trip->company_id !== $companyId, 404);

        abort_if($trip->status !== 'finished', 403, 'A viagem precisa estar finalizada para aprovar.');
        abort_if($trip->approval_status !== 'pending', 403, 'A viagem não está pendente.');

        $trip->update([
            'approval_status' => 'approved',
            'approved_at' => Carbon::now(),
            'approved_by' => $request->user()->id,
            'rejected_at' => null,
            'rejected_by' => null,
            'rejection_reason' => null,
        ]);

        return back()->with('ok', 'Viagem aprovada.');
    }

    public function reject(Request $request, Trip $trip)
    {
        $companyId = $this->companyId($request);
        abort_if($trip->company_id !== $companyId, 404);

        abort_if($trip->status !== 'finished', 403, 'A viagem precisa estar finalizada para reprovar.');
        abort_if($trip->approval_status !== 'pending', 403, 'A viagem não está pendente.');

        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $trip->update([
            'approval_status' => 'rejected',
            'rejected_at' => Carbon::now(),
            'rejected_by' => $request->user()->id,
            'rejection_reason' => $data['rejection_reason'],
            'status' => 'draft',
            'finished_at' => null,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return back()->with('ok', 'Viagem reprovada e devolvida para correção.');
    }

    public function reopen(Request $request, Trip $trip)
    {
        $companyId = $this->companyId($request);
        abort_if($trip->company_id !== $companyId, 404);

        abort_if($trip->status !== 'finished', 403, 'A viagem precisa estar finalizada.');
        abort_if(!in_array($trip->approval_status, ['approved', 'rejected'], true), 403, 'A viagem não está aprovada/reprovada.');

        $trip->update([
            'approval_status' => 'pending',
            'approved_at' => null,
            'approved_by' => null,
            'rejected_at' => null,
            'rejected_by' => null,
            'rejection_reason' => null,
        ]);

        return back()->with('ok', 'Aprovação reaberta. Viagem voltou para pendente.');
    }

    public function pdf(Request $request, Trip $trip)
    {
        $companyId = $this->companyId($request);
        abort_if($trip->company_id !== $companyId, 404);

        $trip->load([
            'vehicle:id,plate,brand,model',
            'employeeProfile:id,full_name',
            'company:id,name,logo_path',
            'expenses' => fn ($q) => $q->latest(),
            'entries' => fn ($q) => $q->latest(),
            'billings' => fn ($q) => $q->latest('billing_date')->latest('id'),
        ]);

        $activeExpenses = (float) $trip->expenses()->where('is_active', true)->sum('amount');
        $allExpenses = (float) $trip->expenses()->sum('amount');
        $activeEntries = (float) $trip->entries()->where('is_active', true)->sum('amount');
        $allEntries = (float) $trip->entries()->sum('amount');
        $balanceActive = $activeEntries - $activeExpenses;
        $activeBillings = (float) $trip->billings()->where('is_active', true)->sum('amount');
        $allBillings = (float) $trip->billings()->sum('amount');

        $companyLogoPath = null;
        if ($trip->company?->logo_path) {
            $abs = public_path('storage/' . $trip->company->logo_path);
            if (is_file($abs)) {
                $companyLogoPath = $abs;
            }
        }

        $kmStartImagePath = null;
        if ($trip->km_start_photo_path) {
            $ext = strtolower(pathinfo($trip->km_start_photo_path, PATHINFO_EXTENSION));
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                $kmStartImagePath = public_path('storage/' . $trip->km_start_photo_path);
            }
        }

        $kmEndImagePath = null;
        if ($trip->km_end_photo_path) {
            $ext = strtolower(pathinfo($trip->km_end_photo_path, PATHINFO_EXTENSION));
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                $kmEndImagePath = public_path('storage/' . $trip->km_end_photo_path);
            }
        }

        $receiptImages = [];
        $receiptPdfs = [];

        $entries = $trip->entries->map(function ($e) use (&$receiptImages, &$receiptPdfs) {
            $receiptPublicUrl = $e->receipt_path ? Storage::url($e->receipt_path) : null;
            $kind = null;

            if ($e->receipt_path) {
                $ext = strtolower(pathinfo($e->receipt_path, PATHINFO_EXTENSION));

                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                    $kind = 'image';
                    $receiptImages[] = [
                        'title' => "Entrada: {$e->type} — R$ " . number_format((float) $e->amount, 2, ',', '.'),
                        'abs_path' => public_path('storage/' . $e->receipt_path),
                    ];
                } elseif ($ext === 'pdf') {
                    $kind = 'pdf';
                    $receiptPdfs[] = [
                        'title' => "Entrada: {$e->type} — R$ " . number_format((float) $e->amount, 2, ',', '.'),
                        'public_url' => $receiptPublicUrl,
                    ];
                }
            }

            return [
                'id' => $e->id,
                'type' => $e->type,
                'amount' => (string) $e->amount,
                'description' => $e->description,
                'is_active' => (bool) $e->is_active,
                'receipt_kind' => $kind,
                'receipt_public_url' => $receiptPublicUrl,
            ];
        })->all();

        $expenses = $trip->expenses->map(function ($e) use (&$receiptImages, &$receiptPdfs) {
            $receiptPublicUrl = $e->receipt_path ? Storage::url($e->receipt_path) : null;
            $kind = null;

            if ($e->receipt_path) {
                $ext = strtolower(pathinfo($e->receipt_path, PATHINFO_EXTENSION));

                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                    $kind = 'image';
                    $receiptImages[] = [
                        'title' => "Despesa: {$e->type} — R$ " . number_format((float) $e->amount, 2, ',', '.'),
                        'abs_path' => public_path('storage/' . $e->receipt_path),
                    ];
                } elseif ($ext === 'pdf') {
                    $kind = 'pdf';
                    $receiptPdfs[] = [
                        'title' => "Despesa: {$e->type} — R$ " . number_format((float) $e->amount, 2, ',', '.'),
                        'public_url' => $receiptPublicUrl,
                    ];
                }
            }

            return [
                'id' => $e->id,
                'type' => $e->type,
                'company_name' => $e->company_name,
                'amount' => (string) $e->amount,
                'expense_date' => $e->expense_date ? $e->expense_date->format('d/m/Y') : null,
                'description' => $e->description,
                'latitude' => $e->latitude,
                'longitude' => $e->longitude,
                'city_name' => $e->city_name,
                'is_active' => (bool) $e->is_active,
                'receipt_kind' => $kind,
                'receipt_public_url' => $receiptPublicUrl,
            ];
        })->all();

        $billings = $trip->billings->map(fn ($b) => [
            'id' => $b->id,
            'billing_date' => $b->billing_date ? $b->billing_date->format('d/m/Y') : null,
            'description' => $b->description,
            'amount' => (string) $b->amount,
            'notes' => $b->notes,
            'is_active' => (bool) $b->is_active,
        ])->all();

        $vehicleLabel = null;
        if ($trip->vehicle) {
            $model = trim(($trip->vehicle->brand ?? '') . ' ' . ($trip->vehicle->model ?? ''));
            $plate = $trip->vehicle->plate ?? '';
            $vehicleLabel = trim($model) !== '' ? ($model . ' - ' . $plate) : $plate;
        }

        $pdf = Pdf::loadView('pdf.trip', [
            'trip' => $trip,
            'companyName' => $trip->company?->name,
            'companyLogoPath' => $companyLogoPath,
            'employeeName' => $trip->employeeProfile?->full_name,
            'vehicleLabel' => $vehicleLabel,
            'activeEntries' => $activeEntries,
            'allEntries' => $allEntries,
            'activeExpenses' => $activeExpenses,
            'allExpenses' => $allExpenses,
            'balanceActive' => $balanceActive,
            'activeBillings' => $activeBillings,
            'allBillings' => $allBillings,
            'entries' => $entries,
            'expenses' => $expenses,
            'billings' => $billings,
            'kmStartImagePath' => $kmStartImagePath,
            'kmEndImagePath' => $kmEndImagePath,
            'receiptImages' => $receiptImages,
            'receiptPdfs' => $receiptPdfs,
        ])->setPaper('A4', 'portrait');

        return $pdf->stream("viagem-{$trip->id}.pdf");
    }
}