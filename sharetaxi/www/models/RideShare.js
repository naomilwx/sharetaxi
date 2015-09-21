angular.module('models.rideshare', ['models.route', 'models.user'])
.factory('RideShare', function($http, Route, User){
  function RideShare(){
    //attributes: owner, riders, route
    this.owner = new User();
    this.riders = [];
    this.route = new Route();
  }

  RideShare.prototype.toBackendObject = function(){
    return {
      owner: this.owner.toBackendObject(),
      riders: this.riders.map(User.toBackendObject),
      route: this.route.toBackendObject()
    };
  };

  RideShare.buildFromBackendObject = function(obj) {
    var rideShare = new RideShare();
    rideShare.owner = User.buildFromBackendObject(obj.owner);
    rideShare.riders = obj.riders.map(User.buildFromBackendObject);
    rideShare.route = Route.buildFromBackendObject(obj.route);
    return rideShare;
  };

  return RideShare;
});
