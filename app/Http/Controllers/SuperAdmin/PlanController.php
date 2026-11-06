<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PlanController extends Controller
{
    private function reaisToCents(?string $value): int
    {
        if (!$value) return 0;

        // aceita 12,50 ou 12.50
        $normalized = str_replace(['.', ','], ['', '.'], $value);
        return (int) round(((float) $normalized) * 100);
    }

    private function centsToReais(int $cents): string
    {
        return number_format($cents / 100, 2, ',', '.');
    }

    public function index(Request $request)
    {
        $plans = Plan::query()
            ->latest()
            ->paginate(15)
            ->through(function ($plan) {
                $plan->price = $this->centsToReais($plan->price_cents ?? 0);
                return $plan;
            })
            ->withQueryString();

        return Inertia::render('Super/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Super/Plans/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:60', 'alpha_dash', 'lowercase', Rule::unique('plans', 'code')],
            'price' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'limits' => ['nullable', 'array'],
            'limits.max_users' => ['nullable', 'integer', 'min:0'],
            'limits.max_vehicles' => ['nullable', 'integer', 'min:0'],
        ]);

        Plan::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'price_cents' => $this->reaisToCents($data['price'] ?? null),
            'is_active' => (bool)($data['is_active'] ?? true),
            'limits' => $data['limits'] ?? null,
        ]);

        return redirect()->route('super.plans.index')->with('ok', 'Plano criado.');
    }

    public function edit(Plan $plan)
    {
        $plan->price = $this->centsToReais($plan->price_cents ?? 0);

        return Inertia::render('Super/Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:60', 'alpha_dash', 'lowercase', Rule::unique('plans', 'code')->ignore($plan->id)],
            'price' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'limits' => ['nullable', 'array'],
            'limits.max_users' => ['nullable', 'integer', 'min:0'],
            'limits.max_vehicles' => ['nullable', 'integer', 'min:0'],
        ]);

        $plan->update([
            'name' => $data['name'],
            'code' => $data['code'],
            'price_cents' => $this->reaisToCents($data['price'] ?? null),
            'is_active' => (bool)($data['is_active'] ?? $plan->is_active),
            'limits' => $data['limits'] ?? null,
        ]);

        return back()->with('ok', 'Plano atualizado.');
    }
}