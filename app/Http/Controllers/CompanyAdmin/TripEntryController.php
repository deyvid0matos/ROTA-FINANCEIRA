<?php

namespace App\Http\Controllers\CompanyAdmin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\TripEntry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TripEntryController extends Controller
{
    private const ENTRY_TYPES = [
        'Saldo Inicial',
        'Devolução/Estorno',
        'Outros recebimentos',
        'Recebimento de cliente',
        'Reembolso',
        'Serviço Prestado',
        'Venda de produto',
    ];

    private function companyId(Request $request): int
    {
        return (int) $request->user()->company_id;
    }

    private function companyTrip(Request $request, int $tripId): Trip
    {
        $trip = Trip::query()
            ->where('id', $tripId)
            ->where('company_id', $this->companyId($request))
            ->first();

        abort_if(!$trip, 404);

        return $trip;
    }

    public function store(Request $request, Trip $trip)
    {
        $trip = $this->companyTrip($request, $trip->id);

        abort_if($trip->approval_status === 'approved', 403, 'Reabra a aprovação para lançar entrada nesta viagem.');

        $data = $request->validate([
            'type' => ['required', Rule::in(self::ENTRY_TYPES)],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'type.required' => 'Selecione o tipo da entrada.',
            'amount.required' => 'Informe o valor da entrada.',
            'amount.numeric' => 'O valor da entrada é inválido.',
            'amount.min' => 'O valor da entrada deve ser maior que zero.',
        ]);

        TripEntry::create([
            'trip_id' => $trip->id,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'description' => $data['description'] ?? null,
            'receipt_path' => null,
            'is_active' => true,
        ]);

        return redirect()
            ->route('company.trips.show', $trip->id)
            ->with('ok', 'Entrada adicionada pelo gerente.');
    }
}