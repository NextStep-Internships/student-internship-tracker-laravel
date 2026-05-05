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

            $commentaire = Commentaire::create([
                'contenu' => $request->contenu,
                'date_creation' => Carbon::now(),
                'auteur_id' => auth()->id(),
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
                'message' => 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
            ], 500);
        }
    }
}
