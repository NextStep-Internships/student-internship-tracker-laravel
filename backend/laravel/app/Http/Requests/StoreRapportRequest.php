<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRapportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only ETUDIANT can create rapports
        return auth()->check() && auth()->user()->role === 'ETUDIANT';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titre.required' => 'The title is required.',
            'titre.max' => 'The title must not exceed 255 characters.',
            'contenu.required' => 'The content is required.',
            'contenu.max' => 'The content must not exceed 255 characters.',
        ];
    }

    /**
     * Get the error messages for failed authorization.
     */
    protected function failedAuthorization()
    {
        abort(403, 'Only students can create rapports.');
    }
}
