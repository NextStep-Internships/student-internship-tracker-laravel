<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $table = 'rapports';
    public $timestamps = false;

    protected $fillable = [
        'titre',
        'contenu',
        'date_depot',
        'statut',
        'auteur_id',
        'encadrant_id',
    ];

    protected $casts = [
        'date_depot' => 'datetime',
    ];

    /**
     * Get the author (student) of the rapport.
     */
    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    /**
     * Get the supervisor (encadrant) of the rapport.
     */
    public function encadrant()
    {
        return $this->belongsTo(User::class, 'encadrant_id');
    }

    /**
     * Get the comments for this rapport.
     */
    public function commentaires()
    {
        return $this->hasMany(Commentaire::class, 'rapport_id');
    }

    /**
     * Check if the given user is the author of this rapport.
     */
    public function isAuthorOf(User $user): bool
    {
        return $this->auteur_id === $user->id;
    }

    /**
     * Scope: Get rapports for a specific user (as author)
     */
    public function scopeForAuteur($query, User $user)
    {
        return $query->where('auteur_id', $user->id);
    }

    /**
     * Scope: Get rapports by status
     */
    public function scopeByStatut($query, string $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope: Get rapports assigned to an encadrant
     */
    public function scopeForEncadrant($query, User $encadrant)
    {
        return $query->where('encadrant_id', $encadrant->id);
    }
}
