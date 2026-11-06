<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Company extends Model
{
    protected $fillable = [
        // identificação
        'name',
        'legal_name',
        'cnpj',

        // endereço/contato
        'city',
        'state',
        'address',
        'address_number',
        'neighborhood',
        'zip_code',
        'phone',
        'company_email',

        // responsável
        'responsible_name',
        'responsible_cpf',
        'responsible_email',

        // plano/assinatura
        'plan', // legado (string)
        'plan_id',
        'subscription_ends_at',

        // bloqueio
        'is_active',
        'blocked_at',
        'blocked_reason',

        // marca
        'logo_path',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscription_ends_at' => 'datetime',
        'blocked_at' => 'datetime',
    ];

    public function planRel(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}