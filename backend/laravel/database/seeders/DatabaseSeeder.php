<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create an admin account
        User::create([
            'nom'          => 'Admin User',
            'email'        => 'admin@example.com',
            'mot_de_passe' => Hash::make('admin123'),
            'role'         => 'ADMIN',
        ]);

        // Create a supervisor account
        User::create([
            'nom'          => 'Supervisor User',
            'email'        => 'supervisor@example.com',
            'mot_de_passe' => Hash::make('supervisor123'),
            'role'         => 'ENCADRANT',
        ]);

        // Create a student account
        User::create([
            'nom'          => 'Student User',
            'email'        => 'student@example.com',
            'mot_de_passe' => Hash::make('student123'),
            'role'         => 'ETUDIANT',
        ]);
    }
}
