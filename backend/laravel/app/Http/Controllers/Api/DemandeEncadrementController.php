<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DemandeEncadrement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DemandeEncadrementController extends Controller
{
    /**
     * List all supervisors (ENCADRANT) — for student to choose from.
     */
    public function supervisors()
    {
        $supervisors = User::where('role', 'ENCADRANT')
            ->get(['id', 'nom', 'email']);

        return response()->json([
            'status'      => 'success',
            'supervisors' => $supervisors,
        ]);
    }

    /**
     * Student: send a supervision request to a supervisor.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Only students can send requests
        if ($user->role !== 'ETUDIANT') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only students can send supervision requests.',
            ], 403);
        }

        // Student can only have ONE accepted supervisor
        $alreadyAccepted = DemandeEncadrement::where('etudiant_id', $user->id)
            ->where('statut', 'ACCEPTE')
            ->exists();

        if ($alreadyAccepted) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You already have an assigned supervisor.',
            ], 400);
        }

        // Check if there's already a pending request to the same supervisor
        $existingPending = DemandeEncadrement::where('etudiant_id', $user->id)
            ->where('encadrant_id', $request->encadrant_id)
            ->whereIn('statut', ['EN_ATTENTE', 'ACCEPTE'])
            ->exists();

        if ($existingPending) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You already have a pending or active request with this supervisor.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'encadrant_id' => 'required|integer|exists:users,id',
            'message'      => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify the target is actually a supervisor
        $supervisor = User::where('id', $request->encadrant_id)
            ->where('role', 'ENCADRANT')
            ->first();

        if (!$supervisor) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The selected user is not a valid supervisor.',
            ], 404);
        }

        $demande = DemandeEncadrement::create([
            'date_demande' => now(),
            'encadrant_id' => $request->encadrant_id,
            'etudiant_id'  => $user->id,
            'message'      => $request->message,
            'statut'       => 'EN_ATTENTE',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Supervision request sent successfully.',
            'demande' => $demande,
        ], 201);
    }

    /**
     * Supervisor: list all incoming requests (EN_ATTENTE) with student info.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->role !== 'ENCADRANT') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only supervisors can view requests.',
            ], 403);
        }

        $requests = DemandeEncadrement::with('etudiant:id,nom,email')
            ->where('encadrant_id', $user->id)
            ->orderByDesc('date_demande')
            ->get();

        return response()->json([
            'status'  => 'success',
            'requests' => $requests,
        ]);
    }

    /**
     * Supervisor: accept or reject a request.
     * If accepting, auto-reject all other pending requests from the same student.
     */
    public function respond(Request $request, $id)
    {
        $user = auth()->user();

        if ($user->role !== 'ENCADRANT') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only supervisors can respond.',
            ], 403);
        }

        $demande = DemandeEncadrement::where('id', $id)
            ->where('encadrant_id', $user->id)
            ->first();

        if (!$demande) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Request not found or not authorized.',
            ], 404);
        }

        if ($demande->statut !== 'EN_ATTENTE') {
            return response()->json([
                'status'  => 'error',
                'message' => 'This request has already been processed.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:ACCEPTE,REFUSE',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $demande->statut = $request->action;
        $demande->date_reponse = now();
        $demande->save();

        // If accepted, auto-reject all other pending requests from same student
        if ($request->action === 'ACCEPTE') {
            DemandeEncadrement::where('etudiant_id', $demande->etudiant_id)
                ->where('id', '!=', $demande->id)
                ->whereIn('statut', ['EN_ATTENTE'])
                ->update(['statut' => 'REFUSE', 'date_reponse' => now()]);

            // Update the student's encadrant_id in the users table
            User::where('id', $demande->etudiant_id)
                ->update(['encadrant_id' => $user->id]);

            // Backfill existing reports that have no encadrant assigned
            \App\Models\Rapport::where('auteur_id', $demande->etudiant_id)
                ->whereNull('encadrant_id')
                ->update(['encadrant_id' => $user->id]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => $request->action === 'ACCEPTE'
                ? 'Request accepted. Student assigned to you.'
                : 'Request rejected.',
            'demande' => $demande,
        ]);
    }
}