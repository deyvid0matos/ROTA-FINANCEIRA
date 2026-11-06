<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Trip;
use App\Models\TripEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EntryController extends Controller
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

    private function freshTripForEntry(Request $request, int $tripId): Trip
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

                        $targetRelativePath = $directory . '/' . uniqid('entry_', true) . '.jpg';
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
                // Se falhar a normalização, usa o upload normal.
            }
        }

        return $file->store($directory, 'public');
    }

    public function store(Request $request, Trip $trip)
    {
        $trip = $this->freshTripForEntry($request, $trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível adicionar entrada em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível adicionar entrada em viagem enviada para aprovação.');

        $data = $request->validate([
            'type' => ['required', Rule::in(self::ENTRY_TYPES)],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:20480'],
        ]);

        $path = $this->storeNormalizedReceipt(
            $request,
            'receipt',
            "trips/{$trip->id}/entries"
        );

        TripEntry::create([
            'trip_id' => $trip->id,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'description' => $data['description'] ?? null,
            'receipt_path' => $path,
            'is_active' => true,
        ]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Entrada adicionada.');
    }

    public function activate(Request $request, TripEntry $entry)
    {
        $entry->load('trip');

        $trip = $this->freshTripForEntry($request, $entry->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível ativar entrada em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível ativar entrada em viagem enviada para aprovação.');

        $entry->update(['is_active' => true]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Entrada ativada.');
    }

    public function deactivate(Request $request, TripEntry $entry)
    {
        $entry->load('trip');

        $trip = $this->freshTripForEntry($request, $entry->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível desativar entrada em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível desativar entrada em viagem enviada para aprovação.');

        $entry->update(['is_active' => false]);

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Entrada desativada.');
    }

    public function destroy(Request $request, TripEntry $entry)
    {
        $entry->load('trip');

        $trip = $this->freshTripForEntry($request, $entry->trip->id);

        abort_if($trip->status !== 'draft', 403, 'Não é possível excluir entrada em viagem finalizada.');
        abort_if(!in_array($trip->approval_status, ['draft', 'rejected'], true), 403, 'Não é possível excluir entrada em viagem enviada para aprovação.');
        abort_if($entry->is_active, 422, 'Inative a entrada antes de excluir.');

        if ($entry->receipt_path) {
            Storage::disk('public')->delete($entry->receipt_path);
        }

        $entry->delete();

        return redirect()
            ->route('employee.trips.show', $trip->id)
            ->with('ok', 'Entrada excluída.');
    }
}