<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::resource('rides', 'RideController', [
  'only' => ['store', 'index', 'show', 'update', 'destroy']
]);


Route::get('{provider}/login', 'Auth\AuthController@oauth_login');
Route::get('{provider}/login/callback', 'Auth\AuthController@oauth_login_callback');

// login and social network association
Route::get('login/fb', function() {
  $facebook = new Facebook(Config::get('facebook'));
  $params = [
    'redirect_uri' => url('/login/fb/callback'),
    'scope' => 'email'
  ];
  return Redirect::to($facebook->getLoginUrl($params));
});

Route::get('login/fb/callback', function() {
  $code = Input::get('code');
  if (strlen($code) == 0)
    Redirect::to('/');
  $facebook = new Facebook(Config::get('facebook'));
  $user = $facebook->getUser();
});
