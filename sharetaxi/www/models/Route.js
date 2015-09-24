angular.module('models.route', ['models.place', 'st.service', 'models.directions', 'models.sharingoptions'])
.factory('Route', function($http, Place, SharingOptions, Directions, directionsService){
  function Route(){
    //Locally cached routes have an attribute local_id
    //TODO: taxi fares will be stored as an attribute of route as well
    this.creator_id = -1;
    this.route_id = -1;
    this.origins = [];
    this.destinations = [];
    this.directions = new Directions();
    this.route_type = FASTEST_ROUTE_KEY;
  }

  Route.prototype.saveToBackend = function($http){
    //POST to backend
  };

  Route.prototype.loadFromBackend = function(route_id){

  }

    Route.clone = function(route){
      var c = JSON.parse(JSON.stringify(route));
      return Route.buildFromCachedObject(c);
    }

    Route.buildFromCachedObject = function(obj) {
      var route = new Route();
      route.route_id = obj.route_id;
      route.local_id = obj.local_id;
      route.local_description = obj.local_description;
      route.origins = obj.origins.map(Place.buildFromCachedObject);
      route.destinations = obj.destinations.map(Place.buildFromCachedObject);
      route.directions = Directions.buildFromCachedObject(obj.directions);
      route.creator_id = obj.creator_id;
      if(obj.sharing_options){
        route.sharing_options = SharingOptions.buildFromCachedObject(obj);
      }
      return route;
    }

  Route.buildFromBackendObject = function(obj){
    var route = new Route();
    route.route_id = obj.id;
    route.origins = obj.origins.map(Place.buildFromBackendObject);
    route.destinations = obj.destinations.map(Place.buildFromBackendObject);
    route.directions = Directions.buildFromBackendObject(obj.directions);
    if(obj.share_details){
      route.sharing_options = SharingOptions.buildFromBackendObject(obj.share_details);
    }
    return route;
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
      route_id: this.route_id,
      origins: this.origins.map(function(place){return place.toBackendObject()}),
      destinations: this.destinations.map(function(place){return place.toBackendObject()}),
      google_directions: this.directions.toBackendObject(),
      share_details: (this.sharing_options)?this.sharing_options.toBackendObject():{},
    }
  };

  return Route;
});
