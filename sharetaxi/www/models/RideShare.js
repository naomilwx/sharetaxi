angular.module('models.rideshare', ['models.route', 'models.user', 'st.user.service'])
.factory('RideShare', function($http, Route, User, userService){
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
      owner: this.owner.toBackendObject(),
      riders: this.riders.map(function(user){return user.toBackendObject()}),
      route: this.route.toBackendObject()
    };
  };

  RideShare.prototype.getShareDescription = function(){
    return this.route.sharing_options.notes;
  }
  RideShare.buildFromBackendObject = function(obj) {
    var rideShare = new RideShare();
    rideShare.ride_share_id = obj.id;
    if(obj.owner){
      rideShare.owner = User.buildFromBackendObject(obj.owner);
    }
    if(obj.owner_id) {
      rideShare.owner = userService.getUserWithId(obj.owner_id);
    }
    if(obj.joinedUsers){
      rideShare.riders = obj.joinedUsers.map(User.buildFromBackendObject);
    }
    if(obj.number_of_requests !== undefined){
      rideShare.number_of_requests = obj.number_of_requests;
    }
    rideShare.route = Route.buildFromBackendObject(obj.route);
    return rideShare;
  };

  return RideShare;
});
