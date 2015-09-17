<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\UserAuthToken;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
//        $this->middleware('guest', ['except' => 'getLogout']);
        $this->supported_providers = array('facebook', 'google');
    }

    public function oauth_login($provider) {
        if(!in_array($provider, $this->supported_providers)){
            abort('404');
        }
        return Socialize::with($provider)->redirect();
    }

    public function oauth_login_callback($provider) {
        $user = Socialize::with($provider)->user();
        // Check in user
        $userRecord =
          User::where('email', $user->getEmail())->first();
        if ($userRecord) {
          // user record exist
          // first update token
          $authToken = UserAuthToken::where(
            'user_id', $userRecord->id)
          ->where(
            'service', $provider
          )->update(['token' => $user->token]);
          // then register with auth
          Auth::login([
            'record' => $userRecord,
            'service' => $provider,
            'socialProfile' => $user
          ]);
        } else {
          // create a new user
          $userRecord = User::create([
            'name' => $user->getName(),
            'email' => $user->getEmail()
          ]);
          $authToken = UserAuthToken::create([
            'user_id' => $userRecord->id,
            'service' => $provider,
            'token' => $user->token
          ]);
        }
    }
}
