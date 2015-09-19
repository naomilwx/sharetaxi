<?php
namespace App\Http\Controllers;

use Auth;
use Request;
use Response;
use App\Http\Requests\Request;
use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\User;

class UserController extends Controller
{
  public function __construct() {
    $this->middleware('auth');
  }
  public function getFriends() {
    $user = User::find(Auth::user()->id);
    return Response::json(User::getFriends($user));
  }
}
