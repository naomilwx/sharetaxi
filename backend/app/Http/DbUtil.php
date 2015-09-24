<?php

namespace App\Http;

class DbUtil {
  public static function serializeRide($ride) {
    return [
      'id' => $ride->id,
      'route' => DbUtil::serializeRoute($ride->headRoute)
    ];
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
