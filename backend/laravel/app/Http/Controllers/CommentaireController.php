<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use App\Models\Commentaire;
use App\Http\Requests\StoreCommentaireRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;

class CommentaireController extends Controller
{
    /**
     * Display a listing of comments for a specific rapport.
     */
    public function index($id): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être authentifié pour accéder à cette ressource',
                ], 401);
            }

            $rapport = Rapport::findOrFail($id);

            // Check authorization
            $authorized = $rapport->isAuthorOf($user) ||
                         $user->role === 'ENCADRANT' ||
                         $user->role === 'ADMIN';

            if (!$authorized) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'avez pas la permission de consulter les commentaires de ce rapport',
                ], 403);
            }

            $commentaires = Commentaire::forRapport($rapport)
                ->with('auteur')
                ->orderByDesc('date_creation')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $commentaires,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Le rapport demandé n\'existe pas ou a été supprimé',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
            ], 500);
        }
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store($id, StoreCommentaireRequest $request): JsonResponse
{
    try {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être authentifié pour accéder à cette ressource',
            ], 401);
        }

        $rapport = Rapport::findOrFail($id);

        // Cannot comment on BROUILLON
        if ($rapport->statut === 'BROUILLON') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de commenter un rapport en brouillon'
            ], 422);
        }

        // Authorization check
        if ($user->role === 'ETUDIANT' && $rapport->auteur_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez commenter que vos propres rapports'
            ], 403);
        }

        if ($user->role === 'ENCADRANT' && $rapport->encadrant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez commenter que les rapports que vous encadrez'
            ], 403);
        }

        $commentaire = Commentaire::create([
            'contenu' => $request->contenu,
            'date_creation' => Carbon::now(),
            'auteur_id' => $user->id,
            'rapport_id' => $rapport->id,
        ]);

        $commentaire->load('auteur');

        return response()->json([
            'success' => true,
            'data' => $commentaire,
        ], 201);

    } catch (ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Le rapport demandé n\'existe pas ou a été supprimé',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création du commentaire. Veuillez réessayer plus tard.',
        ], 500);
    }
}
    public function destroy($id): JsonResponse {
    try {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être authentifié pour accéder à cette ressource',
            ], 401);
        }

        $commentaire = Commentaire::findOrFail($id);

        if ($commentaire->auteur_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez supprimer que vos propres commentaires',
            ], 403);
        }

        $commentaire->delete();

        return response()->json([
            'success' => true,
            'message' => 'Commentaire supprimé avec succès',
        ], 200);

    } catch (ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Commentaire introuvable',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
        ], 500);
    }
}
}
