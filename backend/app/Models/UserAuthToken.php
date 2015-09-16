<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAuthToken extends Model
{
    protected $table = 'user_auth_tokens';
    /* relations */
    public function user() {
      $this->belongsTo('App\Models\User');
    }
}
