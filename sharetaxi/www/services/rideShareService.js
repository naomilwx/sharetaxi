/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.rideShare.service', ['models.rideshare', 'st.storage', 'models.sharerequest', 'ngStorage', 'models.route'])
  .factory('rideService', function($q, $http, $localStorage, $location, backendPort, storageService, RideShare, Route, ShareRequest){
    var rideShares = {};
    var requests = {};

    function constructUrlPrefix(){
      return "http://" + $location.host() + ":" + backendPort;
    }

    //API For RideShares, ie the shared routes created by the user
    function getAllRideShares(){
      var arr = [];
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
              storeRideShareInMemory(ride);
            }
          }
          return rides;
        }
      );
    }

    function storeRideShareInMemory(ride){
      rideShares[ride.ride_share_id] = ride;
    }

    function loadRideShareByIdFromServer(rideId) {
      var url = constructUrlPrefix() + "/rides/" + rideId;
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function(response){
        if(response){
          var ride = RideShare.buildFromBackendObject(response);
          storeRideShareInMemory(ride);
          return ride;
        }else {
          return response;
        }
      })
    }

    function getRideShareById(rideId) {
      if(rideShares[rideId]){
        var defer = $q.defer();
        defer.resolve(rideShares[rideId]);
        return defer.promise;
      }else {
        return loadRideShareByIdFromServer(rideId);
      }
    }

    function loadAllRideSharesFromServer() {
      var url = constructUrlPrefix() + "/rides/from/own";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function (response){
          console.log(response);
          var rides = response.data.map(RideShare.buildFromBackendObject);
          for(var idx in rides){
            var ride = rides[idx];
            storeRideShareInMemory(ride);
          }
          return rides;
        })
    }


    function createSharedRide(route){
      console.log("creation");
      var postUrl = constructUrlPrefix() + "/rides";
      var data = route.toBackendObject();
      console.log(JSON.stringify(data));
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: data
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

    function deleteSharedRide(ride) {
      console.log("delete shared route");
      var id = ride.ride_share_id;
      var url = constructUrlPrefix() + "/rides/" + id;
      return $http({
        method: 'DELETE',
        url: url,
        withCredentials: true
      }).then(function(response){
        if(response.data.status == 'success'){
          removeRideShareFromCache(ride);
          return true;
        }else {
          return false;
        }
      });

    }

    function removeRideShareFromCache(ride){
      var id = ride.ride_share_id;
      delete rideShares[id];
      storageService.deleteRideShare(id, function(result){

      });
    }

    function updateSharedRide(ride){
      var id = ride.ride_share_id;
      var route = ride.route;
      var data = route.toBackendObject;
      var postUrl = constructUrlPrefix() + "/routes/" + id;
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: data
      }).then(function(response){
        if(response.data.status == 'success'){
          var route = response.data.data;
          var originalRide = rideShares[id];
          originalRide.route = Route.buildFromBackendObject(route);
          cacheRideShareResult(originalRide);
          return originalRide;
        }
      })
    }


    function cacheRideShareResult(rideShare){
      storeRideShareInMemory(rideShare);

      storageService.saveRideShare(rideShare, function(res){

      })
    }

    function getRequestsForSharedRide(rideId) {
      var url = constructUrlPrefix() + "/rides/"+rideId+"/requests";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true,
      }).then(function(response){
        var shareRequests = response.data.map(ShareRequest.buildFromBackendObject);
        return shareRequests;
      })
    }

    function getNumberOfRequestsForSharedRide(rideId) {
      //TODO: create api in the backend for this
    }

    //API to handle requesting to share an existing shared route
    function requestSharedRide(shareRequest) {
      //TODO: WTH the api is weird. but no time to fix it
      var postUrl = constructUrlPrefix() + "/routes";
      var data = shareRequest.toBackendObject();
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: data
      }).then(function(response){
          if(response.data.status == 'success'){
            //add to requests
            var shareRequest = ShareRequest.buildFromBackendObject(response.data.data);
            cacheSharedRideRequest(shareRequest);
            return shareRequest;
          }
      });
    }

    function storeShareRequestInMemory(shareRequest){
      requests[shareRequest.ride_id] = shareRequest;
    }

    function getAllSharedRideRequests() {
      if(navigator.onLine) {
        return loadAllSharedRideRequestsFromServer();
      } else{
        //TODO:
      }
    }

    function deleteRequestForRide(shareRequest) {
      var url = constructUrlPrefix() + "/routes/" + shareRequest.route.route_id;
      return $http({
        method: 'DELETE',
        url: url,
        withCredentials: true
      }).then(function(response){
        if(response.data.status == 'success'){
          return true;
        }else{
          return false;
        }
      });
    }

    function acceptRequestForRide(shareRequest) {
      var url = constructUrlPrefix() + "/routes/" + shareRequest.route.route_id + "/accept";
      return $http({
        method: 'POST',
        url: url,
        withCredentials: true
      }).then(function(response){
        //return updated RideShare
        if(response.data.status == 'success'){
          var rideShare = RideShare.buildFromBackendObject(response.data.data);
          cacheRideShareResult(rideShare);
          return rideShare;
        }
      });

    }


    function loadAllSharedRideRequestsFromServer() {
      var url = constructUrlPrefix() + "/user/routes/requests";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true,
      }).then(function(response){
        var shareRequests = response.data.map(ShareRequest.buildFromBackendObject);
        return shareRequests;
      })
    }

    function loadAllJoinedRidesFromServer(){
      //"user/rides/joined"
      var url = constructUrlPrefix() + "/user/rides/joined";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function (response){
        var rides = response.data.map(RideShare.buildFromBackendObject);
        return rides;
      })
    }

    function cacheSharedRideRequest(shareRequest){
      storeShareRequestInMemory(shareRequest);
      //TODO:
    }

    //API to get friends' shared rides
    function loadAllFriendsRides(){
      //Does not make sense to have this work offline. but results should be ordered
      if(navigator.onLine){
        return loadAllFriendsRidesFromServer();
      }else {
        var defer = $q.defer();
        defer.resolve([]);
        return defer.promise;
      }
    }

    function loadAllFriendsRidesFromServer(){
      var url = constructUrlPrefix() + "/rides/from/friends";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function (response){
        var rides = response.data.map(RideShare.buildFromBackendObject);
        return rides;
      })
    }



    return {
      loadAllRideSharesFromCache: loadAllRideSharesFromCache,
      createSharedRide: createSharedRide,
      deleteSharedRide: deleteSharedRide,
      requestSharedRide: requestSharedRide,
      loadAllRideSharesFromServer: loadAllRideSharesFromServer,
      updateSharedRide: updateSharedRide,
      getAllRideShares: getAllRideShares,
      loadAllRideShares: loadAllRideShares,
      getNumberOfRequestsForSharedRide: getNumberOfRequestsForSharedRide,
      loadAllFriendsRides: loadAllFriendsRides,
      getAllSharedRideRequests: getAllSharedRideRequests,
      getRequestsForSharedRide: getRequestsForSharedRide,
      loadAllJoinedRidesFromServer: loadAllJoinedRidesFromServer,
      getRideShareById: getRideShareById,
      acceptRequestForRide: acceptRequestForRide,
      deleteRequestForRide: deleteRequestForRide
    }
  }
);
