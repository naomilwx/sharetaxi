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

// Authentication
Route::get('{provider}/login', 'Auth\AuthController@oauth_login');
Route::get('{provider}/login/callback', 'Auth\AuthController@oauth_login_callback');
Route::get('getLoginStatus', 'Auth\AuthController@getLoginStatus');
// Token submission and retrieval
Route::post('{provider}/token', 'Auth\AuthController@oauth_token_submission');
Route::post('logout', 'Auth\AuthController@logout');
Route::get('{provider}/token/{email}', 'Auth\AuthController@oauth_token_retrieval');
Route::get('user/friends', 'UserController@getFriends');
Route::get('user/facebook', 'UserController@getFacebookInfo');
Route::get('user/first_time', 'UserController@getFirstTime');
Route::post('user/first_time', 'UserController@setFirstTime');
// Ride
Route::resource('rides', 'RideController', [
  'only' => ['index', 'store', 'show', 'update', 'destroy']
]);
Route::post('rides/search', 'RideController@search');
Route::get('rides/{id}/routes', 'RideController@getRoutes');
// Routes
Route::resource('routes', 'RouteController', [
  'only' => ['show', 'store', 'update', 'destroy']
]);
Route::post('routes/{id}/accept', 'RouteController@accept');
// Route::get('routes/{id}/request', 'RouteController@request');
Route::resource('route_points', 'RoutePointController', [
  'only' => ['store', 'destroy', 'show']
  ]);
