angular.module('models.rideshare', [])
app.factory('RideShare', function($http){
  function RideShare(){
    //attributes: owner, riders, route
  }

  RideShare.prototype.toBackendObject = function(){

  };
  return RideShare;
});
