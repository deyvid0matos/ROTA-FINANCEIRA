<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;




class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_COMPANY_ADMIN = 'company_admin';
    public const ROLE_EMPLOYEE = 'employee'; 

    protected $fillable = [
    'name',
    'email',
    'password',
    'company_id',
    'role',
    'is_active',
];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function company(): BelongsTo
{
    return $this->belongsTo(Company::class);
}

public function isSuperAdmin(): bool
{
    return $this->role === self::ROLE_SUPER_ADMIN;
}

public function isCompanyAdmin(): bool
{
    return $this->role === self::ROLE_COMPANY_ADMIN;
}

public function isEmployee(): bool
{
    return $this->role === self::ROLE_EMPLOYEE;
}

}
