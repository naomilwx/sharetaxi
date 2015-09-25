/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.rideShare.service', ['models.rideshare', 'st.storage', 'models.sharerequest', 'ngStorage'])
  .factory('rideService', function($http, $localStorage, $location, backendPort, storageService, RideShare, ShareRequest){
    var rideShares = {};
    var requests = {};

    function getAllRideShares(){
      var arr = []
      for(var idx in rideShares) {
        arr.push(rideShares[idx]);
      }
      return arr;
    }

    function loadAllRideShares(){
      if(navigator.onLine) {
        return loadAllRideSharesFromServer();
      }else {
        return loadAllRideSharesFromCache();
      }
    }

    function loadAllRideSharesFromCache() {
      return storageService.getRideShareByOwner($localStorage.user,
        function(response){
          var rides = [];
          if(response){
            rides = response.map(RideShare.buildFromCachedObject);
            for(var idx in rides){
              var ride = rides[idx];
              rideShares[ride.ride_share_id] = ride;
            }
          }
          return rides;
        }
      );
    }

    function loadAllRideSharesFromServer() {
      var url = "http://" + $location.host() + ":" + backendPort + "/rides/from/own";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function (response){
          console.log(response);
          var rides = response.data.map(RideShare.buildFromBackendObject);
          for(var idx in rides){
            var ride = rides[idx];
            rideShares[ride.ride_share_id] = ride;
          }
          return rides;
        })
    }


    function createSharedRide(route){
      console.log("creation");
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/rides";
      var data = route.toBackendObject();
      //console.log(JSON.stringify(data));
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: route.toBackendObject()
      }).then(function(response){
        console.log(response);
        if(response.data.status == 'success'){
          var ride = response.data.data;
          var rideShare = RideShare.buildFromBackendObject(ride);
          route.route_id = rideShare.route.route_id;
          rideShare.route = route;
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
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/routes";
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

    function cacheSharedRideRequest(shareRequest){

    }



    return {
      loadAllRideSharesFromCache: loadAllRideSharesFromCache,
      createSharedRide: createSharedRide,
      requestSharedRide: requestSharedRide,
      loadAllRideSharesFromServer: loadAllRideSharesFromServer,
      getAllRideShares: getAllRideShares,
      loadAllRideShares: loadAllRideShares
    }
  }
);
