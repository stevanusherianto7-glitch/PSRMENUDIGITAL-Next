<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalShift extends Model
{
    protected $table = 'jadwal_shift';
    protected $fillable = ['employee_name', 'role', 'schedule'];
    protected $casts = ['schedule' => 'array'];
}
