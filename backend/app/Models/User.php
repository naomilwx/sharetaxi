<?php

namespace App\Models;

use Config;
use Facebook\Facebook;
use Facebook\FacebookRequest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;

use SammyK\LaravelFacebookSdk\LaravelFacebookSdk;

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
      return $this->hasMany('App\Models\UserAuthToken', 'user_id');
    }
    public function rides() {
      return $this->hasMany('App\Models\Ride', 'initiator');
    }
    public function joinedRides() {
      return $this->belongsToMany(
        'App\Models\Ride',
        'ride_users',
        'user_id',
        'ride_id');
    }
    public function location() {
      return $this->hasOne('user_locations', 'user_id');
    }

    public function attachSocialProfile($profile) {
      $this->socialProfile = $profile;
    }

    public function setProvider($provider) {
      $this->provider = $provider;
    }

    private static function getFacebookFriends($user, $token) {
      $ids = [];
      $fbConfig['default_access_token'] = $token;
      $fb = new Facebook(Config::get('services.facebook'));
      $fb->setDefaultAccessToken($token);
      $response = $fb->get('/me/friends', $token)->getDecodedBody()['data'];
      $friendsList = $response;
      foreach($friendsList as $friend) {
        $userAuth = UserAuthToken::where('service', 'facebook')
          ->where('service_id', $friend['id'])
          ->first();
        if ($userAuth)
          $ids[] = $userAuth->user->id;
      }
      return $ids;
    }
    //TODO: identify by facebook id, not email. Also, get email from session data
    public static function getFriends($user) {
      $ids = [];
      $tokens = $user->userAuthTokens;
      foreach ($tokens as $token)
        switch ($token->service) {
        case 'facebook':
          $ids += User::getFacebookFriends($user, $token->token);
        break;
        case 'google':
        break;
        }
      if (count($ids))
        return User::find($ids);
      else
        return [];
    }
}
