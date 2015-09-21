<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class RoutePoint extends Model
{
    protected $table = 'route_points';
    protected $fillable = ['location', 'type', 'route_id', 'placeId'];

    public function route() {
      return $this->belongsTo('App\Models\Route', 'route_id');
    }

    public function setLocationAttribute($value) {
      $this->attributes['location'] = DB::raw("POINT($value)");
    }

    public function getLocationAttribute($value) {
      return substr(preg_replace('/[ ,]+/', substr($value, 6), 1), 0, -1);
    }

    public function newQuery($excludeDeleted = true) {
      return parent::newQuery($excludeDeleted)
        ->addSelect('*',
          DB::raw(' astext(location) as location '));
    }

    public function scopeDistance($query, $dist, $location) {
      return $query->whereRaw("st_distance(location, POINT(?))<?",
        [$location, $dist]);
    }

    public function scopeOrDistance($query, $dist, $location) {
      return $query->orWhereRaw("st_distanc(location, POINT(?))<?",
        [$location, $dist]);
    }
}
