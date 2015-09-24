<?php

namespace App\Http\Controllers;

use Response;
use Auth;
use Illuminate\Http\Request;
use App\Models\Route;
use App\Models\RoutePoint;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class RoutePointController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
      $data = json_decode($request->input('data'), true);
      $route = Route::find($data['route_id']);
      if ($route && $route->user_id === Auth::user()->id) {
        return Response::json([
          'status' => 'success',
          'data' => RoutePoint::create([
            'route_id' => $route->id,
            'location' => $data['location']['L'].','.$data['location']['H'],
            'type' => isset($data['type']) ? $data['type'] : 'start',
            'placeId' => $data['google_place_id'],
            'address' => $data['formatted_address'],
            'name' => $data['name']
            ])]);
      } else
        return Response::json([
          'status' => 'failure',
          'message' => 'record not found'
          ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $routePoint = RoutePoint::find($id);
        $route = $routePoint->route;
        if ($routePoint && $route->user_id === Auth::user()->id) {
          return Response::json([
            'status' => 'success',
            'data' => $routePoint
            ]);
        } else {
          return Response::json([
            'status' => 'failure',
            'message' => 'record not found'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
      $routePoint = RoutePoint::find($id);
      $route = $routePoint->route;
      if ($route->user_id === Auth::user()->id) {
        $routePoint->delete();
        return Response::json([
          'status' => 'success'
          ]);
      } else
        return Response::json([
          'status' => 'failure',
          'message' => 'record not found'
          ]);
    }
}
