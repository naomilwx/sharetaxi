<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Response;
use DB;
use App\Http\DbUtil;
use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\RideUser;
use App\Models\Route;
use App\Models\RoutePoint;
use App\Models\User;


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
      // $data = json_decode($request->input('data'), true);
      $data = $request->json();
      error_log(print_r($data->get('origins'), true));
      error_log('debug');
      error_log(print_r($data, true));
      error_log('here');
      $ride = new Ride;
      $ride->initiator = Auth::user()->id;
      $ride->save();

      $rideUser = new RideUser;
      $rideUser->ride_id = $ride->id;
      $rideUser->user_id = Auth::user()->id;
      $rideUser->save();

      $route = new Route;
      $route->ride_id = $ride->id;
      $route->direction = !empty($data->get('google_direction')) ? $data->get('google_direction') : '';
      $route->user_id = Auth::user()->id;
      $route->state = 'accepted';
      $route->note =
        !empty($data->get('share_details')) && isset($data->get('share_details')['notes']) ?
          $data->get('share_details')['notes'] : '';
      $route->endTime =
        !empty($data->get('share_details')) && isset($data->get('share_details')['arrival_time']) ?
          $data->get('share_details')['arrival_time'] : '';
      $route->save();

      $ride->head = $route->id;
      $ride->save();

      foreach ($data->get('origins') as $point) {
        $addr = isset($point['formatted_address'])?$point['formatted_address']: '';
        RoutePoint::create([
          'placeId' => $point['google_place_id'],
          'address' => $addr,
          'location' => $point['longitude'].','.$point['latitude'],
          'name' => $point['name'],
          'type' => 'start'
          ]);
      }
      foreach ($data->get('destinations') as $point) {
        $addr = isset($point['formatted_address'])?$point['formatted_address']: '';
        RoutePoint::create([
          'placeId' => $point['google_place_id'],
          'address' => $addr,
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
      $rides = Ride::whereExists(function($query) use (&$request) {
        $query->select(DB::raw(1))->from('routes')
        ->whereRaw('rides.head = routes.id');
        if ($request->input('startAfter'))
          $query->whereRaw('routes.startTime >= ?', [$request->input('startAfter')]);
        if ($request->input('endBefore'))
          $query->whereRaw('routes.endTime <= ?', [$request->input('endBefore')]);
        if ($request->input('points'))
          $query->whereExists(function($query) use (&$request){
            $query->select(DB::raw(1))->from('route_points')
              ->whereRaw('routes.id = route_points.route_id');
            $points = json_decode($request->input('points'), true);
            if (count($points)) {
              $query->whereRaw('st_distance(location, POINT(?,?)) < ?',
                [$points[0]['longitude'], $points[0]['latitude'], $points[0]['dist']]);
              for($i = 1, $end = count($points); $i < $end; ++$i)
                $query->orWhereRaw('st_distance(location, POINT(?,?)) < ?',
                  [$points[$i]['longitude'], $points[$i]['latitude'], $points[$i]['dist']]);
            }
          });
      })->get();
      $results = [];
      foreach($rides as $ride)
        $results[] = DbUtil::serializeRide($ride);
      return Response::json([
        'status' => 'success',
        'data' => $results
      ]);
    }
}
