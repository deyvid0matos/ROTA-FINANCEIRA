<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Trip;
use App\Models\Vehicle;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class TripController extends Controller
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

    private function freshTripForEmployee(Request $request, int $tripId, array $with = []): Trip
    {
        $companyId = $this->companyId($request);
        $profile = $this->myEmployeeProfile($request);

        $trip = Trip::query()
            ->where('id', $tripId)
            ->where('company_id', $companyId)
            ->where('employee_profile_id', $profile->id)
            ->with($with)
            ->first();

        abort_if(!$trip, 404);

        return $trip;
    }

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $profile = $this->myEmployeeProfile($request);

        $query = Trip::query()
            ->where('company_id', $companyId)
            ->where('employee_profile_id', $profile->id);

        if ($request->filled('origin')) {
            $query->where('city_origin', 'like', '%' . $request->origin . '%');
        }

        if ($request->filled('destination')) {
            $query->where('city_destination', 'like', '%' . $request->destination . '%');
        }

        if ($request->filled('description')) {
            $query->where(function ($qq) use ($request) {
                $qq->where('trip_name', 'like', '%' . $request->description . '%')
                    ->orWhere('route_description', 'like', '%' . $request->description . '%');
            });
        }

        if ($request->filled('situation')) {
            if ($request->situation === 'draft') {
                $query->where('status', 'draft');
            }

            if ($request->situation === 'pending') {
                $query->where('status', 'finished')->where('approval_status', 'pending');
            }

            if ($request->situation === 'approved') {
                $query->where('approval_status', 'approved');
            }

            if ($request->situation === 'rejected') {
                $query->where('approval_status', 'rejected');
            }
        }

        $trips = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $trips->through(function (Trip $t) {
            return [
                'id' => $t->id,
                'trip_name' => $t->trip_name,
                'city_origin' => $t->city_origin,
                'city_destination' => $t->city_destination,
                'start_date' => $t->start_date ? $t->start_date->format('d/m/Y') : null,
                'end_date' => $t->end_date ? $t->end_date->format('d/m/Y') : null,
                'status' => $t->status,
                'approval_status' => $t->approval_status,
            ];
        });

        return Inertia::render('Employee/Trips/Index', [
            'trips' => $trips,
            'filters' => $request->only(['origin', 'destination', 'description', 'situation']),
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $this->companyId($request);

        $vehicles = Vehicle::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->select(['id', 'plate', 'brand', 'model', 'type'])
            ->orderBy('plate')
            ->get();

        return Inertia::render('Employee/Trips/Create', [
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);
        $profile = $this->myEmployeeProfile($request);

        $data = $request->validate([
            'vehicle_id' => ['nullable', Rule::exists('vehicles', 'id')->where('company_id', $companyId)],
            'trip_name' => ['nullable', 'string', 'max:160'],
            'city_origin' => ['required', 'string', 'max:120'],
            'city_destination' => ['required', 'string', 'max:120'],
        ]);

        $trip = Trip::create([
            'company_id' => $companyId,
            'employee_profile_id' => $profile->id,
            'vehicle_id' => $data['vehicle_id'] ?? null,
            'trip_name' => $data['trip_name'] ?? null,
            'city_origin' => $data['city_origin'],
            'city_destination' => $data['city_destination'],
            'status' => 'draft',
            'approval_status' => 'draft',
            'is_active' => true,
        ]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Viagem criada (rascunho).');
    }

    public function show(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForEmployee($request, $trip->id, [
            'vehicle:id,plate,brand,model,type',
            'expenses' => fn ($q) => $q->latest('id'),
            'entries' => fn ($q) => $q->latest('id'),
            'billings' => fn ($q) => $q->latest('billing_date')->latest('id'),
        ]);

        $activeExpenses = (float) $trip->expenses()->where('is_active', true)->sum('amount');
        $allExpenses = (float) $trip->expenses()->sum('amount');

        $activeEntries = (float) $trip->entries()->where('is_active', true)->sum('amount');
        $allEntries = (float) $trip->entries()->sum('amount');

        $balanceActive = $activeEntries - $activeExpenses;
        $activeBillings = (float) $trip->billings()->where('is_active', true)->sum('amount');
        $allBillings = (float) $trip->billings()->sum('amount');

        return Inertia::render('Employee/Trips/Show', [
            'trip' => [
                'id' => $trip->id,
                'status' => $trip->status,
                'approval_status' => $trip->approval_status,
                'rejection_reason' => $trip->rejection_reason,
                'is_active' => $trip->is_active,

                'trip_name' => $trip->trip_name,
                'city_origin' => $trip->city_origin,
                'city_destination' => $trip->city_destination,

                'start_date' => $trip->start_date ? $trip->start_date->toDateString() : null,
                'end_date' => $trip->end_date ? $trip->end_date->toDateString() : null,

                'route_description' => $trip->route_description,
                'km_start' => $trip->km_start,
                'km_end' => $trip->km_end,
                'total_km' => $trip->total_km,
                'extra_minutes' => $trip->extra_minutes,

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
                ])->values(),

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
                ])->values(),

                'billings' => $trip->billings->map(fn ($b) => [
                    'id' => $b->id,
                    'billing_date' => $b->billing_date ? $b->billing_date->format('d/m/Y') : null,
                    'description' => $b->description,
                    'amount' => (string) $b->amount,
                    'notes' => $b->notes,
                    'is_active' => $b->is_active,
                ])->values(),
            ],
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForEmployee($request, $trip->id);

        abort_if($trip->status !== 'draft', 403, 'Viagem finalizada não pode ser editada pelo funcionário.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Viagem enviada para aprovação não pode ser editada.');

        $companyId = $this->companyId($request);

        $data = $request->validate([
            'vehicle_id' => ['nullable', Rule::exists('vehicles', 'id')->where('company_id', $companyId)],
            'trip_name' => ['nullable', 'string', 'max:160'],
            'city_origin' => ['required', 'string', 'max:120'],
            'city_destination' => ['required', 'string', 'max:120'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'route_description' => ['nullable', 'string'],
            'km_start' => ['nullable', 'integer', 'min:0'],
            'km_end' => ['nullable', 'integer', 'min:0'],
            'km_start_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:20480'],
            'km_end_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:20480'],
        ]);

        $kmStart = array_key_exists('km_start', $data) ? $data['km_start'] : null;
        $kmEnd = array_key_exists('km_end', $data) ? $data['km_end'] : null;

        if ($kmStart !== null && $kmEnd !== null && (int) $kmEnd < (int) $kmStart) {
            return redirect()
                ->route('employee.trips.show', $trip->id)
                ->withErrors([
                    'km_end' => 'O KM final não pode ser menor que o KM inicial.',
                ]);
        }

        $kmStartPath = $trip->km_start_photo_path;
        $kmEndPath = $trip->km_end_photo_path;

        if ($request->hasFile('km_start_photo')) {
            $kmStartPath = $request->file('km_start_photo')->store("trips/{$trip->id}/km", 'public');
        }

        if ($request->hasFile('km_end_photo')) {
            $kmEndPath = $request->file('km_end_photo')->store("trips/{$trip->id}/km", 'public');
        }

        $totalKm = ($kmStart !== null && $kmEnd !== null && (int) $kmEnd >= (int) $kmStart)
            ? ((int) $kmEnd - (int) $kmStart)
            : null;

        $trip->update([
            'vehicle_id' => $data['vehicle_id'] ?? null,
            'trip_name' => $data['trip_name'] ?? null,
            'city_origin' => $data['city_origin'],
            'city_destination' => $data['city_destination'],
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'route_description' => $data['route_description'] ?? null,
            'km_start' => $kmStart,
            'km_end' => $kmEnd,
            'total_km' => $totalKm,
            'km_start_photo_path' => $kmStartPath,
            'km_end_photo_path' => $kmEndPath,
            'start_time' => null,
            'end_time' => null,
        ]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Viagem atualizada.');
    }

    public function finish(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForEmployee($request, $trip->id);

        abort_if($trip->status !== 'draft', 403, 'Viagem já foi finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Viagem já foi enviada para aprovação.');

        if (!$trip->start_date || !$trip->end_date) {
            return redirect()
                ->route('employee.trips.show', $trip->id)
                ->withErrors([
                    'finish' => 'Informe datas de início e fim antes de finalizar.',
                ]);
        }

        $trip->update([
            'status' => 'finished',
            'finished_at' => Carbon::now(),
            'approval_status' => 'pending',
            'approved_at' => null,
            'approved_by' => null,
            'rejected_at' => null,
            'rejected_by' => null,
            'rejection_reason' => null,
        ]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Viagem enviada para aprovação.');
    }

    public function pdf(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForEmployee($request, $trip->id, [
            'vehicle:id,plate,brand,model',
            'employeeProfile:id,full_name',
            'company:id,name,logo_path',
            'expenses' => fn ($q) => $q->latest('id'),
            'entries' => fn ($q) => $q->latest('id'),
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

        $filename = "viagem-{$trip->id}.pdf";

        return response($pdf->output(), Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}