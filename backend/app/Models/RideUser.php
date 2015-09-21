<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class RideUser extends Model
{
    protected $table = 'ride_users';
    protected $fillable = ['user_id', 'ride_id'];
}
