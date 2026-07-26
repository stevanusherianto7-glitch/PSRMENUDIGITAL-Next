<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $table = 'inventory_logs';
    protected $fillable = ['inventory_id','change','note'];
    protected $casts = ['change' => 'integer'];
}
