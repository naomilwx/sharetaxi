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
  'only' => ['index', 'show', 'update', 'destroy']
]);

// Authentication
Route::get('{provider}/login', 'Auth\AuthController@oauth_login');
Route::get('{provider}/login/callback', 'Auth\AuthController@oauth_login_callback');

Route::get('/user/friends', 'UserController@getFriends');
