<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentaireRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Both ETUDIANT and ENCADRANT can add comments
        return auth()->check() && 
               (auth()->user()->role === 'ETUDIANT' || auth()->user()->role === 'ENCADRANT');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'contenu' => 'required|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'contenu.required' => 'The comment content is required.',
            'contenu.max' => 'The comment must not exceed 255 characters.',
        ];
    }

    /**
     * Get the error messages for failed authorization.
     */
    protected function failedAuthorization()
    {
        abort(403, 'Only students and supervisors can add comments.');
    }
}
