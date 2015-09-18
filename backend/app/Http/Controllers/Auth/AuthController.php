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

    private function updateToken($id, $service, $token) {
      UserAuthToken::where('user_id', $id)
        ->where('service', $service)
        ->update(['token' => $token]);
    }

    private function createToken($id, $service, $token) {
      UserAuthToken::create([
        'user_id' => $id,
        'service' => $service,
        'token' => $token
      ]);
    }

    private function createUser($name, $email) {
      return User::create([
        'name' => $name,
        'email' => $email
      ]);
    }

    public function oauth_login_callback($provider) {
        $user = Socialize::with($provider)->user();
        // Check in user
        $userRecord =
          User::where('email', $user->getEmail())->first();
        if ($userRecord) {
          // user record exist
          // first update token
          $this->updateToken($userRecord->$id, $provider, $user->token);
        } else {
          // create a new user
          $userRecord = $this->createUser($user->getName(), $user->getEmail());
          $this->createToken($userRecord->id, $provider, $user->token);
        }
        // then register with auth
        Auth::login([
          'record' => $userRecord,
          'service' => $provider,
          'socialProfile' => $user
        ]);
        return Redirect::to('/');
    }
}
