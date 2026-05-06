<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use App\Models\Commentaire;
use App\Http\Requests\StoreRapportRequest;
use App\Http\Requests\UpdateRapportRequest;
use App\Http\Requests\UpdateRapportStatutRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;

class RapportController extends Controller
{
    /**
     * Display a listing of rapports for the authenticated user.
     */
    public function index(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être authentifié pour accéder à cette ressource',
                ], 401);
            }

            // Students see their own rapports
            if ($user->role === 'ETUDIANT') {
                $rapports = Rapport::forAuteur($user)
                    ->with(['auteur', 'encadrant', 'commentaires.auteur'])
                    ->orderByDesc('date_depot')
                    ->get();
            }
            // Supervisors see reports from their assigned students
            // Match by: rapport.encadrant_id OR the student's current encadrant_id in users table
            else if ($user->role === 'ENCADRANT') {
                $studentIds = \App\Models\User::where('encadrant_id', $user->id)
                    ->pluck('id');

                $rapports = Rapport::with(['auteur', 'encadrant', 'commentaires.auteur'])
                    ->where(function($q) use ($user, $studentIds) {
                        $q->where('encadrant_id', $user->id)
                          ->orWhereIn('auteur_id', $studentIds);
                    })
                    ->orderByDesc('date_depot')
                    ->get();
            }
            // Admins see all rapports
            else if ($user->role === 'ADMIN') {
                $rapports = Rapport::with(['auteur', 'encadrant', 'commentaires.auteur'])
                    ->orderByDesc('date_depot')
                    ->get();
            }
            else {
                $rapports = collect([]);
            }

            return response()->json([
                'success' => true,
                'data' => $rapports,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer',
            ], 500);
        }
    }

    /**
     * Store a newly created rapport in storage.
     */
    public function store(StoreRapportRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être authentifié pour accéder à cette ressource',
                ], 401);
            }

            // Check if the user already has a rapport submitted this week
            $now = Carbon::now();
            $weekStart = $now->copy()->startOfWeek();  // Monday
            $weekEnd = $now->copy()->endOfWeek();      // Sunday

            $existingRapport = Rapport::where('auteur_id', auth()->id())
                ->whereBetween('date_depot', [$weekStart, $weekEnd])
                ->first();

            if ($existingRapport) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà soumis un rapport cette semaine. Vous pouvez soumettre un nouveau rapport à partir de la semaine prochaine.',
                ], 422);
            }

            $rapport = Rapport::create([
                'titre' => $request->titre,
                'contenu' => $request->contenu,
                'date_depot' => Carbon::now(),
                'statut' => 'BROUILLON',
                'auteur_id' => $user->id,
                'encadrant_id' => $user->encadrant_id, // auto-assign the student's supervisor
            ]);

            $rapport->load(['auteur', 'encadrant', 'commentaires.auteur']);

            return response()->json([
                'success' => true,
                'data' => $rapport,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer',
            ], 500);
        }
    }

    /**
     * Display the specified rapport.
     */
    public function show($id): JsonResponse
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
                    'message' => 'Vous n\'avez pas la permission de consulter ce rapport',
                ], 403);
            }

            $rapport->load(['auteur', 'encadrant', 'commentaires.auteur']);

            return response()->json([
                'success' => true,
                'data' => $rapport,
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
     * Update the specified rapport in storage.
     */
    public function update($id, UpdateRapportRequest $request): JsonResponse
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

            // Check authorization - only author can edit
            if (!$rapport->isAuthorOf($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier que vos propres rapports',
                ], 403);
            }

            // Check if rapport is in VALIDE or REJETE status
            if ($rapport->statut === 'VALIDE' || $rapport->statut === 'REJETE') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce rapport ne peut pas être modifié car il a déjà été ' . ($rapport->statut === 'VALIDE' ? 'validé' : 'rejeté'),
                ], 422);
            }

            $rapport->update([
                'titre' => $request->titre,
                'contenu' => $request->contenu,
            ]);

            $rapport->load(['auteur', 'encadrant', 'commentaires.auteur']);

            return response()->json([
                'success' => true,
                'data' => $rapport,
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
     * Delete the specified rapport from storage.
     */
    public function destroy($id): JsonResponse
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

            // Check if the user is the author and rapport is in BROUILLON status
            if (!$rapport->isAuthorOf($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez supprimer que vos propres rapports',
                ], 403);
            }

            if ($rapport->statut !== 'BROUILLON') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les rapports en statut brouillon peuvent être supprimés',
                ], 422);
            }

            $rapport->delete();

            return response()->json([
                'success' => true,
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
     * Update the status of the specified rapport.
     */
    public function updateStatut($id, \Illuminate\Http\Request $request): JsonResponse
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

            // Validate statut value
            $validStatuts = ['BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE'];
            if (!in_array($request->statut, $validStatuts)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Statut invalide. Les statuts acceptés sont: BROUILLON, SOUMIS, VALIDE, REJETE',
                ], 422);
            }

            // Check if rapport is already VALIDE or REJETE
            if ($rapport->statut === 'VALIDE' || $rapport->statut === 'REJETE') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce rapport ne peut pas avoir son statut modifié car il a déjà été ' . ($rapport->statut === 'VALIDE' ? 'validé' : 'rejeté'),
                ], 422);
            }

            // Authorization rules
            if ($user->role === 'ETUDIANT') {
                // ETUDIANT can only change BROUILLON to SOUMIS
                if ($rapport->statut !== 'BROUILLON' || $request->statut !== 'SOUMIS') {
                    return response()->json([
                        'success' => false,
                        'message' => 'En tant qu\'étudiant, vous ne pouvez passer un rapport de brouillon à soumis',
                    ], 403);
                }
                
                // ETUDIANT can only change their own rapport
                if (!$rapport->isAuthorOf($user)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez modifier que vos propres rapports',
                    ], 403);
                }
            } else if ($user->role === 'ENCADRANT' || $user->role === 'ADMIN') {
                // ENCADRANT and ADMIN can change to VALIDE or REJETE
                if ($request->statut !== 'VALIDE' && $request->statut !== 'REJETE') {
                    return response()->json([
                        'success' => false,
                        'message' => 'En tant que ' . ($user->role === 'ENCADRANT' ? 'encadrant' : 'administrateur') . ', vous ne pouvez passer un rapport à validé ou rejeté',
                    ], 403);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Votre rôle n\'a pas la permission de modifier le statut des rapports',
                ], 403);
            }

            $rapport->update([
                'statut' => $request->statut,
            ]);

            $rapport->load(['auteur', 'encadrant', 'commentaires.auteur']);

            return response()->json([
                'success' => true,
                'data' => $rapport,
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
}
