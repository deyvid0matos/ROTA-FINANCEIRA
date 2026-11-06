<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Trip;
use App\Models\TripBilling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TripBillingController extends Controller
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

    private function freshTripForBilling(Request $request, int $tripId): Trip
    {
        $companyId = $this->companyId($request);
        $profile = $this->myEmployeeProfile($request);

        $trip = Trip::query()
            ->where('id', $tripId)
            ->where('company_id', $companyId)
            ->where('employee_profile_id', $profile->id)
            ->first();

        abort_if(!$trip, 404);

        return $trip;
    }

    private function normalizeMoney(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = trim((string) $value);

        if (str_contains($value, ',') && str_contains($value, '.')) {
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);

            return $value;
        }

        return str_replace(',', '.', $value);
    }

    public function store(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForBilling($request, $trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível adicionar item de faturamento em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível adicionar item de faturamento em viagem enviada para aprovação.');

        $payload = [
            'billing_date' => $request->input('billing_date'),
            'description' => $request->input('description'),
            'amount' => $this->normalizeMoney($request->input('amount')),
            'notes' => $request->input('notes'),
        ];

        $data = Validator::make($payload, [
            'billing_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ], [
            'billing_date.required' => 'Informe a data do faturamento.',
            'billing_date.date' => 'Informe uma data de faturamento válida.',
            'description.required' => 'Informe a descrição do item de faturamento.',
            'amount.required' => 'Informe o valor do item de faturamento.',
            'amount.numeric' => 'O valor do item de faturamento é inválido.',
            'amount.min' => 'O valor do item de faturamento deve ser maior que zero.',
        ])->validate();

        TripBilling::create([
            'trip_id' => $trip->id,
            'billing_date' => $data['billing_date'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'notes' => $data['notes'] ?? null,
            'is_active' => true,
        ]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Item de faturamento adicionado.');
    }

    public function activate(Request $request, TripBilling $billing)
    {
        $billing->load('trip');

        $trip = $this->freshTripForBilling($request, $billing->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível ativar item de faturamento em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível ativar item de faturamento em viagem enviada para aprovação.');

        $billing->update(['is_active' => true]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Item de faturamento ativado.');
    }

    public function deactivate(Request $request, TripBilling $billing)
    {
        $billing->load('trip');

        $trip = $this->freshTripForBilling($request, $billing->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível desativar item de faturamento em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível desativar item de faturamento em viagem enviada para aprovação.');

        $billing->update(['is_active' => false]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Item de faturamento desativado.');
    }

    public function destroy(Request $request, TripBilling $billing)
    {
        $billing->load('trip');

        $trip = $this->freshTripForBilling($request, $billing->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível excluir item de faturamento em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível excluir item de faturamento em viagem enviada para aprovação.');
        abort_if($billing->is_active, 422, 'Inative o item de faturamento antes de excluir.');

        $billing->delete();

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Item de faturamento excluído.');
    }
}