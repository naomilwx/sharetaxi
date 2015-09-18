<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
  protected $table = 'rides';
  protected $fillable = ['user_id', ''];
  /* relations */
  public function owner() {
    return $this->belongsTo('App\Models\User', 'user_id');
  }
  public function joinedUsers() {
    return $this->belongsToMany('App\Models\User', 'ride_users', 'user_id', 'ride_id');
  }
}
