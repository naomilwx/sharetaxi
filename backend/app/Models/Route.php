<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $table = 'routes';

    public function ride() {
      return $this->belongsTo('App\Models\Ride', 'ride_id');
    }

    public function user() {
      return $this->belongsTo('App\Models\User', 'user_id');
    }

    public function points() {
      return $this->hasMany('App\Models\RoutePoint', 'route_id');
    }
}
