<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\RoutePoint;
use App\Models\Ride;
use App\Models\RideUser;
use App\Http\DbUtil;

class RouteController extends Controller
{
    public function __construct() {
      // $this->middleware('auth');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request) {
      $data = $request->json();
      // $data = json_decode($request->input('data'), true);
      $ride = Ride::find($data->get('ride_id'));
      if ($ride) {
        $route = new Route;
        // $route->startTime = $request->input('start_time');
        if ($ride->initiator === Auth::user()->id)
          $route->state = 'accepted';
        else
          $route->state = 'requested';
        $route->endTime =
          !empty($data->get('share_details')) && isset($data->get('share_details')['arrival_time']) ?
          $data->get('share_details')['arrival_time'] : '';
        $route->user_id = Auth::user()->id;
        $route->ride_id = $ride->id;
        $route->note =
          !empty($data->get('share_details')) && isset($data->get('share_details')['notes']) ?
            $data->get('share_details')['notes'] : '';
        if ($ride->initiator === Auth::user()->id) {
          $route->extends = $ride->head;
          $route->save();
          $ride->head = $route->id;
          $ride->save();
        } else
          $route->save();
        foreach ($data->get('origins') as $point) {
          RoutePoint::create([
            'route_id' => $route->id,
            'placeId' => $point['google_place_id'],
            'address' => $point['formatted_address'],
            'location' => $point['longitude'].','.$point['latitude'],
            'name' => $point['name'],
            'type' => 'start'
            ]);
        }
        foreach ($data->get('destinations') as $point) {
          RoutePoint::create([
            'route_id' => $route->id,
            'placeId' => $point['google_place_id'],
            'address' => $point['formatted_address'],
            'location' => $point['longitude'].','.$point['latitude'],
            'name' => $point['name'],
            'type' => 'end'
            ]);
        }
        return Response::json([
          'status' => 'success',
          'data' => DbUtil::serializeRoute($route)
          ]);
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
      $route = Route::find($id);
      if ($route)
        return Response::json([
          'status' => 'success',
          'data' => DbUtil::serializeRoute(Route::find($id))
          ]);
      else
        return Response::json([
          'status' => 'failure',
          'message' => 'record not found'
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
      // $data = json_decode($request->input('data'), true);
      $data = $request->json();
      $route =
        Route::where('id', $id)
        ->where('user_id', Auth::user()->id)
        ->first();
      if ($route) {
        // if ($request->input('startTime'))
        //   $route->startTime = $request->input('startTime');
        if ($data->get('share_details')['arrival_time'])
          $route->endTime = $data->get('share_details')['arrival_time'];
        if ($data->get('share_details')['notes'])
          $route->note = $data->get('share_details')['notes'];
        $route->save();
        return Response::json([
          'status' => 'success',
          'data' => DbUtil::serializeRoute($route)
          ]);
      } else
        return Response::json([
          'status' => 'failure',
          'message' => 'record not found'
          ]);
    }

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
        if ($ride->head === $route->id) {
          // delete
          $ride->head = $route->extends;
          $ride->save();
        }
        $route->delete();
        return Response::json([
          'status' => 'success'
          ]);
      } else
        return Response::json([
          'status' => 'failure',
          'message' => 'record not found'
          ]);
    }

    public function accept(Request $request, $id) {
      $requestRoute = Route::find($id);
      $dirData = $request->json()->get('google_directions');

      if ($requestRoute) {
        $ride = $requestRoute->ride;
        $route = $ride->headRoute;
        if ($requestRoute && $route->user_id === Auth::user()->id) {
          $points = RoutePoint::where('route_id', $requestRoute->id)->get();
          foreach($points as $point){
            RoutePoint::create([
              'route_id' => $route->id,
              'type' => $point->type,
              'placeId' => $point->placeId,
              'location' => $point->location,
              'name' => $point->name,
              'address' => $point->address
              ]);
          }
          if (!RideUser::where('ride_id', $ride->id)
                    ->where('user_id', $requestRoute->user_id)
                    ->first()) {
            RideUser::create([
              'ride_id' => $ride->id,
              'user_id' => $requestRoute->user_id
              ]);
          }
          if(!empty($dirData)){
            $route->direction = json_encode($dirData);
            $route->save();
          }
          $requestRoute->state = 'accepted';
          $requestRoute->save();
          return Response::json([
            'status' => 'success',
            'data' => DbUtil::serializeRoute($route)
            ]);
        }
      }
      return Response::json([
        'status' => 'failure',
        'message' => 'record not found'
        ]);
    }

    public function getRequests() {
      return Response::json(DbUtil::serializeRoutes(
        Route::where('user_id', Auth::user()->id)
          ->where('state', 'requested')
          ->get()));
    }
}
