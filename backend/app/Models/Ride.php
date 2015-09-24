<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
  protected $table = 'rides';
  protected $fillable = ['user_id', 'start', 'end', 'descriptor'];
  /* relations */
  public function owner() {
    return $this->belongsTo('App\Models\User', 'initiator');
  }
  public function joinedUsers() {
    return $this->belongsToMany('App\Models\User', 'ride_users', 'user_id', 'ride_id');
  }
  public function routes() {
    return $this->hasMany('App\Models\Route', 'ride_id');
  }
  public function headRoute() {
    return $this->hasOne('App\Models\Route', 'id', 'head');
  }
}
