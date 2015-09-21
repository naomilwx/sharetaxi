<?php

namespace App\Http\Controllers;

use Response;
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
        $route = Route::find($request->input('route_id'));
        if ($route) {
          RoutePoint::create([
            'route_id' => $route->id,
            'location' => $request->input('location'),
            'type' => $request->input('type'),
            'placeId' => $request->input('placeId')
            ]);
        }
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
        if ($routePoint) {
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
        RoutePoint::destroy($id);
        return Response::json([
          'status' => 'success'
          ]);
    }
}
