<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRapportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $rapport = $this->route('rapport');
        
        // Check if the user is the author and rapport is in BROUILLON status
        return auth()->check() && 
               $rapport->isAuthorOf(auth()->user()) && 
               $rapport->statut === 'BROUILLON';
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
        abort(403, 'You can only edit your own rapports in draft status.');
    }
}
