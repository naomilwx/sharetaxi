<?php namespace App\Http\Middleware;
use Closure;

use Illuminate\Contracts\Routing\Middleware;
use Illuminate\Http\Response;
use Illuminate\Http\RedirectResponse;

class CORS implements Middleware {

 /**
  * Handle an incoming request.
  *
  * @param \Illuminate\Http\Request $request
  * @param \Closure $next
  * @return mixed
  */
  public function handle($request, Closure $next){
    $response = $next($request);
    $response = $response instanceof RedirectResponse ? $response : response($response);
    $response->header('Access-Control-Allow-Origin' , env('CLIENT_SIDE_ROOT_URL'))
          ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With')
          ->header('Access-Control-Allow-Credentials', 'true');
    return $response;
 }
}