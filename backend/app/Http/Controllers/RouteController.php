<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\RoutePoint;
use App\Models\Ride;
use App\Models\RideUser;

class RouteController extends Controller
{
    public function __construct() {
      $this->middleware('auth');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $ride = Ride::find($request->input('ride_id'));
        if ($ride) {
          $route = new Route;
          $route->startTime = $request->input('start_time');
          $route->endTime = $request->input('end_time');
          $route->user_id = Auth::user()->id;
          $route->ride_id = $ride->id;
          $route->note = $reqeust->input('note');
          if ($ride->initiator === Auth::user()->id)
            $route->state = 'accepted';
          else
            $route->state = 'requested';
          if ($request->input('route_points')) {
            foreach($request->input('route_points') as $point) {
              RoutePoint::create([
                'location' => $point['location'],
                'type' => $point['type'],
                'route_id' => $route->id,
                'placeId' => $point['placeId']
                ]);
            }
          }
          if ($request->input('request_route_id')) {
            $requestRoute = Route::find($request->input('request_route_id'));
            if ($request->input('request_route_auto_merge')) {
              RoutePoint::where('route_id', $requestRoute->id)
                ->update([
                  'route_id' => $id
                  ]);
              $headRoute = $ride->headRoute;
              if ($headRoute) {
                foreach($headRoute->points as $point) {
                  RoutePoint::create([
                    'route_id' => $point->route_id,
                    'location' => $point->location,
                    'placeId' => $point->placeId
                  ]);
                }
              }
            }
            if ($requestRoute) {
              $ride = $route->ride;
              $route->delta = $requestRoute->toJson();
              $rideUser = RideUser::where('ride_id', $ride->id)
                ->where('user_id', $requestRoute->user_id)->first();
              if (!$rideUser)
                RideUser::create([
                  'ride_id' => $ride->id,
                  'user_id' => $requestRoute->user_id
                  ]);
              $requestRoute->destroy();
            }
          }
          // update head
          $route->extends = $ride->head;
          $route->save();
          $ride->head = $route->id;
          $ride->save();
          return Response::json([
            'status' => 'success',
            'data' => $route
            ]);
        }
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
        return Response::json([
          'status' => 'success',
          'data' => Route::find($id)
          ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        $route = Route::find($id);
        if ($route) {
          if ($request->input('startTime'))
            $route->startTime = $request->input('startTime');
          if ($request->input('endTime'))
            $route->endTime = $request->input('endTime');
          if ($request->input('note'))
            $route->note = $request->input('note');
          if ($request->input('request_route_id')) {
            $requestRoute = Route::find($request->input('request_route_id'));
            if ($request->input('request_route_auto_merge')) {
              RoutePoint::where('route_id', $requestRoute->id)
                ->update([
                  'route_id' => $id
                  ]);
            }
            if ($requestRoute) {
              $ride = $route->ride;
              $route->delta = $requestRoute->toJson();
              $rideUser = RideUser::where('ride_id', $ride->id)
                ->where('user_id', $requestRoute->user_id)->first();
              if (!$rideUser)
                RideUser::create([
                  'ride_id' => $ride->id,
                  'user_id' => $requestRoute->user_id
                  ]);
              $requestRoute->destroy();
            }
          }
          $route->save();
          return Response::json([
            'status' => 'success',
            'data' => $route
            ]);
        } else
          return Response::json([
            'status' => 'failure',
            'message' => 'record not found'
            ]);

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        $route = Route::find($id);
        if ($route) {
          $ride = $route->ride;
          if ($ride && $ride->head === $route->id) {
            // delete
            $ride->head = $route->extends;
            $route->destroy();
            $ride->save();
            return Response::json([
              'status' => 'success'
              ]);
          }
        }
        return Response::json([
          'status' => 'failure',
          'message' => 'record not found'
          ]);
    }
}
