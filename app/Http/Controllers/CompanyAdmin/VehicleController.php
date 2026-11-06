<?php

namespace App\Http\Controllers\CompanyAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VehicleController extends Controller
{
    private function companyId(Request $request): int
    {
        return (int) $request->user()->company_id;
    }

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);

        $vehicles = Vehicle::query()
            ->where('company_id', $companyId)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Company/Vehicles/Index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function create()
    {
        return Inertia::render('Company/Vehicles/Create');
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);

        $data = $request->validate([
            'type' => ['required', Rule::in(['car','moto'])],
            'brand' => ['nullable','string','max:80'],
            'model' => ['nullable','string','max:80'],
            'color' => ['nullable','string','max:40'],
            'plate' => ['required','string','max:20', Rule::unique('vehicles','plate')->where('company_id', $companyId)],
            'km_current' => ['required','integer','min:0'],
        ]);

        Vehicle::create([
            'company_id' => $companyId,
            'type' => $data['type'],
            'brand' => $data['brand'] ?? null,
            'model' => $data['model'] ?? null,
            'color' => $data['color'] ?? null,
            'plate' => $data['plate'],
            'km_current' => (int)$data['km_current'],
            'is_active' => true,
        ]);

        return redirect()->route('company.vehicles.index')->with('ok', 'Veículo criado.');
    }

    public function edit(Request $request, Vehicle $vehicle)
    {
        $companyId = $this->companyId($request);
        abort_if($vehicle->company_id !== $companyId, 404);

        return Inertia::render('Company/Vehicles/Edit', [
            'vehicle' => $vehicle->only(['id','type','brand','model','color','plate','km_current','is_active']),
        ]);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $companyId = $this->companyId($request);
        abort_if($vehicle->company_id !== $companyId, 404);

        $data = $request->validate([
            'type' => ['required', Rule::in(['car','moto'])],
            'brand' => ['nullable','string','max:80'],
            'model' => ['nullable','string','max:80'],
            'color' => ['nullable','string','max:40'],
            'plate' => ['required','string','max:20', Rule::unique('vehicles','plate')->where('company_id', $companyId)->ignore($vehicle->id)],
            'km_current' => ['required','integer','min:0'],
        ]);

        $vehicle->update($data);

        return back()->with('ok', 'Veículo atualizado.');
    }

    public function activate(Request $request, Vehicle $vehicle)
    {
        $companyId = $this->companyId($request);
        abort_if($vehicle->company_id !== $companyId, 404);

        $vehicle->update(['is_active' => true]);
        return back()->with('ok', 'Veículo ativado.');
    }

    public function deactivate(Request $request, Vehicle $vehicle)
    {
        $companyId = $this->companyId($request);
        abort_if($vehicle->company_id !== $companyId, 404);

        $vehicle->update(['is_active' => false]);
        return back()->with('ok', 'Veículo desativado.');
    }
}