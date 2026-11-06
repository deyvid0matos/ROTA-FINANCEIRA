<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripBilling extends Model
{
    protected $table = 'trip_billings';

    protected $fillable = [
        'trip_id',
        'billing_date',
        'description',
        'amount',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'billing_date' => 'date',
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}