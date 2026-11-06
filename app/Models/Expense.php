<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'trip_id','type','company_name','amount','expense_date','description',
        'latitude','longitude','city_name','receipt_path',
        'expense_origin','with_helper','is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'with_helper' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function trip(): BelongsTo { return $this->belongsTo(Trip::class); }
}