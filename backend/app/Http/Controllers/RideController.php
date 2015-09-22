<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Response;
use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\RideUser;
use App\Models\Route;
use App\Models\User;
use App\DbUtil;

class RideController extends Controller
{
    public function __construct() {
      $this->middleware('auth');
    }
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
      $user = User::find(Auth::user()->id);
      $rides = $user->joinedRides;
      return Response::json($rides);
    }

    /**
    * data field contains a json object
    */
    public function store(Request $request) {
      $data = json_decode($request->input('data'), true);
      $ride = new Ride;
      $ride->initiator = Auth::user()->id;
      $ride->save();

      $rideUser = new RideUser;
      $rideUser->ride_id = $ride->id;
      $rideUser->user_id = Auth::user()->id;
      $rideUser->save();

      $route = new Route;
      $route->ride_id = $ride->id;
      $route->direction = isset($data['google_direction']) ? $data['google_direction'] : '';
      $route->user_id = Auth::user()->id;
      $route->state = 'accepted';
      $route->note =
        isset($data['share_details']) && isset($data['share_details']['notes']) ?
          $data['share_details']['notes'] : '';
      $route->endTime =
        isset($data['share_details']) && isset($data['share_details']['arrival_time']) ?
          $data['share_details']['arrival_time'] : '';
      $route->save();

      $ride->head = $route->id;
      $ride->save();

      foreach ($data['origins'] as $point) {
        RoutePoint::create([
          'placeId' => $point['google_place_id'],
          'address' => $point['formatted_address'],
          'location' => $point['longitude'].','.$point['latitude'],
          'name' => $point['name'],
          'type' => 'start'
          ]);
      }
      foreach ($data['destinations'] as $point) {
        RoutePoint::create([
          'placeId' => $point['google_place_id'],
          'address' => $point['formatted_address'],
          'location' => $point['longitude'].','.$point['latitude'],
          'name' => $point['name'],
          'type' => 'end'
          ]);
      }

      return Response::json([
        'status' => 'success',
        'data' => DbUtil::serializeRide($ride)
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
      $ride = Ride::find($id);
      if ($ride)
        return Response::json([
          'status' => 'success',
          'data' => DbUtil::serializeRide($ride)
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
        $ride = Ride::find($id);
        if ($ride) {
          if ($request->input('descriptor'))
            $ride->descriptor = $request->input('descriptor');
          if ($request->input('start'))
            $ride->start = $request->input('start');
          if ($request->input('end'))
            $ride->end = $request->input('end');
          $ride->save();
          return Response::json([
            'status' => 'success',
            'data' => DbUtil::serializeRide($ride)
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
      Ride::destroy($id);
      return Response::json([
        'status' => 'success'
      ]);
    }

    public function getRoutes($id) {
      $ride = Ride::find($id);
      return Response::json($ride->routes);
    }

    public function search(Request $request) {
      $points = [];
      if ($request->input('points')) {
        $points = array_map(function ($value) {
          return json_decode($value);
        }, $request->input('points'));
      }
      $routePoints = RoutePoints::all();
      if (count($points)) {
        $routePoints = $routePoints->distance($points[0]['location'], $points[0]['dist']);
        for($i = 1, $end = count($points); $i < $end; ++$i)
          $routePoints = $routePoints->orDistance($points[$i]['location'], $points[$i]['dist']);
      }
      $rides = $routePoints->route()->ride();
      if ($request->input('startAfter'))
        $rides = $rides->where('startTime >= ?', [$request->input('startAfter')]);
      if ($request->input('endBefore'))
        $rides = $rides->where('endTime <= ?', [$request->input('endBefore')]);
      return Response::text($rides->get()->toJson());
    }
}
