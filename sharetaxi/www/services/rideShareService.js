/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.rideShare.service', ['models.rideshare', 'st.storage', 'models.sharerequest'])
  .factory('rideService', function($http, storageService, RideShare, ShareRequest){
    var rideShares = {};

    function getAllRideShares(){

    }

    function createSharedRide(route){
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/ride";
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: route
      }).then(function(ride){
        var rideShare = RideShare.buildFromBackendObject(ride);
        cacheRideShareResult(rideShare);
        return rideShare;
      });
    }


    function cacheRideShareResult(rideShare){
      rideShares[rideShare.ride_share_id] = rideShare;
      storageService.saveRideShare(rideShare, function(res){

      })
    }


    function requestSharedRide(shareRequest){
      //TODO: WTH the api is weird. but no time to fix it
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/route";
      var data = shareRequest.toBackendObject();
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: data
      }).then(function(result){

      });
    }



    return {
      createSharedRide: createSharedRide,
      requestSharedRide: requestSharedRide
    }
  }
);
