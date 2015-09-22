angular.module('models.place', [])
.factory('Place', function($http){
  function Place(placeData){
    angular.extend(this, placeData);
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      formatted_address: this.formatted_address,
      longtitude: this.geometry.location.H,
      latitude: this.geometry.location.L
    }
  };

    Place.buildFromBackendObject = function(obj){
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.google_place_id;
      place.formatted_address = obj.formatted_address;
      place.longtitude = obj.longtitude;
      place.latitude = obj.latitude;
      return place;
    };

  Place.createBackendObject = function(placeData){
    return {
      name: placeData.name,
      google_place_id: placeData.place_id,
      formatted_address: placeData.formatted_address,
      longtitude: placeData.geometry.location.H,
      latitude: placeData.geometry.location.L
    }
  };

  return Place;
});
