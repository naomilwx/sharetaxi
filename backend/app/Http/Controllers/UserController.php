<?php
namespace App\Http\Controllers;

use Auth;
use Request;
use Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\User;
use App\Models\UserAuthToken;

class UserController extends Controller
{
  public function __construct() {
    $this->middleware('auth');
  }
  public function getFriends() {
    $user = User::find(Auth::user()->id);
    return Response::json(User::getFriends($user));
  }
  public function getFacebookInfo() {
    return Response::json(
      UserAuthToken::where('user_id', Auth::user()->id)
      ->where('service', 'facebook')
      ->first());
  }
}
