angular.module('models.rideshare', ['models.route'])
.factory('RideShare', function($http, Route){
  function RideShare(){
    //attributes: owner, riders, route
    this.riders = [];
    this.route = new Route();
  }

  RideShare.prototype.toBackendObject = function(){

  };

  RideShare.buildFromBackendObject = function(obj) {

  }
  return RideShare;
});
