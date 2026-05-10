<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Document;

class DocumentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $documents = Document::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['documents' => $documents]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $user = Auth::user();
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $path = $file->store("documents/{$user->id}", 'local');

        $document = Document::create([
            'user_id'       => $user->id,
            'name'          => $path,
            'original_name' => $originalName,
            'size'          => $file->getSize(),
            'mime_type'     => $file->getMimeType(),
        ]);

        return response()->json(['document' => $document], 201);
    }

    public function download($id)
    {
        $user = Auth::user();
        $document = Document::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        if (!Storage::disk('local')->exists($document->name)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return Storage::disk('local')->download($document->name, $document->original_name);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $document = Document::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        Storage::disk('local')->delete($document->name);
        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}