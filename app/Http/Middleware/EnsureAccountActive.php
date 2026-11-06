<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // super_admin não depende de empresa
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        $company = $user->company;

        if (!$company || !$company->is_active) {
            return redirect()->route('account.blocked');
        }

        // assinatura vencida
        $endsAt = $company->subscription_ends_at;
        if (!$endsAt || Carbon::now()->greaterThan($endsAt)) {
            // employee não entra
            if ($user->isEmployee()) {
                return redirect()->route('account.expired');
            }

            // company_admin entra mas precisa “desbloquear 1 dia”
            return redirect()->route('account.unlock');
        }

        return $next($request);
    }
}