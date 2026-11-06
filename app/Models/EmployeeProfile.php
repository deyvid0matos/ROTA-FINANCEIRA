<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeProfile extends Model
{
    protected $fillable = [
        'company_id','user_id',
        'full_name','cpf','phone','birth_date',
        'job_title','can_travel',
        'cnh_number','cnh_type','cnh_expiration',
        'work_start','lunch_start','lunch_end','work_end',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'cnh_expiration' => 'date',
        'can_travel' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}