angular.module('models.route', ['models.place', 'st.service'])
.factory('Route', function($http, Place, directionsService){
  function Route(){
    this.origins = [];
    this.destinations = [];
    this.directions = {};
    this.route_type = FASTEST_ROUTE_KEY;
  }

  Route.prototype.save = function($http){
    //POST to backend
  };

  Route.prototype.addSharingOptions = function(sharingOptions) {
    this.sharing_options = sharingOptions;
  };

  Route.prototype.addOrigin = function(place){
    this.origins.push(place);
  };

  Route.prototype.addDestination = function(place){
    this.destinations.push(place);
  };

  Route.prototype.calculateDirections = function(cb){
    directionsService.getDirections(this.origins, this.destinations, this.route_type, function(results, status){
      if(status == google.maps.DirectionsStatus.OK){
        this.directions = results;
        if(cb){
          cb(results, status);
        }
      }
    });
  };

  Route.prototype.hasOrigins = function(){
    return (this.origins.length > 0);
  };

  Route.prototype.hasDestinations = function(){
    return (this.destinations.length > 0);
  };

  Route.prototype.toBackendObject = function(){
    return {
      origins: this.origins.map(Place.createBackendObject),
      destinations: this.origins.map(Place.createBackendObject),
      google_directions: this.directions,
      share_details: this.sharing_options.toBackendObject()
    }
  };

  return Route;
});
