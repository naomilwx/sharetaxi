<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLocation extends Model
{
    public function user() {
      return $this->hasOne('users', 'id', 'user_id');
    }
}
