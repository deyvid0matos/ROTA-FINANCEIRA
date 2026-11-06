<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'code',
        'price_cents',
        'is_active',
        'limits',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'limits' => 'array',
    ];

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }
}
