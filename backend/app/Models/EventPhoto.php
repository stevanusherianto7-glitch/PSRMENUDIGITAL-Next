<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventPhoto extends Model
{
    protected $table = 'event_gallery';

    protected $fillable = [
        'image', 'title', 'date', 'category', 'description',
    ];
}
