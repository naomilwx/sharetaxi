<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserLocation extends Model
{
    public function user() {
      $this->hasOne('users', 'id', 'user_id');
    }
}
