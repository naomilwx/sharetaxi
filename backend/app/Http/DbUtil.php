<?php

namespace App\Http;

class DbUtil {
  public static function serializeRide($ride) {
    return [
      'id' => $ride->id,
      'route' => DbUtil::serializeRoute($ride->headRoute),
      'joinedUsers' => DbUtil::serializeUsers($ride->joinedUsers),
      'owner_id' => $ride->initiator
    ];
  }

  public static function serializeRides($rides) {
    $results = [];
    foreach($rides as $ride)
      $results[] = DbUtil::serializeRide($ride);
    return $results;
  }

  public static function serializeUsers($users) {
    $results = [];
    foreach($users as $user)
      $results[] = DbUtil::serializeUser($user);
    return $results;
  }

  public static function serializeUser($user) {
    return [
      'name' => $user->name,
      'email' => $user->email,
      'id' => $user->id
    ];
  }

  public static function serializeUserResult($user, $facebook_id){
    $u = DbUtil::serializeUser($user);
    $u['facebook_id'] = $facebook_id;
    return $u;
  }

  public static function serializeRoute($route) {
    if ($route) {
      $points = $route->points;
      $origins = [];
      $destinations = [];
      foreach($points as $point)
        if ($point->type === 'start')
          $origins[] = $point;
        else
          $destinations[] = $point;
      return [
        'id' => $route->id,
        'ride_id' => $route->ride_id,
        'user_id' => $route->user_id,
        'state' => $route->state,
        'direction' => json_decode($route->direction),
        'origins' =>
          array_map(
            function($x){return DbUtil::serializeRoutePoint($x);},
            $origins),
        'destinations' =>
          array_map(
            function($x){return DbUtil::serializeRoutePoint($x);},
            $destinations),
        'share_details' => [
          'arrival_time' => $route->endTime,
          'notes' => $route->note
          ]
      ];
    } else
      return [];
  }

  public static function serializeRoutes($routes) {
    $results = [];
    foreach($routes as $route)
      $results[] = DbUtil::serializeRoute($route);
    return $results;
  }

  public static function serializeRoutePoint($point) {
    $location = $point->location;
    list($longitude, $latitude) = explode(',', $location);
    return [
      'name' => $point->name,
      'google_place_id' => $point->placeId,
      'formatted_address' => $point->address,
      'longitude' => $longitude,
      'latitude' => $latitude
    ];
  }
}
