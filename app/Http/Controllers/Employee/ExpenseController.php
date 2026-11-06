<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Expense;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    private const EXPENSE_TYPES = [
        'Alimentação',
        'Combustivel',
        'Despesa Veículo',
        'Estacionamento',
        'Hospedagem',
        'Material de Instalação',
        'Material Diverso',
        'Outras Despesas',
        'Pagamento',
        'Uso e Consumo',
    ];

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

    private function freshTripForExpense(Request $request, int $tripId): Trip
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

    private function storeNormalizedReceipt(Request $request, string $field, string $directory): ?string
    {
        if (!$request->hasFile($field)) {
            return null;
        }

        $file = $request->file($field);
        $ext = strtolower($file->getClientOriginalExtension());

        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'pdf'], true)) {
            return $file->store($directory, 'public');
        }

        if ($ext === 'pdf') {
            return $file->store($directory, 'public');
        }

        if (
            in_array($ext, ['jpg', 'jpeg'], true)
            && function_exists('exif_read_data')
            && function_exists('imagecreatefromjpeg')
            && function_exists('imagerotate')
            && function_exists('imagejpeg')
        ) {
            try {
                $tmpPath = $file->getRealPath();
                $exif = @exif_read_data($tmpPath);

                if (!empty($exif['Orientation'])) {
                    $image = @imagecreatefromjpeg($tmpPath);

                    if ($image !== false) {
                        switch ((int) $exif['Orientation']) {
                            case 3:
                                $image = imagerotate($image, 180, 0);
                                break;
                            case 6:
                                $image = imagerotate($image, -90, 0);
                                break;
                            case 8:
                                $image = imagerotate($image, 90, 0);
                                break;
                        }

                        $targetRelativePath = $directory . '/' . uniqid('receipt_', true) . '.jpg';
                        $targetAbsolutePath = storage_path('app/public/' . $targetRelativePath);

                        if (!is_dir(dirname($targetAbsolutePath))) {
                            mkdir(dirname($targetAbsolutePath), 0775, true);
                        }

                        imagejpeg($image, $targetAbsolutePath, 90);
                        imagedestroy($image);

                        return $targetRelativePath;
                    }
                }
            } catch (\Throwable $e) {
                // Se falhar a normalização, segue com o upload normal.
            }
        }

        return $file->store($directory, 'public');
    }

    public function store(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForExpense($request, $trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível adicionar despesa em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível adicionar despesa em viagem enviada para aprovação.');

        $data = $request->validate([
            'type' => ['required', Rule::in(self::EXPENSE_TYPES)],
            'company_name' => ['nullable', 'string', 'max:140'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'city_name' => ['nullable', 'string', 'max:120'],
            'expense_origin' => ['required', Rule::in(['company', 'service'])],
            'with_helper' => ['boolean'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:20480'],
        ]);

        $path = $this->storeNormalizedReceipt(
            $request,
            'receipt',
            "trips/{$trip->id}/receipts"
        );

        Expense::create([
            'trip_id' => $trip->id,
            'type' => $data['type'],
            'company_name' => $data['company_name'] ?? null,
            'amount' => $data['amount'],
            'expense_date' => $data['expense_date'],
            'description' => $data['description'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'city_name' => $data['city_name'] ?? null,
            'receipt_path' => $path,
            'expense_origin' => $data['expense_origin'],
            'with_helper' => (bool) ($data['with_helper'] ?? false),
            'is_active' => true,
        ]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Despesa adicionada.');
    }

    public function activate(Request $request, Expense $expense)
    {
        $expense->load('trip');

        $trip = $this->freshTripForExpense($request, $expense->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível ativar despesa em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível ativar despesa em viagem enviada para aprovação.');

        $expense->update(['is_active' => true]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Despesa ativada.');
    }

    public function deactivate(Request $request, Expense $expense)
    {
        $expense->load('trip');

        $trip = $this->freshTripForExpense($request, $expense->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível desativar despesa em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível desativar despesa em viagem enviada para aprovação.');

        $expense->update(['is_active' => false]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Despesa desativada.');
    }

    public function destroy(Request $request, Expense $expense)
    {
        $expense->load('trip');

        $trip = $this->freshTripForExpense($request, $expense->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível excluir despesa em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível excluir despesa em viagem enviada para aprovação.');
        abort_if($expense->is_active, 422, 'Inative a despesa antes de excluir.');

        if ($expense->receipt_path) {
            Storage::disk('public')->delete($expense->receipt_path);
        }

        $expense->delete();

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Despesa excluída.');
    }
}