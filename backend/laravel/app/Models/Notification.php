<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';
    public $timestamps = false;
    protected $fillable = [
        'date_envoi',
        'est_lue',
        'message',
        'titre',
        'deadline_id',
        'rapport_id',
        'user_id',
    ];

    protected $casts = [
        'est_lue' => 'boolean',
        'date_envoi' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}