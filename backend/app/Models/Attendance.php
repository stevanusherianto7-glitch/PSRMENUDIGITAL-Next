<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $table = 'attendances';
    protected $fillable = ['employee_name', 'role', 'clock_in', 'clock_out'];
    protected $casts = [
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
    ];
}
