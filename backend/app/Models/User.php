<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;

class User extends Model
  implements
    AuthenticatableContract,
    AuthorizableContract
{
    use Authenticatable, Authorizable;

    protected $table = 'users';
    protected $fillable = ['name', 'email'];
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

    public function attachSocialProfile($profile) {
      $this->socialProfile = $profile;
    }

    public function setProvider($provider) {
      $this->provider = $provider;
    }
}
