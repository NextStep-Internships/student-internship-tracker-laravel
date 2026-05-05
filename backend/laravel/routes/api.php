<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\CommentaireController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('profile',  [AuthController::class, 'profile']);
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

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