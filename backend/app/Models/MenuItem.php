<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $table = 'menu_items';

    protected $fillable = [
        'name', 'category', 'price', 'image', 'available', 'tag', 'description',
    ];

    protected $casts = [
        'price' => 'integer',
        'available' => 'boolean',
    ];
}
