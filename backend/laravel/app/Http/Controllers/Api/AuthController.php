<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rapport;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Default role is ETUDIANT - no one can self-register as admin/encadrant
        $validator = Validator::make($request->all(), [
            'nom'          => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'mot_de_passe' => 'required|string|min:6',
            'role'         => 'sometimes|in:ETUDIANT', // only ETUDIANT allowed via self-register
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nom'          => $request->nom,
            'email'        => $request->email,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'role'         => $request->role ?? 'ETUDIANT',
        ]);

        $token = auth()->login($user);

        return response()->json([
            'status' => 'success',
            'user'   => $user,
            'token'  => $token,
        ], 201);
    }

    public function createUser(Request $request)
    {
        // Only admins can create users with any role
        $validator = Validator::make($request->all(), [
            'nom'          => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'mot_de_passe' => 'required|string|min:6',
            'role'         => 'required|in:ADMIN,ENCADRANT,ETUDIANT',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nom'          => $request->nom,
            'email'        => $request->email,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'role'         => $request->role,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'User created successfully',
            'user'    => $user,
        ], 201);
    }

    public function getUsers()
    {
        $users = User::all(['id', 'nom', 'email', 'role']);
        return response()->json([
            'status' => 'success',
            'users'  => $users,
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found',
            ], 404);
        }

        // Prevent admin from deleting themselves
        if (auth()->id() === $user->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        // Clear all foreign key references before deleting
        DB::statement("SET FOREIGN_KEY_CHECKS=0");

        $user->rapports()->update(['encadrant_id' => null]);
        $user->rapportsAsAuteur()->update(['auteur_id' => null]);
        Notification::where('user_id', $user->id)->delete();

        $user->delete();

        DB::statement("SET FOREIGN_KEY_CHECKS=1");

        return response()->json([
            'status'  => 'success',
            'message' => 'User deleted successfully',
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'role' => 'required|in:ADMIN,ENCADRANT,ETUDIANT',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'User role updated successfully',
            'user'    => $user,
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'        => 'required|email',
            'mot_de_passe' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = [
            'email'    => $request->email,
            'password' => $request->mot_de_passe,
        ];

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'user'   => auth()->user(),
            'token'  => $token,
        ]);
    }

    public function profile()
    {
        return response()->json([
            'status' => 'success',
            'user'   => auth()->user(),
        ]);
    }

    public function logout()
    {
        auth()->logout();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Déconnexion réussie',
        ]);
    }

    public function refresh()
    {
        return response()->json([
            'status' => 'success',
            'user'   => auth()->user(),
            'token'  => auth()->refresh(),
        ]);
    }
}