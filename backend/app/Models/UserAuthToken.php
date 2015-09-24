<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAuthToken extends Model
{
    protected $table = 'user_auth_tokens';
    protected $fillable = ['user_id', 'service', 'service_id'];
    /* relations */
    public function user() {
      return $this->belongsTo('App\Models\User', 'user_id');
    }
}
