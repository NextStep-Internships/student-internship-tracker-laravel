<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Deadline;

class DeadlineController extends Controller
{
    public function index()
    {
        $deadlines = Deadline::orderBy('date_limite', 'asc')->get();

        return response()->json(['events' => $deadlines->map(function ($d) {
            return [
                'id'    => $d->id,
                'title' => $d->type,
                'date'  => $d->date_limite,
                'type'  => 'DEADLINE',
            ];
        })]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date'  => 'required|date',
        ]);

        $deadline = Deadline::create([
            'type'        => $request->title,
            'date_limite' => $request->date,
        ]);

        return response()->json(['event' => [
            'id'    => $deadline->id,
            'title' => $deadline->type,
            'date'  => $deadline->date_limite,
            'type'  => 'DEADLINE',
        ]], 201);
    }

    public function destroy($id)
    {
        $deadline = Deadline::findOrFail($id);
        $deadline->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}