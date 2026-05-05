<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRapportStatutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the user is an ENCADRANT or ADMIN
        return auth()->check() && 
               (auth()->user()->role === 'ENCADRANT' || auth()->user()->role === 'ADMIN');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'statut' => 'required|in:BROUILLON,SOUMIS,VALIDE,REJETE',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'statut.required' => 'The status is required.',
            'statut.in' => 'The status must be one of: BROUILLON, SOUMIS, VALIDE, REJETE.',
        ];
    }

    /**
     * Get the error messages for failed authorization.
     */
    protected function failedAuthorization()
    {
        abort(403, 'Only supervisors or admins can change rapport status.');
    }
}
