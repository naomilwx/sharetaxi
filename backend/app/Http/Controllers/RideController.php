<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Auth;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Ride;

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
      $user = Auth::user();
      // TODO connect to db
      $rides = $user->$userRecord->joinedRides();
      return Response::json($rides);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        $ride = new Ride;
        $ride->initiator = Auth::user()->id;
        $ride->save();

        $rideUser = new RideUser;
        $rideUser->ride_id = $ride->id;
        $rideUser->user_id = Auth::user()->id;
        $rideUser->save();
        return Response::json([
          'result' => 'success',
          'data' => $ride
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
            'result' => 'success',
            'data' => $ride
          ]);
        else
          return Response::json([
            'result' => 'failure',
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
            $ride->end = $request->input('end')
          $ride->save();
          return Response::json([
            'status' => 'success',
            'data' => $ride
          ]);
        } else
          return Response::json([
            'status' => 'failure',
            'message' => 'record not found'
          ])
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
}
