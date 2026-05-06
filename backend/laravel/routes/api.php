<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DemandeEncadrementController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\CommentaireController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('profile',  [AuthController::class, 'profile']);
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('dashboard-stats', [AuthController::class, 'dashboardStats']);

        // Admin-only: user management
        Route::get('users',     [AuthController::class, 'getUsers'])->middleware('admin');
        Route::post('users',    [AuthController::class, 'createUser'])->middleware('admin');
        Route::put('users/{id}', [AuthController::class, 'updateUser'])->middleware('admin');
        Route::delete('users/{id}', [AuthController::class, 'deleteUser'])->middleware('admin');
    });
});

// Supervision requests
    Route::get('supervisors', [DemandeEncadrementController::class, 'supervisors']);
    Route::post('supervision-requests', [DemandeEncadrementController::class, 'store']);
    Route::get('supervision-requests', [DemandeEncadrementController::class, 'index']);
    Route::put('supervision-requests/{id}', [DemandeEncadrementController::class, 'respond']);

// Protected Rapport and Commentaire Routes
Route::middleware('auth:api')->group(function () {
    // Rapport routes
    Route::get('rapports', [RapportController::class, 'index']);
    Route::post('rapports', [RapportController::class, 'store']);
    Route::get('rapports/{rapport}', [RapportController::class, 'show']);
    Route::put('rapports/{rapport}', [RapportController::class, 'update']);
    Route::delete('rapports/{rapport}', [RapportController::class, 'destroy']);
    Route::put('rapports/{rapport}/statut', [RapportController::class, 'updateStatut']);

    // Commentaire routes
    Route::get('rapports/{rapport}/commentaires', [CommentaireController::class, 'index']);
    Route::post('rapports/{rapport}/commentaires', [CommentaireController::class, 'store']);
    Route::delete('commentaires/{id}', [CommentaireController::class, 'destroy']);
});