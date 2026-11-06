<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\CompanyUnlockKey;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class UnlockController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('Account/Unlock');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:120'],
        ]);

        $user = $request->user();
        $companyId = (int) ($user->company_id ?? 0);

        if (!$companyId) {
            return back()->withErrors(['code' => 'Sua conta não está vinculada a uma empresa.']);
        }

        $now = Carbon::now();

        $key = CompanyUnlockKey::query()
            ->where('company_id', $companyId)
            ->where('code', $data['code'])
            ->first();

        if (!$key) {
            return back()->withErrors(['code' => 'Chave inválida.']);
        }

        if ($key->used_at) {
            return back()->withErrors(['code' => 'Essa chave já foi utilizada.']);
        }

        if ($key->expires_at->lt($now)) {
            return back()->withErrors(['code' => 'Essa chave expirou.']);
        }

        $company = $user->company;
        if (!$company) {
            return back()->withErrors(['code' => 'Empresa não encontrada.']);
        }

        // Estende a assinatura: a partir do maior (agora x data atual)
        $base = ($company->subscription_ends_at && $company->subscription_ends_at->gt($now))
            ? $company->subscription_ends_at
            : $now;

        $company->subscription_ends_at = $base->copy()->addHours((int) $key->hours);
        $company->save();

        $key->used_at = $now;
        $key->used_by = $user->id;
        $key->save();

        return redirect()->route('dashboard')->with('ok', 'Chave aplicada! Assinatura estendida.');
    }
}
