angular.module('models.rideshare', ['models.route', 'models.user'])
.factory('RideShare', function($http, Route, User){
  function RideShare(){
    //attributes: owner, riders, route
    this.ride_share_id = -1;
    this.owner = new User();
    this.riders = [];
    this.route = new Route();
  }

  RideShare.prototype.getNumberOfRiders = function(){
    return this.riders.length;
  };

  RideShare.buildFromCachedObject = function(obj) {
    var rideShare = new RideShare();
    rideShare.ride_share_id = obj.ride_share_id;
    rideShare.owner = User.buildFromCachedObject(obj.owner);
    rideShare.riders = obj.riders.map(User.buildFromCachedObject(obj.riders));
    return rideShare;
  }

  RideShare.prototype.toBackendObject = function(){
    return {
      ride_share_id: this.ride_share_id,
      owner: this.owner.toBackendObject(),
      riders: this.riders.map(function(user){return user.toBackendObject()}),
      route: this.route.toBackendObject()
    };
  };

  RideShare.buildFromBackendObject = function(obj) {
    var rideShare = new RideShare();
    rideShare.ride_share_id = obj.id;
    if(obj.owner){
      rideShare.owner = User.buildFromBackendObject(obj.owner);
    }
    if(obj.riders){
      rideShare.riders = obj.riders.map(User.buildFromBackendObject);
    }
    rideShare.route = Route.buildFromBackendObject(obj.route);
    return rideShare;
  };

  return RideShare;
});
