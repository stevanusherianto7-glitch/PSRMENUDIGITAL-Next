<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $table = 'transaction_items';
    protected $fillable = ['transaction_id','name','price','qty'];
    protected $casts = ['price' => 'integer','qty' => 'integer'];
}
