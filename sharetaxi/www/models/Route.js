angular.module('models.route', ['models.place'])
app.factory('Route', function($http, Place){
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
  }

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
