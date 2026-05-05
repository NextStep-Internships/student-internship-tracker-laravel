<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'users';
    public $timestamps = false; 
    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
        'role',
        'encadrant_id',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    // 🔥 THIS IS CRITICAL - Tells Laravel your password column name
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    // JWT methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}