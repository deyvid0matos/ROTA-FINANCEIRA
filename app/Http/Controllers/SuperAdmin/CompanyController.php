<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyUnlockKey;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::query()
            ->latest()
            ->with(['planRel:id,name,code'])
            ->select([
                'id','name','legal_name','cnpj','city','state','is_active','plan','plan_id',
                'subscription_ends_at','blocked_at','created_at'
            ])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Super/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function create()
    {
        return Inertia::render('Super/Companies/Create', [
            'plans' => Plan::query()->where('is_active', true)->orderBy('name')->get(['id','name','code','price_cents']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:120'],
            'legal_name' => ['nullable','string','max:180'],
            'cnpj' => ['nullable','string','max:32'],

            'city' => ['nullable','string','max:120'],
            'state' => ['nullable','string','max:2'],
            'address' => ['nullable','string','max:180'],
            'address_number' => ['nullable','string','max:20'],
            'neighborhood' => ['nullable','string','max:120'],
            'zip_code' => ['nullable','string','max:20'],
            'phone' => ['nullable','string','max:40'],
            'company_email' => ['nullable','email','max:180'],

            'responsible_name' => ['nullable','string','max:120'],
            'responsible_cpf' => ['nullable','string','max:32'],
            'responsible_email' => ['nullable','email','max:180'],

            'plan' => ['nullable','string','max:60'],
            'plan_id' => ['nullable', Rule::exists('plans','id')],

            'subscription_ends_at' => ['nullable','date'],

            'logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('companies/logos', 'public');
        }

        $company = Company::create([
            'name' => $data['name'],
            'legal_name' => $data['legal_name'] ?? null,
            'cnpj' => $data['cnpj'] ?? null,

            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'address' => $data['address'] ?? null,
            'address_number' => $data['address_number'] ?? null,
            'neighborhood' => $data['neighborhood'] ?? null,
            'zip_code' => $data['zip_code'] ?? null,
            'phone' => $data['phone'] ?? null,
            'company_email' => $data['company_email'] ?? null,

            'responsible_name' => $data['responsible_name'] ?? null,
            'responsible_cpf' => $data['responsible_cpf'] ?? null,
            'responsible_email' => $data['responsible_email'] ?? null,

            'plan' => $data['plan'] ?? 'basic',
            'plan_id' => $data['plan_id'] ?? null,
            'subscription_ends_at' => $data['subscription_ends_at'] ?? null,

            'logo_path' => $logoPath,

            'is_active' => true,
        ]);

        return redirect()->route('super.companies.edit', $company)->with('ok', 'Empresa criada.');
    }

    public function edit(Company $company)
    {
        return Inertia::render('Super/Companies/Edit', [
            'company' => $company->only([
                'id','name','legal_name','cnpj','city','state','address','address_number','neighborhood','zip_code',
                'phone','company_email','responsible_name','responsible_cpf','responsible_email',
                'is_active','plan','plan_id','subscription_ends_at','blocked_at','blocked_reason','logo_path'
            ]) + [
                'logo_url' => $company->logo_path ? Storage::url($company->logo_path) : null,
                'plan_rel' => $company->planRel ? $company->planRel->only(['id','name','code']) : null,
            ],
            'plans' => Plan::query()->where('is_active', true)->orderBy('name')->get(['id','name','code','price_cents']),
            'recentKeys' => CompanyUnlockKey::query()
                ->where('company_id', $company->id)
                ->latest()
                ->limit(10)
                ->get(['id','code','hours','expires_at','used_at','used_by']),
            'companyAdmins' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_COMPANY_ADMIN)
                ->select(['id','name','email','is_active'])
                ->orderBy('id','desc')
                ->get(),
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $data = $request->validate([
            'name' => ['required','string','max:120'],
            'legal_name' => ['nullable','string','max:180'],
            'cnpj' => ['nullable','string','max:32'],

            'city' => ['nullable','string','max:120'],
            'state' => ['nullable','string','max:2'],
            'address' => ['nullable','string','max:180'],
            'address_number' => ['nullable','string','max:20'],
            'neighborhood' => ['nullable','string','max:120'],
            'zip_code' => ['nullable','string','max:20'],
            'phone' => ['nullable','string','max:40'],
            'company_email' => ['nullable','email','max:180'],

            'responsible_name' => ['nullable','string','max:120'],
            'responsible_cpf' => ['nullable','string','max:32'],
            'responsible_email' => ['nullable','email','max:180'],

            'plan' => ['nullable','string','max:60'],
            'plan_id' => ['nullable', Rule::exists('plans','id')],
            'subscription_ends_at' => ['nullable','date'],

            'logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $updates = $data;
        unset($updates['logo']);

        if (empty($updates['plan'])) {
            $updates['plan'] = $company->plan ?? 'basic';
        }

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $updates['logo_path'] = $request->file('logo')->store('companies/logos', 'public');
        }

        $company->update($updates);

        return back()->with('ok', 'Empresa atualizada.');
    }

    public function activate(Company $company)
    {
        $company->update([
            'is_active' => true,
            'blocked_at' => null,
            'blocked_reason' => null,
        ]);

        return back()->with('ok', 'Empresa ativada.');
    }

    public function deactivate(Company $company)
    {
        $company->update([
            'is_active' => false,
            'blocked_at' => now(),
            'blocked_reason' => 'Bloqueado pelo Super Admin',
        ]);

        return back()->with('ok', 'Empresa desativada.');
    }

    public function generateUnlockKey(Request $request, Company $company)
    {
        $data = $request->validate([
            'hours' => ['nullable', 'integer', 'min:1', 'max:168'],
        ]);

        $hours = (int) ($data['hours'] ?? 24);
        $code = Str::upper(Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));

        CompanyUnlockKey::create([
            'company_id' => $company->id,
            'code' => $code,
            'hours' => $hours,
            'expires_at' => now()->addDays(7),
        ]);

        return back()->with('ok', "Chave criada: {$code}");
    }

    public function createAdmin(Request $request, Company $company)
    {
        $data = $request->validate([
            'name' => ['required','string','max:120'],
            'email' => ['required','email','max:180','unique:users,email'],
            'password' => ['required','string','min:8'],
        ]);

        User::create([
            'company_id' => $company->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => User::ROLE_COMPANY_ADMIN,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return back()->with('ok', 'Admin da empresa criado.');
    }

    // ===========================
    // ✅ GERENTES (company_admin)
    // ===========================

    private function assertCompanyAdmin(Company $company, User $user): void
    {
        abort_if($user->company_id !== $company->id, 404);
        abort_if($user->role !== User::ROLE_COMPANY_ADMIN, 403, 'Usuário não é gerente (company_admin).');
    }

    public function activateAdmin(Request $request, Company $company, User $user)
    {
        $this->assertCompanyAdmin($company, $user);

        $user->update(['is_active' => true]);

        return back()->with('ok', 'Gerente ativado.');
    }

    public function deactivateAdmin(Request $request, Company $company, User $user)
    {
        $this->assertCompanyAdmin($company, $user);

        // trava: não desativar a si mesmo (evita se trancar fora)
        abort_if((int)$request->user()->id === (int)$user->id, 403, 'Você não pode desativar seu próprio usuário.');

        $user->update(['is_active' => false]);

        return back()->with('ok', 'Gerente desativado.');
    }

    public function destroyAdmin(Request $request, Company $company, User $user)
    {
        $this->assertCompanyAdmin($company, $user);

        // trava: não excluir a si mesmo
        abort_if((int)$request->user()->id === (int)$user->id, 403, 'Você não pode excluir seu próprio usuário.');

        try {
            $user->delete();
        } catch (QueryException $e) {
            // Se houver FK/constraint no banco
            return back()->with('error', 'Não foi possível excluir. Esse usuário pode estar vinculado a registros (aprovações/viagens). Desative em vez de excluir.');
        }

        return back()->with('ok', 'Gerente excluído.');
    }
}