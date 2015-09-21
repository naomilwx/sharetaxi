<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $table = 'routes';
    private $geodata = ['startPlaceCoord', 'endPlaceCoord'];

    public function ride() {
      return $this->belongsTo('App\Models\Ride', 'ride_id');
    }

    public function user() {
      return $this->belongsTo('App\Models\User', 'user_id');
    }

    private function setGeoData($field, $value) {
      $this->attributes[$field] = DB::raw("POINT($value)");
    }

    public function setStartPlaceCoordAttribute($value) {
      $this->setGeoData('startPlaceCoord', $value);
    }

    public function setEndPlaceCoordAttribute($value) {
      $this->setGeoData('endPlaceCoord', $value);
    }

    private static function getGeoData($value) {
      return substr(preg_replace('/[ ,]+/', substr($value, 6), 1), 0, -1);
    }

    public function getStartPlaceCoordAttribute($value) {
      return Route::getGeoData($value);
    }

    public function newQuery($excludeDeleted = true) {
      $raw = '';
      foreach($this->geodata as $field)
        $raw .= ' astext('.$field.') as '.$field.' ';
      return parent::newQuery($excludeDeleted)->addSelect('*', DB::raw($raw));
    }

    private static function queryDistance($query, $field, $dist, $location) {
      return $query->whereRaw("st_distance($field, POINT($location))<$dist");
    }

    public function scopeStartDistance($query, $dist, $location) {
      return Route::queryDistance($query, 'startPlaceCoord', $dist, $location);
    }

    public function scopeEndDistance($query, $dist, $location) {
      return Route::queryDistance($query, 'endPlaceCoord', $dist, $location);
    }
}
