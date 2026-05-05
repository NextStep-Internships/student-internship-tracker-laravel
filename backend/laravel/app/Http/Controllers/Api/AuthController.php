<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
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

        $token = auth()->login($user);

        return response()->json([
            'status' => 'success',
            'user'   => $user,
            'token'  => $token,
        ], 201);
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