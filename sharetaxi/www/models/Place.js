angular.module('models.place', [])
.factory('Place', function($http){
  function Place(googlePlace){
    if(googlePlace){
      this.name = (googlePlace.name)?googlePlace.name:"";
      this.place_id = (googlePlace.place_id)?googlePlace.place_id:"";
      this.location = (googlePlace.geometry)?googlePlace.geometry.location:null;
    }
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      formatted_address: this.formatted_address,
      //longtitude: this.location.H,
      longitude: this.location.lat(),
      latitude: this.location.lng()
    }
  };

    Place.buildFromCachedObject = function(obj) {
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.place_id;
      place.formatted_address = obj.formatted_address;

      var location = new google.maps.LatLng(obj.location.H, obj.location.L);

      place.location = location;
      return place;
    };

    Place.buildFromBackendObject = function(obj){
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.google_place_id;
      place.formatted_address = obj.formatted_address;
      var location = new google.maps.LatLng(obj.longitude, obj.latitude);
      place.location = location;
      return place;
    };

  return Place;
});
