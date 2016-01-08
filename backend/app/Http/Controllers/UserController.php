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
use App\Http\DbUtil;

class UserController extends Controller
{
  public function __construct() {
    $this->middleware('auth');
  }
  public function getFriends() {
    $user = User::find(Auth::user()->id);
    $friends = User::getFriends($user);
    return Response::json(DbUtil::serializeUsers($friends));
  }
  public function getFacebookInfo() {
    return Response::json(
      UserAuthToken::where('user_id', Auth::user()->id)
      ->where('service', 'facebook')
      ->first());
  }
  public function getFirstTime() {
    return Response::json(
      User::find(Auth::user()->id)->first_time
    );
  }
  public function setFirstTime(Request $request) {
    $user = User::find(Auth::user()->id);
    $user->firstTime = $request->input('value');
    $user->save();
    return Response::json($user->firstTime);
  }
}
