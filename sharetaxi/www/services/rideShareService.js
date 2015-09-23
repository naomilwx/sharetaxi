/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.rideShare.service', ['models.rideshare'])
  .factory('rideService', function($http){
    var rideShares = [];

    function getAllRideShares(){

    }

    function createSharedRide(route){

    }



    function requestSharedRide(route){
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/ride";
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: route
      }).then(function(ride){
        var rideShare = buildFromBackendObject(ride);
        rideShares.push(rideShare);
        return rideShare;
      });
    }
  }
);
