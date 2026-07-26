<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BahanResep extends Model
{
    protected $table = 'bahan_resep';
    protected $fillable = ['name', 'price', 'unit'];
    protected $casts = ['price' => 'decimal:2'];
}
