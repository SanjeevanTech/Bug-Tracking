<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comment extends Model
{
    use HasFactory;
    protected $guarded=[];

    public function bug()
    {
        return $this->belongsTo(Bug::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
