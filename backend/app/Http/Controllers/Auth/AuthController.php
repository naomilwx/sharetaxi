<?php

namespace App\Http\Controllers\Auth;

use Auth;
use Socialite;
use Redirect;
use App\Models\User;
use App\Models\UserAuthToken;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Illuminate\Http\Request;

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

    public function logout(Request $request){
      try {
         Auth::logout();
         return \Response::json(['success' => true, 'user'=> $request->user()]);
      } catch (Exception $e) {
          return \Response::json(['success' => false]);
      }

    }

    public function getLoginStatus(Request $request){
      if(Auth::check()){
        $fbId = \Session::get('fbId');
        return \Response::json(['loggedIn' => true, 'user'=>$request->user() ,'fbId' => $fbId]);
      }
      return \Response::json(['loggedIn' => false, 'user'=>$request->user()]);
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

    //TODO: no need to save token, and no need to store email
    protected function retrieveOrCreateUserFromProvider($data, $token, $provider){
      $id = $data->getProperty('id');
      $name = $data->getProperty('name');
      $email = $data->getProperty('email');

      $authToken = UserAuthToken::where('service_id', $id)
              ->where('service', $provider)->first();
      if($authToken){
        $authToken->token = $token;
        $authToken->save();
        $userRecord = User::where('id', $authToken->user_id)->firstOrFail();
        $userRecord->email = $email;
        $userRecord->save();
        return $userRecord;
      }else {
        //New user
        $userRecord = $this->createUser(
                  $name,
                  $email);
        $this->createToken(
                  $userRecord->id,
                  $provider,
                  $token,
                  $id);

        return $userRecord;
      }
    }
    /**
    * POST: field email is the user's email, name is the user's name and token
    * is the auth token
    */
    public function oauth_token_submission(Request $request, $provider) {
      $this->checkProvider($provider);
      $token = $request->input('token');
      if($token){
        \Facebook::setDefaultAccessToken($token);
        try {
          $response = \Facebook::get('/me?fields=id,name,email');
          $fbUser = $response->getGraphUser();
          $user = $this->retrieveOrCreateUserFromProvider($fbUser, $token, $provider);
          \Session::put('fbToken', $token);
          \Session::put('fbId', $fbUser->getProperty('id'));
          //login user
          Auth::login($user);
          return \Response::json(['success' => true]);
        } catch (\Facebook\Exceptions\FacebookSDKException $e) {
          return \Response::json(['success' => false, 'errors' => [$e->getMessage()]]);
        }

      }
      return \Response::json(['success' => false]);
    }

    public function oauth_token_retrieval($provider, $id) {
      $authToken = UserAuthToken::where('service', $provider)
        ->where('service_id', $id)->first();
      if ($authToken) {
        return \Response::json(['status' => 'success', 'data' => $authToken->token]);
      } else
        return \Response::json(['status' => 'failure', 'message' => 'record not found']);
    }
}
