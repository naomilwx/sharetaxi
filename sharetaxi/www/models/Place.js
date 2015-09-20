angular.module('models.place', [])
app.factory('Place', function($http){
  function Place(placeData){
    angular.extend(this, placeData);
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      foramtted_address: this.formatted_address,
      longtitude: this.geometry.location.H,
      latitude: this.geometry.location.L
    }
  };

  Place.createBackendObject = function(placeData){
    return {
      name: placeData.name,
      google_place_id: placeData.place_id,
      foramtted_address: placeData.formatted_address,
      longtitude: placeData.geometry.location.H,
      latitude: placeData.geometry.location.L
    }
  };

  return Place;
});
