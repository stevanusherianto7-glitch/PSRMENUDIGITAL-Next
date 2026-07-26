<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $table = 'reservations';
    protected $fillable = ['name','date','party','status','note'];
    protected $casts = ['party' => 'integer'];
}
