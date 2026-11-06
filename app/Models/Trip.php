<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    protected $fillable = [
        'company_id','employee_profile_id','vehicle_id',
        'trip_name',
        'city_origin','city_destination',
        'start_date','end_date','route_description',
        'billing_material_description','billing_material_amount',
        'km_start','km_end','total_km',
        'km_start_photo_path','km_end_photo_path',
        'start_time','end_time','extra_minutes',
        'status','finished_at','is_active',
        'approval_status',
        'approved_at','approved_by',
        'rejected_at','rejected_by',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'finished_at' => 'datetime',
        'is_active' => 'boolean',
        'extra_minutes' => 'integer',
        'billing_material_amount' => 'decimal:2',
        'km_start' => 'integer',
        'km_end' => 'integer',
        'total_km' => 'integer',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(TripEntry::class);
    }

    public function billings(): HasMany
    {
        return $this->hasMany(TripBilling::class)->latest('billing_date')->latest('id');
    }
}