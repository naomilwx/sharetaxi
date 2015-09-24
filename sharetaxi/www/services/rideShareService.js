/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.rideShare.service', ['models.rideshare', 'st.storage', 'models.sharerequest'])
  .factory('rideService', function($http, $location, backendPort, storageService, RideShare, ShareRequest){
    var rideShares = {};
    var requests = {};

    function getAllRideShares(){
      var arr = []
      for(var idx in rideShares){
        arr.push(rideShares[idx]);
      }
      return arr;
    }



    function createSharedRide(route){
      console.log("creation");
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/ride";
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: route
      }).then(function(response){
        console.log(response);
        if(response.data.status == 'success'){
          var ride = response.data.data;
          var rideShare = RideShare.buildFromBackendObject(ride);
          cacheRideShareResult(rideShare);
          return rideShare;
        }
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
      }).then(function(response){
          if(response.data.status == 'success'){
            //add to requests
          }
      });
    }



    return {
      createSharedRide: createSharedRide,
      requestSharedRide: requestSharedRide
    }
  }
);
