/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.rideShare.service', [])
  .factory('rideService', function($http){

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

      });
    }
  }
);
