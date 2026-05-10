<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deadline extends Model
{
    protected $table = 'deadlines';

    public $timestamps = false;

    protected $fillable = [
        'type',
        'date_limite',
    ];
}