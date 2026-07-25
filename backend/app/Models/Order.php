<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';

    protected $fillable = [
        'table_id', 'items', 'subtotal', 'total', 'notes', 'order_mode', 'status', 'type', 'idempotency_key',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'integer',
        'total' => 'integer',
    ];

    // Idempotency: cegah duplikat insert dari frontend
    public function getIdempotencyKeyAttribute($value)
    {
        return $value;
    }
}
