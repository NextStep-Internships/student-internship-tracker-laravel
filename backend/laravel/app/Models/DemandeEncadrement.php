<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeEncadrement extends Model
{
    protected $table = 'demandes_encadrement';

    public $timestamps = false;

    protected $fillable = [
        'date_demande',
        'date_reponse',
        'message',
        'statut',
        'encadrant_id',
        'etudiant_id',
    ];

    protected $casts = [
        'date_demande' => 'datetime',
        'date_reponse'  => 'datetime',
    ];

    public function encadrant()
    {
        return $this->belongsTo(User::class, 'encadrant_id');
    }

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }
}