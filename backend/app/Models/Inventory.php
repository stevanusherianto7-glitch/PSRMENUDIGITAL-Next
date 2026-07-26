<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory';
    protected $fillable = ['name','qty','unit','exp_date','category','method','stock','min_stock'];
    protected $casts = [
        'qty' => 'integer',
        'stock' => 'integer',
        'min_stock' => 'integer',
    ];
}
