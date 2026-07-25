<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = 'transactions';

    protected $fillable = [
        'table_id', 'items', 'subtotal', 'tax', 'total', 'method',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'integer',
        'tax' => 'integer',
        'total' => 'integer',
    ];
}
