<?php

namespace App\Http\Controllers\CompanyAdmin;

use App\Http\Controllers\Controller;
use App\Models\TripBilling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TripBillingController extends Controller
{
    private function companyId(Request $request): int
    {
        return (int) $request->user()->company_id;
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

    public function update(Request $request, TripBilling $billing)
    {
        $billing->load('trip');

        abort_if(!$billing->trip, 404);
        abort_if((int) $billing->trip->company_id !== $this->companyId($request), 404);
        abort_if($billing->trip->approval_status === 'approved', 403, 'Reabra a aprovação para editar faturamento.');

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
            'billing_date.date' => 'Informe uma data válida.',
            'description.required' => 'Informe a descrição do faturamento.',
            'amount.required' => 'Informe o valor do faturamento.',
            'amount.numeric' => 'O valor do faturamento é inválido.',
            'amount.min' => 'O valor do faturamento deve ser maior que zero.',
        ])->validate();

        $billing->update([
            'billing_date' => $data['billing_date'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()
            ->route('company.trips.show', $billing->trip_id)
            ->with('ok', 'Item de faturamento atualizado.');
    }
}