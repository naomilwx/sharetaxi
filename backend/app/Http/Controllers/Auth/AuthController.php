<?php

namespace App\Http\Controllers\Auth;

use Socialite;
use Auth;
use Redirect;
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

    private function checkProvider($provider) {
        if(!in_array($provider, $this->supported_providers)){
            abort('404');
        }
    }

    public function oauth_login($provider) {
        $this->checkProvider($provider);
        return Socialite::driver($provider)
          ->scopes(['email', 'user_friends'])
          ->redirect();
    }

    private function updateToken($id, $service, $token) {
      UserAuthToken::where('user_id', $id)
        ->where('service', $service)
        ->update(['token' => $token]);
    }

    private function createToken($id, $service, $token, $service_id) {
      UserAuthToken::create([
        'user_id' => $id,
        'service' => $service,
        'token' => $token,
        'service_id' => $service_id
      ]);
    }

    private function createUser($name, $email) {
      return User::create([
        'name' => $name,
        'email' => $email
      ]);
    }

    public function oauth_login_callback($provider) {
      try {
        $user = Socialite::driver($provider)->user();
      } catch (Exception $e) {
        return Redirect::to('/'); // Socialite fail
      }
      // Check in user
      $userRecord =
        User::where('email', $user->getEmail())->first();
      if ($userRecord) {
        // user record exist
        // first update token
        $this->updateToken($userRecord->id, $provider, $user->token);
      } else {
        // create a new user
        $userRecord = $this->createUser($user->getName(), $user->getEmail());
        $this->createToken(
          $userRecord->id,
          $provider,
          $user->token,
          $user->getId());
      }
      // then register with auth
      $userRecord->attachSocialProfile($user);
      $userRecord->setProvider($provider);
      Auth::login($userRecord);
      return Redirect::to('/');
    }

    /**
    * POST: field email is the user's email, name is the user's name and token
    * is the auth token
    */
    public function oauth_token_submission(Request $request, $provider) {
      $this->checkProvider($provider);
      $authToken = UserAuthToken::where('service_id', $request->input('id'))
        ->where('service', $provider)->first();
      if ($authToken) {
        $authToken->token = $request->input('token');
        $authToken->save();
      } else {
        $userRecord = $this->createUser(
          $request->input('name'),
          $request->input('email'));
        $this->createToken(
          $userRecord->id,
          $provider,
          $request->input('token'),
          $request->input('id'));
        Auth::login($userRecord);
      }
      return Response::json(['status' => 'success']);
    }

    public function oauth_token_retrieval($provider, $id) {
      $authToken = UserAuthToken::where('service', $provider)
        ->where('service_id', $id)->first();
      if ($authToken) {
        return Response::json(['status' => 'success', 'data' => $authToken->token]);
      } else
        return Response::json(['status' => 'failure', 'message' => 'record not found']);
    }
}
