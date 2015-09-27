angular.module('models.place', [])
.factory('Place', function($http){
  function Place(googlePlace){
    if(googlePlace){
      this.name = (googlePlace.name)?googlePlace.name:"";
      this.place_id = (googlePlace.place_id)?googlePlace.place_id:"";
      this.location = (googlePlace.geometry)?googlePlace.geometry.location:null;
      this.formatted_address = (googlePlace.formatted_address)? (googlePlace.formatted_address): "";
    }
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      formatted_address: this.formatted_address,
      longitude: this.location.lat(),
      latitude: this.location.lng()
      // longitude: this.location.lng(), 
      // latitude: this.location.lat()
    }
  };

    Place.buildFromCachedObject = function(obj) {
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.place_id;
      place.formatted_address = obj.formatted_address;
      if (navigator.onLine){
        var location = new google.maps.LatLng(obj.location.H, obj.location.L);
        place.location = location;
      } else {
        
        if(obj.location && obj.location.H){
          place.latitude = obj.location.H;
          place.longitude = obj.location.L;
        } 
        
      }
      
      return place;
    };

    Place.buildFromBackendObject = function(obj){
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.google_place_id;
      place.formatted_address = obj.formatted_address;
      var location = new google.maps.LatLng(obj.longitude, obj.latitude);
      // var location = new google.maps.LatLng(obj.latitude, obj.longitude);

      place.location = location;
      return place;
    };

    Place.prototype.goOnline = function() {
      if(this.latitude){
        GoogleMapsLoader.load(function(google){
          this.location = new google.maps.LatLng(this.latitude, this.longitude);
          delete this.latitude;
          delete this.longitude;
        })
      }
    }

  return Place;
});
