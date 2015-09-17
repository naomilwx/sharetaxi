<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    /* relations */
    public function userAuthTokens() {
      return $this->hasMany('UserAuthToken');
    }
    public function rides() {
      $this->hasMany('App\Models\Ride', 'user_id');
    }
    public function joinedRides() {
      $this->belongsToMany(
        'App\Models\RideUser',
        'ride_users',
        'user_id',
        'ride_id');
    }
    public function location() {
      $this->hasOne('user_locations', 'user_id');
    }
}
