<?php

namespace App\Http\Controllers\CompanyAdmin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    private function companyId(Request $request): int
    {
        return (int) $request->user()->company_id;
    }

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);

        $employees = EmployeeProfile::query()
            ->where('company_id', $companyId)
            ->with(['user:id,name,email,is_active'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Company/Employees/Index', [
            'employees' => $employees,
        ]);
    }

    public function create()
    {
        return Inertia::render('Company/Employees/Create');
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);

        $data = $request->validate([
            'full_name' => ['required','string','max:120'],
            'cpf' => ['nullable','string','max:20'],
            'phone' => ['nullable','string','max:30'],
            'birth_date' => ['nullable','date'],
            'job_title' => ['nullable','string','max:120'],
            'can_travel' => ['boolean'],

            'cnh_number' => ['nullable','string','max:40'],
            'cnh_type' => ['nullable','string','max:20'],
            'cnh_expiration' => ['nullable','date'],

            'work_start' => ['nullable'],
            'lunch_start' => ['nullable'],
            'lunch_end' => ['nullable'],
            'work_end' => ['nullable'],

            // login do funcionário
            'email' => ['required','email','max:180','unique:users,email'],
            'password' => ['required','string','min:8'],
        ]);

        // cria user do funcionário
        $user = User::create([
            'company_id' => $companyId,
            'name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => User::ROLE_EMPLOYEE,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        EmployeeProfile::create([
            'company_id' => $companyId,
            'user_id' => $user->id,
            'full_name' => $data['full_name'],
            'cpf' => $data['cpf'] ?? null,
            'phone' => $data['phone'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'job_title' => $data['job_title'] ?? null,
            'can_travel' => (bool)($data['can_travel'] ?? false),
            'cnh_number' => $data['cnh_number'] ?? null,
            'cnh_type' => $data['cnh_type'] ?? null,
            'cnh_expiration' => $data['cnh_expiration'] ?? null,
            'work_start' => $data['work_start'] ?? null,
            'lunch_start' => $data['lunch_start'] ?? null,
            'lunch_end' => $data['lunch_end'] ?? null,
            'work_end' => $data['work_end'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('company.employees.index')->with('ok', 'Funcionário criado.');
    }

    public function edit(Request $request, EmployeeProfile $employee)
    {
        $companyId = $this->companyId($request);

        abort_if($employee->company_id !== $companyId, 404);

        $employee->load('user:id,name,email,is_active');

        return Inertia::render('Company/Employees/Edit', [
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'cpf' => $employee->cpf,
                'phone' => $employee->phone,
                'birth_date' => optional($employee->birth_date)->toDateString(),
                'job_title' => $employee->job_title,
                'can_travel' => $employee->can_travel,
                'cnh_number' => $employee->cnh_number,
                'cnh_type' => $employee->cnh_type,
                'cnh_expiration' => optional($employee->cnh_expiration)->toDateString(),
                'work_start' => $employee->work_start,
                'lunch_start' => $employee->lunch_start,
                'lunch_end' => $employee->lunch_end,
                'work_end' => $employee->work_end,
                'is_active' => $employee->is_active,
                'user' => [
                    'id' => $employee->user->id,
                    'email' => $employee->user->email,
                    'is_active' => $employee->user->is_active,
                ],
            ],
        ]);
    }

    public function update(Request $request, EmployeeProfile $employee)
    {
        $companyId = $this->companyId($request);
        abort_if($employee->company_id !== $companyId, 404);

        $data = $request->validate([
            'full_name' => ['required','string','max:120'],
            'cpf' => ['nullable','string','max:20'],
            'phone' => ['nullable','string','max:30'],
            'birth_date' => ['nullable','date'],
            'job_title' => ['nullable','string','max:120'],
            'can_travel' => ['boolean'],

            'cnh_number' => ['nullable','string','max:40'],
            'cnh_type' => ['nullable','string','max:20'],
            'cnh_expiration' => ['nullable','date'],

            'work_start' => ['nullable'],
            'lunch_start' => ['nullable'],
            'lunch_end' => ['nullable'],
            'work_end' => ['nullable'],

            'email' => ['required','email','max:180', Rule::unique('users','email')->ignore($employee->user_id)],
            'password' => ['nullable','string','min:8'],
        ]);

        $employee->update([
            'full_name' => $data['full_name'],
            'cpf' => $data['cpf'] ?? null,
            'phone' => $data['phone'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'job_title' => $data['job_title'] ?? null,
            'can_travel' => (bool)($data['can_travel'] ?? false),
            'cnh_number' => $data['cnh_number'] ?? null,
            'cnh_type' => $data['cnh_type'] ?? null,
            'cnh_expiration' => $data['cnh_expiration'] ?? null,
            'work_start' => $data['work_start'] ?? null,
            'lunch_start' => $data['lunch_start'] ?? null,
            'lunch_end' => $data['lunch_end'] ?? null,
            'work_end' => $data['work_end'] ?? null,
        ]);

        $user = $employee->user;
        $user->email = $data['email'];
        $user->name = $data['full_name'];
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        return back()->with('ok', 'Funcionário atualizado.');
    }

    public function activate(Request $request, EmployeeProfile $employee)
    {
        $companyId = $this->companyId($request);
        abort_if($employee->company_id !== $companyId, 404);

        $employee->update(['is_active' => true]);
        $employee->user->update(['is_active' => true]);

        return back()->with('ok', 'Funcionário ativado.');
    }

    public function deactivate(Request $request, EmployeeProfile $employee)
    {
        $companyId = $this->companyId($request);
        abort_if($employee->company_id !== $companyId, 404);

        $employee->update(['is_active' => false]);
        $employee->user->update(['is_active' => false]);

        return back()->with('ok', 'Funcionário desativado.');
    }
}