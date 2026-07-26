<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meja extends Model
{
    protected $table = 'meja';
    protected $fillable = ['label', 'occupied'];
    protected $casts = ['occupied' => 'boolean'];
}
