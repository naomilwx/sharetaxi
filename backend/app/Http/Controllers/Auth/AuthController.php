<?php

namespace App\Http\Controllers\Auth;

use Auth;
use Socialite;
use Redirect;
use Response;
use Facebook;
use Session;
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

    private function createToken($id, $service, $service_id) {
      UserAuthToken::create([
        'user_id' => $id,
        'service' => $service,
        'service_id' => $service_id
      ]);
    }

    private function createUser($name, $email) {
      $user = User::firstOrNew(['email' => $email]);
      $user->name = $name;
      $user->save();
      return $user;
    }

    public function logout(Request $request){
      try {
         Auth::logout();
         return Response::json(['success' => true, 'user'=> $request->user()]);
      } catch (Exception $e) {
          return Response::json(['success' => false]);
      }

    }

    private function getLongLivedFacebookToken($token){
      $response = Facebook::get('/oauth/access_token?client_id=' 
        . urlencode(env('FACEBOOK_APP_ID')) . 
        '&client_secret=' . urlencode(env('FACEBOOK_APP_SECRET')) 
        . '&grant_type=fb_exchange_token&fb_exchange_token=' . urlencode($token));
      $longtoken = $response->getDecodedBody()['access_token'];
      if($longtoken){
        Session::put('fbToken', $longtoken);
        Facebook::setDefaultAccessToken($longtoken);  
      }
    }

    public function getLoginStatus(Request $request){
      if(Auth::check()){
        $fbId = Session::get('fbId');
        return Response::json(['loggedIn' => true, 'user'=>$request->user() ,'fbId' => $fbId]);
      }
      return Response::json(['loggedIn' => false]);
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
          $user->getId());
      }
      // then register with auth
      $userRecord->attachSocialProfile($user);
      $userRecord->setProvider($provider);
      Auth::login($userRecord);
      return Redirect::to('/');
    }

    //TODO: no need to save token
    protected function retrieveOrCreateUserFromProvider($data, $provider){
      $id = $data->getProperty('id');
      $name = $data->getProperty('name');
      $email = $data->getProperty('email');

      $authToken = UserAuthToken::where('service_id', $id)
              ->where('service', $provider)->first();
      if($authToken){
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
                  $id);

        return $userRecord;
      }
    }

    private function construct_user_response($user_id, $fbId, $name){
      return ["user_id" => $user_id, "facebook_id" => $fbId, "name" => $name];
    }
    /**
    * POST: Validates user using oauth token received
    */
    public function oauth_token_submission(Request $request, $provider) {
      $this->checkProvider($provider);
      $token = $request->input('token');
      if($token){
        try {
          $this->getLongLivedFacebookToken($token);
          if(Auth::check()){
            //User is already logged in
            $fbId = Session::get('fbId');
            $user = Auth::user();
            $user_response = $this->construct_user_response($user->id, $fbId, $user->name);
          }else{
             $response = Facebook::get('/me?fields=id,name,email');
             $fbUser = $response->getGraphUser();
             $user = $this->retrieveOrCreateUserFromProvider($fbUser, $provider);
             $fbId = $fbUser->getProperty('id');
             Session::put('fbId', $fbId);
             //login user
             Auth::login($user);
             $user_response = $this->construct_user_response($user->id, $fbId, $user->name);
          }

          return Response::json(['success' => true, 'user' => $user_response]);
        } catch (Facebook\Exceptions\FacebookSDKException $e) {
          return Response::json(['success' => false, 'errors' => [$e->getMessage()]]);
        }

      }
      return Response::json(['success' => false]);
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
