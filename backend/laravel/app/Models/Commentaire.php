<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commentaire extends Model
{
    use HasFactory;

    protected $table = 'commentaires';
    public $timestamps = false;

    protected $fillable = [
        'contenu',
        'date_creation',
        'auteur_id',
        'rapport_id',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    /**
     * Get the author of the comment.
     */
    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    /**
     * Get the rapport this comment belongs to.
     */
    public function rapport()
    {
        return $this->belongsTo(Rapport::class, 'rapport_id');
    }

    /**
     * Check if the given user is the author of this comment.
     */
    public function isAuthorOf(User $user): bool
    {
        return $this->auteur_id === $user->id;
    }

    /**
     * Scope: Get comments for a specific rapport
     */
    public function scopeForRapport($query, Rapport $rapport)
    {
        return $query->where('rapport_id', $rapport->id);
    }
}
