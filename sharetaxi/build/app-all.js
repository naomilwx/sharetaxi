// App entrance

angular.module('sharetaxi', ['ngCordova', 'ionic', 'indexedDB', 'st.map', 'st.selector', 'st.toolbar',
  'st.results', 'st.user.service', 'ngStorage', 'st.routeDetails',
  'st.sidemenu', 'st.intro', 'st.listsaved', 'st.listshared', 'st.sharedmap',
  'st.listfriends', 'st.listjoined' , 'st.routeview', 'ngToast'])
.constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
.constant('fbAppId', '1919268798299218')
.constant('backendPort', 8000)
.config(function($stateProvider, $urlRouterProvider, $indexedDBProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $indexedDBProvider
      .connection('taxiDB')
      .upgradeDatabase(1, function (event, db, tx) {
        console.log("upgrading db")
        var routeStore = db.createObjectStore(ROUTE_STORE_NAME, {keyPath: 'local_id', autoIncrement: true});
        routeStore.createIndex('creator_idx', 'creator_id', {unique: false});
        routeStore.createIndex('route_id_idx', 'route_id', {unique: false});
        var rideStore = db.createObjectStore(RIDESHARE_STORE_NAME, {keyPath: 'ride_share_id'})
        rideStore.createIndex('owner_idx', 'owner.user_id', {unique: false});
        rideStore.createIndex('route_idx', 'route.route_id', {unique: false});
      });

    $stateProvider
      .state('intro', {
        url: '/',
        templateUrl: 'components/intro/intro.html',
        controller: 'introCtrl'
      })
      .state('routeview', {
        url: '^/routemap/:rideId/:routeId',
        templateUrl: 'components/map/route-view.html',
        controller: 'routeViewCtrl'
      })
      .state('mapview', {
        //routeId here refers to local_id because the routes are not necessarily stored on the server.
        url: '^/main/:routeId',
        templateUrl: 'components/map/map-view.html',
        controller: 'mapCtrl'
      })
      .state('saved', {
        url: '^/saved',
        templateUrl: 'components/list/list-saved.html',
        controller: 'listSavedController'
      })
      .state('shared', {
        url: '^/shared',
        templateUrl: 'components/list/list-shared.html',
        controller: 'listSharedCtrl'
      })
      .state('sharedmap', {
        url: '^/sharedmap/:rideId',
        templateUrl: 'components/map/map-shared.html',
        controller: 'sharedMapCtrl'
      })
      .state('friends', {
        url: '^/friends',
        templateUrl: 'components/list/list-friends.html',
        controller: 'listFriendsCtrl'
      })
      .state('joined', {
        url: '^/joined',
        templateUrl: 'components/list/list-joined.html',
        controller: 'listJoinedCtrl'
      })
    $urlRouterProvider.otherwise('/main/');
  })
.run(function($ionicPlatform, $localStorage) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

})
.controller('mainCtrl', function(googleApiKey, $rootScope, $state, $scope,
                                 $ionicSideMenuDelegate, userService, $localStorage, $window){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];
  ionic.Platform.ready(function(){

    // will execute when device is ready, or immediately if the device is already ready.
    $ionicSideMenuDelegate.canDragContent(false);


    runApp();

  });

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.goToMainAndToggleLeft = function(){
    $scope.toggleLeft();
    if($rootScope.visitedEdit){
      $rootScope.visitedEdit = false;
      $window.location.href = "/main/";
    }else{
      $state.go('mapview');
    }
  }

  $rootScope.login = function(){
      userService.fbLogin().then(function(result){
        $rootScope.isLoggedIn = result;
        userService.loadFriends();
      });
  };
  $rootScope.logout = function(){
    userService.logout().then(function(result){
      if(result.data.success == true){
        $rootScope.isLoggedIn = false;
        $localStorage.$reset();
        $window.location.reload();
      }
    });
  };

    function checkAppCacheForUpdates(){
      if (window.applicationCache) {
        applicationCache.addEventListener('updateready', function() {
          $window.location.reload();
        });
      }
    }

    function runApp(){
      checkAppCacheForUpdates();
      if(navigator.onLine){
        userService.loadFriends();
        userService.getServerLoginStatus().then(function(result){
          if(result.data.loggedIn == true){
            userService.getFbLoginStatus().then(function(result){
              console.log(result);
              if(result.status === 'connected'){
                $rootScope.isLoggedIn = true;
              }else{
                $rootScope.isLoggedIn = false;
              }
            });
          }else{
            console.log(result.data);
            $rootScope.isLoggedIn = false;
            $localStorage.$reset();
          }
        });
      }else{
        if(userService.getUser().user_id == -1){
          $rootScope.isLoggedIn = false;
        }else{
          $rootScope.isLoggedIn = true;
        }
        $state.go('saved');
      }
    }

});


SHORTEST_ROUTE_KEY = "short";
FASTEST_ROUTE_KEY = "fast";
AVOID_ERP_KEY = "erp";

SHOW_DIRECTIONS_RESULT = "show directions result in map";
HIDE_DIRECTIONS_RESULT = "hide directions result in map";
RESET_DIRECTIONS_RESULT = "reset directions result in map";

POPOVER_SHOW_EVENT = "showpopover";
SHARE_POPOVER_SHOW_EVENT = 'showsharepopover';
REQUEST_POPOVER_SHOW_EVENT = "showrequestpopover";

RESULT_POPOVER_SHOW_EVENT = "show distance result";
SET_GOOGLE_AUTOCOMPLETE = "set google autocomplete";
SHOW_PLAN_ROUTE_FORM = "show plan route form";

ROUTE_STORE_NAME = "routes";
RIDESHARE_STORE_NAME = "rideShares";

routeOptions = {};
routeOptions[FASTEST_ROUTE_KEY] = "Fastest route";
routeOptions[SHORTEST_ROUTE_KEY] =  "Shortest route";
routeOptions[AVOID_ERP_KEY] = "Cheapest route (Avoiding ERP)";


angular.module('st.service', ['models.directions', 'models.place'])
.factory('directionsService', function(Directions){
    var distanceService;
    var directionsService;
    function generateDistanceService(google){
      distanceService = new google.maps.DistanceMatrixService();
    }
    function generateDirectionsService(google){
      directionsService = new google.maps.DirectionsService();
    }
    GoogleMapsLoader.load(generateDirectionsService);
    GoogleMapsLoader.load(generateDistanceService);

    function getPlaceQueryForm(place){
      var coord = place.location;
      if(coord){
        return coord;
      }else{
        return place.name;
      }
    }
    function getFurthestPair(origins, destinations, routeOption, cb){
      if(origins.length == 1 && destinations.length == 1){
        cb({start: origins[0], end: destinations[0], lastStart: origins[0]}, google.maps.DistanceMatrixStatus.OK);
        return;
      }
      var avoidErp = (routeOption == AVOID_ERP_KEY);

      distanceService.getDistanceMatrix(
        { origins: origins,
          destinations:destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidTolls: avoidErp},
        dmCallback);
      function dmCallback(response, status){
        if (status == google.maps.DistanceMatrixStatus.OK) {
          //var origins = response.originAddresses;
          //var destinations = response.destinationAddresses;

          var dist = 0;

          var worst = -1;
          var worst_i = 0;
          var worst_j = 0;

          var nearest = Number.MAX_VALUE;
          var n = 0;
          for (var i = 0; i < origins.length; i++) {
            dist = 0;
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              var metric = element.duration.value;
              if(routeOption == SHORTEST_ROUTE_KEY){
                var metric = element.distance.value;
              }
              dist += metric;
              if(metric > worst){
                worst = metric;
                worst_i = i;
                worst_j = j;
              }
            }
            if(dist < nearest){
              nearest = dist;
              n = i;
            }
          }

          var start = origins[worst_i];
          var lastStart = origins[n];
          var end = destinations[worst_j];
          cb({start: start, end: end, lastStart: lastStart}, status);
        }else{
          cb(response, status);
        }
      }
    }

    function getGoogleDirections(start, end, stopovers, optimise, avoidErp, cb){

      var waypoints = stopovers.map(function(loc){
        return {location: loc, stopover: true};
      });
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
          durationInTraffic:true,
          waypoints: waypoints,
          optimizeWaypoints: optimise,
          avoidTolls: avoidErp
        }, cb);
    }

    function getDirections(origins, destinations, routeOption, cb){
      var o = origins.map(getPlaceQueryForm);
      var d = destinations.map(getPlaceQueryForm);
      var avoidErp = (routeOption == AVOID_ERP_KEY);
      function runComputation(endPoints, status){
        var results = new Directions();
        if(status != google.maps.DistanceMatrixStatus.OK){
          cb(null, status);
        }

        var sPoints;
        var count = 0;
        function handleGoogleReturn(order){
          return function(response, status){
            if(status == google.maps.DirectionsStatus.OK){
              results.insertDirectionInOrder(order, response);
              --count;
              if(count == 0){
                cb(results, status);
              }
            }else{
              cb(null, status);
            }

          }
        }

        var dPoints = d.filter(function(pt){
          return pt != endPoints.end;
        });

        sPoints = o.filter(function(pt){
          return (pt != endPoints.start) && (pt!= endPoints.lastStart);
        });

        if(o.length >= 2){
          count = 2;
          getGoogleDirections(endPoints.start, endPoints.lastStart, sPoints, true, avoidErp, handleGoogleReturn(0));
          getGoogleDirections(endPoints.lastStart, endPoints.end, dPoints, true, avoidErp, handleGoogleReturn(1));

        }else {
          count = 1;
          //1 starting point. point at endPoints.lastStart will be the starting point too
          getGoogleDirections(endPoints.start, endPoints.end, dPoints, true, avoidErp, handleGoogleReturn(0));
        }
      }
      getFurthestPair(o, d, routeOption, runComputation);
    }
    return {
      getDirections: getDirections,
    }
  })
.factory('displayService', function(){
    function loadMap(lat, long){
      var myLatLng = new google.maps.LatLng(lat, long);

      var map = loadMapAtLocation(myLatLng);
      return {
        location: myLatLng,
        map: map
      }
    }

    function loadMapForElement(element, lat, long){
      var myLatLng = new google.maps.LatLng(lat, long);
      var map = loadMapForElementAtLocation(element, myLatLng);
      return {
        location: myLatLng,
        map: map
      }

    }

    function loadMapForElementAtLocation(elementId, latLng){
      var mapOptions = {
        center: latLng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
      };

      var map = new google.maps.Map(document.getElementById(elementId), mapOptions);
      return map;
    }


    function loadMapAtLocation(latLng){

      var mapOptions = {
        center: latLng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
      };
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      return map;
    }

    function displayDirections(renderers, map, directions, displayMarkers){
      var dIterator = directions.getIterator();
      while(dIterator.hasNext()){
        var renderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: !displayMarkers
        });
        var dirs = dIterator.next();
        if(directions.isDeserialisedDirections()){
          renderer.setDirections(dirs.deserialisedRes);
        }else{
          renderer.setDirections(dirs);
        }
        renderers.push(renderer);
      }
    }

    function clearDirections(renderers){
      for(var i = 0; i < renderers.length; i++){
        renderers[i].setMap(null);
      }
    }

    function addMarker(place, map) {
      if(place.location){
        var marker = new google.maps.Marker({
          position: place.location,
          title: place.name,
          map: map
        });
        return marker;
      }
    }

    function removeMarker(marker) {
      marker.setMap(null);
    }

    function loadMapAtAddress(address, cb){
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        'address': address
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var map = loadMapAtLocation(results[0].geometry.location);
          cb(map);
        }
      });
    }

    return {
      loadMap: loadMap,
      loadMapForElement: loadMapForElement,
      loadMapAtLocation: loadMapAtLocation,
      loadMapAtAddress: loadMapAtAddress,
      loadMapForElementAtLocation: loadMapForElementAtLocation,
      displayDirections: displayDirections,
      clearDirections: clearDirections,
      addMarker: addMarker,
      removeMarker: removeMarker,
    }
  })
  .factory('placeService', function(Place){
    var geocoder;
    function loadGeocoder(google){
      geocoder = new google.maps.Geocoder;
    }
    GoogleMapsLoader.load(loadGeocoder);
    function setPlaceDetails(place, cb){
      if(!place.location){
        geocoder.geocode({address: place.name}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK) {
            var result = new Place(results[0])

            place.place_id = result.place_id;
            place.location = result.location;
            place.formatted_address = result.formatted_address;
            cb(place);
          }
        });
      }else{
        cb(place);
      }
    }

    function getPlace(latLng, cb){
      geocoder.geocode({'location': latLng}, function(results, status) {
        if(status == google.maps.GeocoderStatus.OK){
          cb(new Place(results[0]));
        }
      });
    }

    return {
      getPlace: getPlace,
      setPlaceDetails: setPlaceDetails
    }
  });

/**
 * Created by naomileow on 18/9/15.
 */
angular.module('st.user.service', ['ngCordova', 'models.user', 'ngStorage'])
.factory('userService', function($q, $http, $location, $localStorage, $cordovaFacebook, backendPort, User){
    var userData = $localStorage.user? $localStorage.user: new User();
    var friends = {};

    function doBackendLogin(response){
      userData.access_token = response.authResponse.accessToken;
      return loginToBackend();
    }

    function loginToBackend(){
      //post to /facebook/token
      var loginUrl = "http://" + $location.host() + ":" + backendPort + "/facebook/token";
      return $http({
        method: 'POST',
        url: loginUrl,
        withCredentials: true,
        data: {
              token: userData.access_token
              }
      }).then(function(response){
        if(response.data.success == true){
          var user = response.data.user;
          userData.name = user.name;
          userData.facebook_id = user.facebook_id;
          userData.user_id = user.user_id;
          $localStorage.user = userData;
          return true;
        }else{
          return false;
        }
      });
    }

    function logoutFromBackend(){
      var logoutUrl = "http://" + $location.host() + ":" + backendPort + "/logout";
      return $http({
        method: 'POST',
        url: logoutUrl,
        withCredentials: true,

      });
    }

    function loadFriends(){
      var url = "http://" + $location.host() + ":" + backendPort +"/user/friends";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function(response){
        var res = response.data;
        for(var i = 0; i < res.length; i++){
          var friend = User.buildFromBackendObject(res[i]);
          friends[friend.user_id] = friend;
        }
      });
    }

    function getUserWithId(user_id){
      if($localStorage.user.user_id == user_id){
        return $localStorage.user;
      }else {
        // console.log(friends);
        return friends[user_id];
      }
    }

    function getFriendDetails(user_id){
      //TODO: handle case where friend is not in local data
      return friends[user_id];
    }

    // function getUserDataFromFacebook(cb){
    //   return facebookAPI.api({path:'/me'}).then(function (response) {
    //     userData.name = response.name;
    //     userData.userID = response.id;
    //   });
    // }
    return {
      loadFriends: loadFriends,
      getFriendDetails: getFriendDetails,
      fbLogin: function(){
        // var defer = $q.defer();
        // console.log(window.location);
        return $cordovaFacebook.login(['email', 'user_friends']).then(
          function(response){
            return doBackendLogin(response);
          },
          function(err){
            console.log('Facebook login failed');//TODO:
            return false;
          }
        )
          
        // return defer.promise;
      },
      fbLogout: function(){
        // var defer = $q.defer();
        return $cordovaFacebook.logout().then(
          function(response){
            return true;
          },
          function(error){
            return false;
          }
        );
        return promise;
      },
      logout: logoutFromBackend,
      getFbLoginStatus: function(){
        var defer = $q.defer(); 
        return $cordovaFacebook.getLoginStatus().then(
          function (response) {
            // console.log("facebook login response");
            if (response.status === 'connected') {
              doBackendLogin(response);
            }
            return response;
          }
        ,
          function (error){
            console.log(error);
          }
        );
        
      },
      getServerLoginStatus: function(){
        var url = "http://" + $location.host() + ":" + backendPort + "/getLoginStatus";
        return $http({
          method: 'GET',
          url: url,
          withCredentials: true
        });
      },
      getUser: function(){
        return userData;
      },
      getAccessToken: function(){
        return userData.access_token;
      },
      getUserWithId: getUserWithId
    }

  });

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

    function getRideSharesNearPlace(place) {
      var url = constructUrlPrefix() + "/rides/search";
      var sPlace = place.toBackendObject();
      var data = {
        longitude: sPlace.longitude,
        latitude: sPlace.latitude,
        distance: 3 //this is in miles, yes wth
      }
      return $http({
        method: 'POST',
        url: url,
        data: data,
        withCredentials: true
      }).then(function(response){
        var rides = response.data.data.map(RideShare.buildFromBackendObject);
        var results = rides.filter(function(rideShare){
          if(rideShare.owner){
            return rideShare.owner.user_id != $localStorage.user.user_id;
          }else{
            return true;
          }

        });
        return results;
      })
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
          var ride = RideShare.buildFromBackendObject(response.data.data);
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
          var rides = response.data.map(RideShare.buildFromBackendObject);
          for(var idx in rides){
            var ride = rides[idx];
            storeRideShareInMemory(ride);
          }
          return rides;
        })
    }


    function createSharedRide(route){
      //console.log("creation");
      var postUrl = constructUrlPrefix() + "/rides";
      var data = route.toBackendObject();
      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: data
      }).then(function(response){
        if(response.data.status == 'success'){
          var ride = response.data.data;
          var rideShare = RideShare.buildFromBackendObject(ride);
          route.route_id = rideShare.route.route_id;
          rideShare.route = route;
          cacheRideShareResult(rideShare);
          return rideShare;
        }else {
          return false;
        }
      });
    }

    function deleteSharedRide(ride) {
      //console.log("delete shared route");
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

    function getRouteForSharedRide(rideId, routeId) {
      if(rideShares[rideId]){
        var rideShare = rideShares[rideId];
        if(rideShare.route.route_id == routeId){
          var defer = $q.defer();
          defer.resolve(rideShare.route);
          return defer.promise;
        }
      }else {
        return loadRouteFromServer(routeId);
      }
    }

    function loadRouteFromServer(routeId) {
      var url = constructUrlPrefix() + "/routes/" + routeId;
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function(response){
        console.log(response);
        if(response.data.status == 'success'){
          var route = response.data.data;
          return Route.buildFromBackendObject(route);
        }
      })
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
      var url = constructUrlPrefix() + "/rides/"+rideId+"/requests/count";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true,
      }).then(function(response){
        return response.data.count;
      })
    }

    //API to handle requesting to share an existing shared route
    function requestSharedRide(shareRequest) {
      //TODO: WTH the api is weird. but no time to fix it
      var postUrl = constructUrlPrefix() + "/routes";
      var data = shareRequest.toBackendObject();
      //console.log("POST DATA");
      //console.log(data);
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
          }else {
            return false;
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
      //TODO: update server with directions
      var url = constructUrlPrefix() + "/routes/" + shareRequest.route.route_id + "/accept";
      var mergedResult = shareRequest.getMergedResult();
      return $http({
        method: 'POST',
        url: url,
        withCredentials: true,
        data: { google_directions: mergedResult.directions.toBackendObject()}
      }).then(function(response){
        //return updated route
        //console.log(response);
        if(response.data.status == 'success'){
          var rideShare = rideShares[shareRequest.ride_share_id];
          rideShare.route = mergedResult;
          cacheRideShareResult(rideShare);
          return rideShare;
        }else {
          return false;
        }
      });

    }


    function loadAllSharedRideRequestsFromServer() {
      var url = constructUrlPrefix() + "/user/routes/requests";
      return $http({
        method: 'POST',
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
        //console.log("load");
        var rides = response.data.map(RideShare.buildFromBackendObject)
          .filter(function(rideShare){
            if(rideShare.owner){
              return rideShare.owner.user_id != $localStorage.user.user_id;
            }else{
              return true;
            }

          });
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
      deleteRequestForRide: deleteRequestForRide,
      getRouteForSharedRide: getRouteForSharedRide,
      getRideSharesNearPlace: getRideSharesNearPlace
    }
  }
);

/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.storage', ['indexedDB', 'ngStorage', 'models.route'])
.factory('storageService', function($indexedDB, $localStorage, Route){
    function saveRoute(route, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        if($localStorage.user){
          route.creator_id = $localStorage.user.user_id;
        }else{
          route.creator_id = -1;
        }
        store.insert(route).then(function(result){
          //Return local_id of inserted object
          cb(result[0]);
        })
      });
    }

    function getAllRoutes(cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.getAll().then(function(result){
          var routes = result.map(Route.buildFromCachedObject);
          cb(routes);
        });
      });
    }

    function getAllRoutesForUser(cb) {
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        var query = store.query();
        query.$index('creator_idx');
        query.$asc();
        if($localStorage.user){
          query.$eq($localStorage.user.user_id);
        }else{
          //Just return all data for users who have not logged in
          query.$eq(-1);
        }

        store.findWhere(query).then(function(result){
          var routes = result.map(Route.buildFromCachedObject);
          cb(routes);
        });
      });
    }
    function updateRoute(route, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.upsert(route).then(function(result){
          cb(result[0]);
        });
      });
    }

    function getRouteById(routeId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.findBy("route_id_idx", routeId).then(function(result){
          cb(Route.buildFromCachedObject(result));
        });
      });
    }

    function getAllLocalRoutes(cb) {
      //Find routes which are not saved to the server
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        var local = store.query();
        local.$index('route_id_idx');
        local.$eq(-1);
        store.findWhere(local).then(function(result){
          var userId;
          if($localStorage.user){
            userId = $localStorage.user.user_id;
          }else{
            //Just return all data for users who have not logged in
            userId = -1;
          }
          cb(
            result.filter(function(item){
            return item.creator_id == userId;
            }).map(Route.buildFromCachedObject)
          );
        });
      });
    }

    function getRouteByLocalId(localId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.find(localId).then(function(result){
          var rebuilt = Route.buildFromCachedObject(result);
          cb(rebuilt);
        })
      });
    }

    function deleteRoute(localId){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.delete(localId);
      });
    }

    function saveRideShare(rideShare, cb){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        //rideShare = JSON.parse(JSON.stringify(rideShare));
        store.upsert(rideShare).then(function(result){
          cb(result[0]);
        });
      });
    }

    //function updateRideShare(rideShare, cb){
    //  return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
    //    //rideShare = JSON.parse(JSON.stringify(rideShare));
    //    store.upsert(rideShare).then(function(result){
    //      cb(result[0]);
    //    });
    //  });
    //}

    function getRideShareById(id, cb){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.find(id).then(function(result){
          cb(result);
        });
      });
    }

    function getRideShareForRoute(route, cb) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.findBy('route_idx', route.route_id).then(function(result){
          cb(result);
        });
      });
    }

    function getRideShareByOwner(owner, cb) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.findBy('owner_idx', owner.user_id).then(function(result){
          cb(result);
        });
      })
    }

    function deleteRideShare(id, cb) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.delete(id).then(function(result){
          cb(result);
        });
      });
    }
    //TODO: store share requests too
    return {
    saveRoute: saveRoute,
    updateRoute: updateRoute,
    getRouteById: getRouteById,
    getRouteByLocalId: getRouteByLocalId,
      getAllLocalRoutes:getAllLocalRoutes,
      getAllRoutesForUser: getAllRoutesForUser,
      getAllRoutes:getAllRoutes,
      deleteRoute: deleteRoute,
      saveRideShare: saveRideShare,
      //updateRideShare: updateRideShare,
      getRideShareById: getRideShareById,
      getRideShareForRoute: getRideShareForRoute,
      getRideShareByOwner: getRideShareByOwner,
      deleteRideShare: deleteRideShare
  }
  });

angular.module('st.map',['ngCordova', 'ngStorage', 'vm.map', 'models.route', 'st.storage', 'st.service'])
.controller('mapCtrl', function($scope, $rootScope, $state, $localStorage, $cordovaGeolocation, $ionicHistory, $ionicLoading, MapVM, Route, $stateParams, displayService, storageService){
    var scopeRef = $scope;
    $scope.returnToList = function() {
      $state.go('saved');
    }
    function showLoading(){
      // console.log("show loading")
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }
    function checkandSetState(){
      if($stateParams.routeId && parseInt($stateParams.routeId) > 0){
        $rootScope.visitedEdit = true;
        $scope.editMode = true;
        $scope.title = "Saved Route Details";
        $scope.loadingMessage = 'Acquiring route data...';
        $scope.showResult = true;
        $scope.routeId =  parseInt($stateParams.routeId);
      }else{
        $scope.editMode = false;
        $scope.title = "Plan a Route";
        $scope.loadingMessage = 'Acquiring location data...';
        $scope.showResult = false;
      }
    }

    function loadRouteData(){
      if($scope.editMode == true){
        loadRouteFromStore();
      }else{
        setNewRoute();
      }
    }

    function loadOfflineRouteData() {
      $scope.route = new Route();
      showLoading();
      storageService.getRouteByLocalId($scope.routeId, function(route){
        $scope.route = route;
        setAndDisplayDirectionResult(route.directions);
        $ionicLoading.hide();
        $scope.oldRoute = Route.clone(route);
      });
    }

    function loadRouteFromStore(){
      $scope.route = new Route();
      showLoading();
      GoogleMapsLoader.load(function(google){
        //Ensure things are loaded only when google is loaded into the dom
        storageService.getRouteByLocalId($scope.routeId, function(route){
          $scope.route = route;
          MapVM.loadMapAtAddress(route.directions.getStartAddress(), function(){
            MapVM.displayDirections(route.directions, false);
            MapVM.displayOrigins(route.origins);
            MapVM.displayDestinations(route.destinations);
          });

          setAndDisplayDirectionResult(route.directions);

          $ionicLoading.hide();
          $scope.oldRoute = Route.clone(route);
        });
      });

    }


    $scope.resetRoute = function(){
      if($scope.editMode == true){
        console.log("reset route");
        scopeRef.route = Route.clone($scope.oldRoute);
      }else{
        setNewRoute();
      }
    };

    function setNewRoute(){
      scopeRef.route = new Route();
      if($localStorage.user){
        scopeRef.route.creator_id = $localStorage.user.user_id;
      }
    }

    function executeLoadSequence(){
      checkandSetState();
      if(navigator.onLine){
        loadRouteData();
      } else {
        loadOfflineRouteData();
      }

      if($scope.editMode == false && $scope.map == null){
        ionic.Platform.ready(centerAtCurrentPosition);
      }
    }

    function loadGoogleMap(position){
      var lat;
      var long;
      if(position == null){
        lat = 1.3000;
        long = 103.8000;
      }else if(position.coords){
        // console.log("gps")
        lat  = position.coords.latitude;
        long = position.coords.longitude;
      }else {
        // console.log("google");
        lat = position.lat();
        long = position.lng();
      }
      function loadMap(google){
        MapVM.loadMap(lat, long);
        if(!$scope.editMode){
          MapVM.addPositionMarker().then(function(marker){
            if(marker){
              marker.addListener('click', function(){
                var place = MapVM.getCurrentPlace();
                if(!place.name) {
                  place.name = place.formatted_address;
                }
                scopeRef.route.addOrigin(place);
                showPlanRouteForm();
              });
            }
          })
        }
        $scope.map = MapVM.getMap();
        $ionicLoading.hide();
      }
      if(navigator.onLine){
        GoogleMapsLoader.load(loadMap);
      }else{
        $ionicLoading.hide();
      }
    }

    function showPlanRouteForm() {
      scopeRef.$broadcast(SHOW_PLAN_ROUTE_FORM);
    }

    function setupListeners(){
      $scope.$on(SHOW_DIRECTIONS_RESULT, function(event, result){
        setAndDisplayDirectionResult(result)
      });
      $scope.$on('$destroy', function() {
        console.log('destroy map view');
        $scope.map = null;
      });

      $scope.$on('$ionicView.leave', function(){
        MapVM.clearView();
      });

      $scope.$on('$ionicView.beforeEnter', function(){
        // console.log("before");
        $ionicHistory.clearCache();
        executeLoadSequence();
      });
    }

    $scope.resetDisplayedDirections = function() {
      scopeRef.$broadcast(HIDE_DIRECTIONS_RESULT);
      $scope.showResult = false;
    }

    $scope.hideDirectionsResult = function(){
      $scope.showResult = false;
    }

    $scope.showDirectionsResult = function(){
      $scope.showResult= true;
    }

    function setAndDisplayDirectionResult(result){
      $scope.directions = result;
      $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, result);
      $scope.showDirectionsResult();
    }
    /*
    * Function to load initial view when site is first loaded
    * */
    function centerAtCurrentPosition() {
      showLoading();

      var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };
      $cordovaGeolocation.getCurrentPosition(posOptions).then(loadGoogleMap, function(err) {
        loadGoogleMap(null);
        console.log(err);
      });
    };

    // console.log("controller loaded");
    $ionicHistory.clearCache();
    $scope.editMode = false;
    setupListeners();
    $scope.showResult = true;
  });

angular.module('st.sharedmap',['ngCordova', 'vm.map', 'st.rideShare.service', 'st.user.service', 'models.route'])
.controller('sharedMapCtrl', function($scope, $ionicLoading, $ionicHistory, MapVM, $state, $stateParams,
                                      $ionicScrollDelegate, rideService, userService, ngToast){
  $scope.returnToList = function() {
    // console.log("in map view:");
    $state.go('shared');
  }

    $scope.showResponseBtns = false;

    //Start mock data
  //$scope.sharedRouteName = "Going to School";
  //
  //$scope.origOption = { sharer: "Justin Yeo",
  //                    start_points: ["NUS", "Vivocity"],
  //                    end_points: ["Tampines Mall", "Pasir Ris Park"],
  //                    deadline: "8:30pm" };
  //
  //$scope.routeOptions = [{ sharer: "Someone Neo",
  //                      start_points: ["NUS", "Vivocity"],
  //                      end_points: ["Tampines Mall", "Pasir Ris Park"],
  //                      deadline: "8:30pm" },
  //                      { sharer: "Naomi Leow",
  //                      start_points: ["Ang Mo Kio"],
  //                      end_points: ["NTU"],
  //                      deadline: "8pm" },
  //                      { sharer: "Ding Xiangfei",
  //                      start_points: ["Ang Mo Kio"],
  //                      end_points: ["NTU"],
  //                      deadline: "8pm" }];
    //End mock data
  $scope.shareRequests = []; //contains the data for the requests
    //$scope.rideShare contains the data for the shared route
  //$scope.activeOpt = $scope.origOption;
  $scope.activeIdx = -1;

  var firstClick = true;
  $scope.tabPressed = function(opt, index) {
    // Set active button
    $scope.activeIdx = index;
    if(firstClick && $scope.activeIdx !== -1) {
      //$ionicScrollDelegate.$getByHandle('tabs-scroll').scrollBy(50, 0, true);
      firstClick = false;
    }

    handleDisplay(opt);
  }

    $scope.deleteRequest = function() {
      if($scope.activeIdx >= 0){
        // console.log("delete");
        rideService.deleteRequestForRide($scope.shareRequests[$scope.activeIdx]).then(function(result){
          if(result == true) {
            $scope.showResponseBtns = false;
            handleDeleteSuccess($scope.activeIdx);
          }else {
            ngToast.create({
              className: 'warning',
              content: 'Failed to delete request.',
              timeout: 2000
            });
          }
        });
      }
    }

    function handleDeleteSuccess(currIdx){
      $scope.shareRequests.splice(currIdx, 1);
      $scope.routeOptions.splice(currIdx, 1);
      $scope.activeIdx = -1;
      ngToast.create({
        className: 'info',
        content: 'Successfully deleted request!',
        timeout: 2000
      });
      $scope.showResponseBtns = false;
      handleDisplay($scope.origOption);
    }

    $scope.acceptRequest = function() {
      if($scope.activeIdx >= 0){
        // console.log("accept");
        var shareRequest = $scope.shareRequests[$scope.activeIdx];
        shareRequest.addMergedResult($scope.routeOptions[$scope.activeIdx].mergedRoute);
        rideService.acceptRequestForRide(shareRequest).then(function(result){
          //TODO: handle display
          handleAcceptRequestSuccess(result, $scope.activeIdx);
        })
      }else {
        ngToast.create({
          className: 'warning',
          content: 'Failed to accept request.',
          timeout: 2000
        });
      }
    }

    function handleAcceptRequestSuccess(rideShare, currIdx){
      convertRideShareToDisplayModel(rideShare, currIdx);
      $scope.shareRequests.splice(currIdx, 1);
      $scope.routeOptions.splice(currIdx, 1);
      $scope.activeIdx = -1;
      displayDirectionsForRoute(rideShare.route);
      displayRouteDetails(rideShare.route);
      ngToast.create({
        className: 'info',
        content: 'Successfully accepted request!',
          timeout: 2000
      });
      $scope.showResponseBtns = false;
    }

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = 'Acquiring shared route data...';

    function loadMap() {
      //Stub location for now
      var lat = 1.3000;
      var long = 103.8000;
      MapVM.loadMapForElement("shared-route-map", lat, long);
    }

    function loadData() {
      if($stateParams.rideId > 0){
        $scope.rideId = parseInt($stateParams.rideId);
        loadRideShare($scope.rideId).then(function(rideShare){
          convertRideShareToDisplayModel(rideShare);
        });
        rideService.getRequestsForSharedRide($scope.rideId).then(function(shareRequests){
          $scope.shareRequests = shareRequests;
          convertShareRequestsToDisplayModel(shareRequests);
        })
        $ionicLoading.hide();
      }else{
        //TODO: handle redirect
        $ionicLoading.hide();
      }

    }

    function loadRideShare(rideId){
      return rideService.getRideShareById(rideId).then(function (rideShare){
        $scope.rideShare = rideShare;
        return rideShare;
      });
    }

    function convertRideShareToDisplayModel(rideShare){
      $scope.origOption = routeToDisplayModel(rideShare.route);
      $scope.sharedRouteName = rideShare.getShareDescription();
      displayDirectionsForRoute(rideShare.route);
      displayRouteDetails(rideShare.route);
    }

    function convertShareRequestsToDisplayModel(shareRequests){
      $scope.routeOptions = shareRequests.map(function(request){
        return routeToDisplayModel(request.route);
      })

    }

    function displayDirectionsForRoute(route){
      MapVM.clearView();
      MapVM.displayDirections(route.directions);
      MapVM.displayOrigins(route.origins);
      MapVM.displayDestinations(route.destinations);
    }

    function routeToDisplayModel(route) {
      var creator = userService.getUserWithId(route.creator_id);
      var deadline = route.sharing_options.constructArrivalDate();
      //var stops = getOriginsAndDestsInOrder(route);
      return {
        sharer: creator.name,
        sharerDara: creator,
        deadline: deadline,
        route: route
      }
    }

    function handleDisplay(displayModel) {
      var route = displayModel.route;
      var shared = $scope.rideShare.route;

      if(shared.route_id != displayModel.route.route_id) {
        if (!displayModel.mergedRoute) {
          var merged = shared.createMergedRoute(route);
          displayModel.mergedRoute = merged;
          merged.calculateDirections(function(results, status){
            displayRouteDetails(merged);
            $scope.showResponseBtns = true;
          })
        }else{
          displayRouteDetails(displayModel.mergedRoute);
          $scope.showResponseBtns = true;
        }
        displayDirectionsForRoute(displayModel.mergedRoute);
      }else{
        $scope.showResponseBtns = false;
        displayRouteDetails(shared);
        displayDirectionsForRoute(shared);
      }
    }

    function displayRouteDetails(route) {
      if(route.directions.isEmpty()){
        route.calculateDirections(function(results, status){
          setAndDisplayDirectionResult(results);
        })
      }else{
        setAndDisplayDirectionResult(route.directions);
      }
    }

    //function getOriginsAndDestsInOrder(route){
    //  var stops = route.directions.getStopsInOrder();
    //  var dests = stops.splice(route.origins.length);
    //  return {
    //    start_points: stops,
    //    end_points: dests
    //  }
    //}
    function executeLoadSequence(){
      showLoading();
      GoogleMapsLoader.load(function(google){loadMap()});
      loadData();
    }

    $scope.hideDirectionsResult = function(){
      $scope.showResult = false;
    }

    $scope.showDirectionsResult = function(){
      $scope.showResult= true;
    }

    function setAndDisplayDirectionResult(result){
      $scope.directions = result;
      $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, result);
      $scope.showDirectionsResult();
    }


    $scope.$on('$ionicView.beforeEnter', function(){
      // console.log("hello");
      //actually load stuff
      $ionicHistory.clearCache();
      executeLoadSequence();
    });

});

angular.module('st.routeview',['ngCordova', 'vm.map', 'st.rideShare.service', 'models.route'])
  .controller('routeViewCtrl', function($scope, $rootScope, $localStorage, $ionicLoading, $ionicModal, $ionicHistory, MapVM, $state, $stateParams,
                                        $ionicScrollDelegate, rideService, Route){
    $scope.returnToList = function() {
      // console.log("in map view:");
      $state.go('joined');
    }


    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = 'Acquiring shared route data...';

    function loadMap() {
      //Stub location for now
      var lat = 1.3000;
      var long = 103.8000;
      MapVM.loadMapForElement("route-map-view", lat, long);
    }

    function loadData() {
      if($stateParams.rideId > 0 && $stateParams.routeId){
        $scope.rideId = parseInt($stateParams.rideId);
        $scope.routeId = parseInt($stateParams.routeId);
        rideService.getRouteForSharedRide($scope.rideId, $scope.routeId).then(function(route){
          // console.log(route);
          $scope.route = route;
          displayDirectionsForRoute(route);
          displayRouteDetails(route);
        });
        if($scope.firstPage) {
          rideService.getRideShareById($scope.rideId).then(function(rideShare){
            $scope.rideShare = rideShare;
          })
        }


        $ionicLoading.hide();
      }else{
        //TODO: handle redirect
        $ionicLoading.hide();
      }

    }

    $ionicModal.fromTemplateUrl('components/share-request/route-details.html', {
      scope: $scope
    }).then(function(popover){
      $scope.popover = popover;
    });



    function displayDirectionsForRoute(route){
      MapVM.displayDirections(route.directions, false);
      MapVM.displayOrigins(route.origins);
      MapVM.displayDestinations(route.destinations);
    }


    function displayRouteDetails(route) {
      if(route.directions.isEmpty()){
        route.calculateDirections(function(results, status){
          setAndDisplayDirectionResult(results);
        })
      }else{
        setAndDisplayDirectionResult(route.directions);
      }
    }

    function executeLoadSequence(){
      showLoading();
      GoogleMapsLoader.load(function(google){
        loadMap();
        loadData();
      });
    }

    $scope.hideDirectionsResult = function(){
      $scope.showResult = false;
    }

    $scope.showDirectionsResult = function(){
      $scope.showResult= true;
    }

    function setAndDisplayDirectionResult(result){
      $scope.directions = result;
      $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, result);
      $scope.showDirectionsResult();
    }

    $scope.showJoinButton = function() {
      if(!$rootScope.isLoggedIn || !$scope.firstPage){
        return false;
      }
      if($scope.rideShare) {
        return !$scope.rideShare.hasRider($localStorage.user);
      }
      return false;
    }

    $scope.openPopover = function(index){
      //var rideShare = $scope.friendsRoutes[index];
      $scope.$broadcast(REQUEST_POPOVER_SHOW_EVENT, {
        rideShare: $scope.rideShare,
        route:new Route(),
        originalRoute:$scope.rideShare.route
      })

      $scope.popover.show();
    };
    $scope.closePopover = function(){
      $scope.popover.hide();
    };

    $scope.$on('$ionicView.beforeEnter', function(){
      //actually load stuff
      if($ionicHistory.viewHistory().backView === null){
        $scope.firstPage = true;
      }else {
        $scope.firstPage = false;
      }
      $ionicHistory.clearCache();
      executeLoadSequence();
    });
    $scope.showResult= true;
  });

// Adapted from http://codepen.io/gwhickman/pen/zpDFG

angular.module('st.intro', ['ionic', 'ngAnimate'])
.controller('introCtrl', ['$scope', '$state', '$timeout',
            function($scope, $state, $timeout){
  $scope.showSplash = true;
  $scope.showIntro = false;

  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('mapview');
    // Set a flag that we finished the tutorial
    window.localStorage['didTutorial'] = true;
  };

  ionic.Platform.ready(function() {
    $timeout(function() {
      // Check if the user already did the tutorial and skip it if so
      if(window.localStorage['didTutorial'] === "true") {
          $scope.startApp();
      } else {
          $scope.showSplash = false;
          $scope.showIntro = true;
      }
    }, 1200);
  });

  // Move to the next slide
  var nextSlide = function() {
    $scope.$broadcast('slideBox.nextSlide');
  };
  // Move to the next slide
  var prevSlide = function() {
    $scope.$broadcast('slideBox.prevSlide');
  };

  var slideIndex = 1;
  $scope.leftButton = "Skip";
  $scope.rightButton = "Next";

  $scope.leftButtonTap = function() {
    $scope.startApp();
  };

  // // Called each time the slide changes
  // $scope.slideChanged = function(index) {
  //   slideIndex = index;
  //   console.log(index);
  //   Check if we should update the left buttons
  //   if(index > 0) {
  //     // If this is not the first slide, give it a back button
  //     $scope.leftButtons = [
  //       {
  //         content: 'Back',
  //         type: 'button-positive button-clear',
  //         tap: function(e) {
  //           // Move to the previous slide
  //           $scope.$broadcast('slideBox.prevSlide');
  //         }
  //       }
  //     ];
  //   } else {
  //     // This is the first slide, use the default left buttons
  //     $scope.leftButtons = leftButtons;
  //   }

  //   // If this is the last slide, set the right button to
  //   // move to the app
  //   if(index == 2) {
  //     $scope.rightButtons = [
  //       {
  //         content: 'Start using ShareTaxi',
  //         type: 'button-positive button-clear',
  //         tap: function(e) {
  //           startApp();
  //         }
  //       }
  //     ];
  //   } else {
  //     // Otherwise, use the default buttons
  //     $scope.rightButtons = rightButtons;
  //   }
  // };
}]);

angular.module('st.toolbar', ['st.selector', 'st.saveroute','models.route', 'vm.map'])
.directive('shareTaxiToolbar', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/toolbar/map-toolbar.html',
      controller: "toolbarController"
    }
  })
.controller('toolbarController', function($scope, $rootScope, $ionicModal, Route, $ionicPopup, MapVM, storageService){
    // console.log("toolbar controller");
    $scope.refresh = function(){
      $scope.resetRoute();
      MapVM.clearView();
      $scope.resetDisplayedDirections();
    }
    var scope = $scope;
    $scope.hasValidLocations = function(){
      return scope.route.hasOrigins() && $scope.route.hasDestinations();
    };

    $scope.canSaveRoute = function(){
      return !scope.route.directions.isEmpty() && $scope.hasValidLocations();
    };

    //User must be logged in in order to use the share route function
    $scope.openSharePopoverOrLogin = function(){
      if($rootScope.isLoggedIn){
        scope.openSharePopover();
      }else{
        scope.showLoginDialog();
      }
    }

    $scope.showLoginDialog = function() {
      var popup = $ionicPopup.confirm({
        title: 'Login to share your route',
      });
      popup.then(function(res) {
        if(res) {
          $rootScope.login();
        } else {
        }
      });
    };

    //Plan Route View
    $ionicModal.fromTemplateUrl('components/location-selector/plan-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.popover = popover;
    });
    $scope.openPopover = function(){
      //storageService.getRouteByLocalId(1,function(result){console.log(result)})
      scope.popover.show();
      scope.$broadcast(POPOVER_SHOW_EVENT);
    };
    $scope.closePopover = function(){
      scope.popover.hide();
    };

    $scope.$on(SHOW_PLAN_ROUTE_FORM, function(){
      scope.openPopover();
    })

    //Share Route View
    $ionicModal.fromTemplateUrl('components/location-selector/share-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.sharePopover = popover;
    });
    $scope.openSharePopover = function(){
      scope.sharePopover.show();
      scope.$broadcast(SHARE_POPOVER_SHOW_EVENT);
    };
    $scope.closeSharePopover = function(){
      scope.sharePopover.hide();
    };

    //Save Route View
    $ionicModal.fromTemplateUrl('components/save-route/save-route-dialog.html', {
      scope: $scope
    }).then(function(popover){
      $scope.savePopover = popover;
    });
    $scope.openSavePopover = function(){
      scope.savePopover.show();
    }
    $scope.closeSavePopover = function() {
      scope.savePopover.hide();
    }


    $scope.$on('$destroy', function() {
      console.log("destroyed modals")
      scope.popover.remove();
      scope.sharePopover.remove();
    });
  });


angular.module('st.sidemenu', [])
.directive('stSidemenu', function(){
	return {
		restrict: 'A',
		templateUrl: 'components/toolbar/sidemenu.html',
	}
});
angular.module('st.options', ['ui.bootstrap', 'ui.bootstrap.datetimepicker', 'models.sharingoptions'])
.directive('routeOptions', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/options.html',
      controller: "optionsController"
    }
  })
  .controller('optionsController', function($scope){
    $scope.routeType = FASTEST_ROUTE_KEY;

    $scope.options = routeOptions;
    $scope.optionkeys = Object.keys(routeOptions);
  })

function checkLocationInputs(scope){
  var alright = true;
  var message = "";
  if(!scope.route.hasOrigins()){
    alright = false;
    message += "Starting Points must not be empty \n";
  }
  if(!scope.route.hasDestinations()){
    alright = false;
    message += "Destinations must not be empty \n"
  }
  if(!alright){
    scope.showAlert(message);
  }
  return alright;
};

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ngCordova', 'ui.bootstrap.datetimepicker', 'st.options',
  'models.sharingoptions', 'vm.map', 'st.rideShare.service'])
  .controller('planRouteForm',
  function($scope, $ionicPopup, directionsService, MapVM){

    var isSetup = false;

    $scope.autocompleteElements = {
      start: 'start-place',
      end: 'end-place'
    };

    $scope.rootElementId = "location-selection-modal";

    $scope.submitSelections = function(){
      if(checkLocationInputs($scope)){
        MapVM.removePositionMarker();
        MapVM.clearDirections();
        $scope.route.calculateDirections(function(results, status){
          if(status == google.maps.DirectionsStatus.OK){
            $scope.route.directions = results;
            MapVM.displayDirections(results, false);
            $scope.$emit(SHOW_DIRECTIONS_RESULT, results);
          }
        });

        $scope.closePopover();

        // ngToast.create({
        //   className: 'info',
        //   content: 'Success!',
        //   timeout: 3000
        // });
      }

    };

    $scope.showAlert = function(message) {
      var alertPopup = $ionicPopup.alert({
        title: 'Invalid Inputs',
        template: message
      });
    };

    function setup(){
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
    })

  })
  .controller('shareRouteForm', function($scope, $localStorage, $cordovaFacebook, rideService, SharingOptions, MapVM, ngToast){
    $scope.autocompleteElements = {
      start: 'share-start',
      end: 'share-end'
    };
    $scope.rootElementId = "location-share-modal";

    var isSetup = false;

      $scope.submitSelections = function(){
      if(checkLocationInputs($scope)) {
        MapVM.removePositionMarker();
        MapVM.clearDirections();
        $scope.route.calculateDirections(function (results, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            $scope.route.directions = results;
            MapVM.displayDirections(results, false);
            shareRequest($scope.route);
          }else {
            //Directions loading fail. but just send anyway.
            shareRequest($scope.route);
          }
        });
      }

      // $scope.closeSharePopover();
    };

    function shareRequest(route){
      // console.log(route);
      rideService.createSharedRide(route).then(function(result){
        if(result) {
          ngToast.create({
            className: 'info',
            content: 'Successfully shared route!',
            timeout: 3000
          });
          if(!$localStorage.noFbShare){
            // var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            // if(!isMobile){
              shareToFacebook(result);
            // }
          }else {
            $scope.closeSharePopover();
          }
        }else {
          ngToast.create({
          className: 'warning',
          content: 'Failed to share route.',
          timeout: 3000
        });
          $scope.closeSharePopover();
        }
      })
    }

    $scope.showAlert = function(message) {
      var alertPopup = $ionicPopup.alert({
        title: 'Invalid Inputs',
        template: message
      });
    };


    function shareToFacebook(ride) {
      //console.log("facebook");
      var link = window.location.origin+"/routemap/" + ride.ride_share_id +"/"+ ride.route.route_id;
      var caption = ride.toShareMessage();
      //http://localhost:8100/routemap/2/2
      var opts =
      {
        method: 'feed',
          link: link,
        caption: caption,
        // display: 'dialog',
        redirect_uri: window.location.origin
      }
      $cordovaFacebook.showDialog(opts).then(function(response){
        $scope.closeSharePopover();
        // console.log(response);
      }, function(error){
        // console.log("error");
        // console.log(error);
        $localStorage.noFbShare = true;
        $scope.closeSharePopover();
      })
    }

    function setup(){
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(SHARE_POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
      $scope.route.sharing_options.setCurrentDate();
    });
  });

angular.module('st.selector')
.directive('locationSelector', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/location-selector.html',
      controller: "locationSelectorController"
    }
  })
.controller('locationSelectorController', function($scope, placeService, displayService, MapVM, Place){
    function generateTapDisable(rootId){
      return function(itemId){
        var container = document.getElementsByClassName('pac-container');
        var acontainer = angular.element(container);
        var parent = acontainer.parent();
        var target = angular.element(document.getElementById(rootId)).parent();

        if(parent[0].$$hashKey != target[0].$$hashKey){
          container = acontainer.detach();
          target.prepend(container);
        }

        // disable ionic data tab
        angular.element(container).attr('data-tap-disabled', 'true');
        // leave input field if google-address-entry is selected
        angular.element(container).on("click", function(){

          document.getElementById(itemId).blur();

        });

      };
    }

    function clearTextField(itemId){
      document.getElementById(itemId).value = "";
    }

    function generateAutocompleteFunc(selectionResponse){
      return function (itemId){
        var input = document.getElementById(itemId);

        return function(google){
          var autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            selectionResponse(itemId, place);
          })
        };
      }

    }

    var start = $scope.autocompleteElements.start;
    // console.log(start);
    var end = $scope.autocompleteElements.end;

    $scope.disableTap = generateTapDisable($scope.rootElementId);

    function respondToLocationSelection(itemId, place){
      if(place === ""){
        return;
      }
      //Convert to local representation of the place object
      place = new Place(place);
      if(itemId == start){
        $scope.route.addOrigin(place);
      }else if(itemId == end){
        $scope.route.addDestination(place);
      }
      clearTextField(itemId);
      placeService.setPlaceDetails(place, function(place){
        MapVM.addMarker(place);
      });


      $scope.$apply();
    };

    $scope.startPlaceHolder = function(){
      if($scope.route.hasOrigins()){
        return "Choose a place to pick up a friend (optional)";
      }else{
        return "Choose a starting point for yourself";
      }
    };

    $scope.endPlaceHolder = function(){
      if($scope.route.hasDestinations()){
        return "Choose a place to drop off a friend (optional)";
      }else{
        return "Choose a destination for yourself";
      }
    };

    $scope.removeLocation = function(locations, idx){
      var loc = locations.splice(idx, 1)[0];
      MapVM.removeMarker(loc);
    };

    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    function setup(){
      if(document.getElementById(start) != null){
        GoogleMapsLoader.load(locationAutocomplete(start));
        GoogleMapsLoader.load(locationAutocomplete(end));
        autocompleteAttach();
      }
    }

    var autocompleteAttach = $scope.$on(SET_GOOGLE_AUTOCOMPLETE, function(event, response){
      setup();
    })
  });

angular.module('st.selector')
.directive('routeDetailsForm', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/route-details-form.html',
      controller: "routeDetailsController"
    }
  })
.controller('routeDetailsController', function($scope){
    $scope.disabledDate = function(date, mode) {
      return date < (new Date()).setHours(0,0,0,0);
    };

    $scope.timeOptions = {
      readonlyInput: false,
      showMeridian: false
    };

    $scope.dateStatus = {
      opened: false
    };

    $scope.timeStatus = {
      opened: false
    };

    $scope.openDatePopup = function($event, popup) {
      popup.opened = true;
    };
  });

angular.module('st.results', ['st.routeDirections'])
.directive('resultSummaryFooter', function(){
  return {
    restrict: 'A',
    templateUrl: 'components/route-results/results-summary.html',
  }})
.directive('responseBtns', function(){
  return {
    restrict: 'A',
    templateUrl: 'components/share-request/response-btns.html',
  }})
.controller('resultsSummaryController', function($scope, $ionicModal){

    $ionicModal.fromTemplateUrl('components/route-results/route-directions.html', {
      scope: $scope,
    }).then(function(modal){
      $scope.dirModal = modal;
    });
    $scope.showDirections = function(){
      $scope.dirModal.show();
    };
    $scope.hideDirections = function(){
      $scope.dirModal.hide();
    };


    function updateDisplay(){
      if($scope.directions){
        $scope.travel_time = $scope.directions.getTotalDuration();
        $scope.distance = $scope.directions.getTotalDistance();
        $scope.travel_cost = computeCost($scope.distance);

        $scope.legs = $scope.directions.getAllLegs();
      }
    }
    function computeCost(meters) {
      var cost = 3.20;
      if (meters>1000 && meters<=11000) {
        cost += Math.ceil((meters-1000)/400.0) * 0.22;
      } else if (meters>11000) {
        cost += 5.5 + Math.ceil((meters-11000)/350.0) * 0.22;
      }
      return cost.toFixed(2); // 2 d.p.
    }
    $scope.formatDistance =  function(meters){
      var km = meters / 1000;
      return km.toFixed(1);
    }
    $scope.formatTime = function(totalSecs){
      var secs = totalSecs%60;
      var tmins = Math.floor(totalSecs / 60);
      if(secs >= 30){
        //Round up
        tmins += 1;
      }
      var mins = tmins%60;
      var hours = Math.floor(tmins/60);

      var string = "";
      if(hours > 0){
        string += hours + " hours ";
      }
      if(mins > 0){
        string += mins + " mins";
      }
      return string;
    }

    $scope.$on(RESULT_POPOVER_SHOW_EVENT, function(event, results){
      $scope.directions = results;
      updateDisplay();
    })
    $scope.$on(RESET_DIRECTIONS_RESULT, function(event){
      $scope.directions = {};
    });
    if($scope.showResult){
      updateDisplay();
    }

  });

angular.module('st.routeDirections', [])
.controller('routeDirectionsController', function($scope, $sce){

    $scope.formatDisplayAddress = function (address){
      var split = address.split(",");
      if(split.length > 0){
        return split[0];
      }else{
        return address;
      }
    }

    $scope.renderHTML = function(text){
      return $sce.trustAsHtml(text);
    };

  });

/**
 * Created by naomileow on 21/9/15.
 */
angular.module('st.routeDetails', ['models.route', 'models.rideshare', 'relativeDate', 'st.rideShare.service', 'models.sharerequest'])
.controller('routeDetails', function($scope, Route, RideShare, SharingOptions, rideService, ShareRequest, ngToast){
  $scope.rideShare = new RideShare();
  $scope.route = new Route();
  $scope.originalRoute = $scope.rideShare.route;

    var setAutocomplete = true;


  $scope.autocompleteElements = {
    start: 'req-start-place',
    end: 'req-end-place'
  };
    $scope.rootElementId = "share-request-modal";
    $scope.displayOtherRiders = function(){

      var num = $scope.rideShare.getNumberOfRiders();
      if(num == 0){
        return "";
      }
      var disp = $scope.rideShare.riders[0].name;
      if(num == 2){
        disp += " and 1 other";
      }else if(num > 2){
        disp += " and " + (num + 1) + "other";
      }
      return disp;
  };

    $scope.$on(REQUEST_POPOVER_SHOW_EVENT, function(event, result){
      $scope.rideShare = result.rideShare;
      $scope.route = result.route;
      $scope.originalRoute = result.rideShare.route;
      $scope.arrival_date =  $scope.originalRoute.sharing_options.constructArrivalDate();
      // console.log(result);
      //$scope.$apply();
    })

    $scope.submitRequest = function() {
      var shareReq = ShareRequest.createRequestObject($scope.rideShare, $scope.route);
      // console.log(shareReq);
      rideService.requestSharedRide(shareReq).then(function(result){
        if(!result) {
          ngToast.create({
            className: 'warning',
            content: 'Failed send request.',
            timeout: 2000
          });
        } else {
          ngToast.create({
            className: 'info',
            content: 'Successfully sent request!',
            timeout: 2000
          });
        }
      });
      $scope.closePopover();
    }

    $scope.$watch('document.getElementById("req-start-place")', function(value){
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    })

    var evnt = $scope.$watch(function () {
      return document.getElementById($scope.autocompleteElements.start);
    }, function(val) {
      if(val){
        $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
        evnt();
      }
    });

  });

/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.saveroute', ['st.storage'])
.controller('saveRouteController', function($scope, storageService, ngToast){
    $scope.getRouteTypeDisplay = function(){
      var type = $scope.route.route_type;
      return routeOptions[type];
    }

    $scope.handleSaveRoute = function() {
      saveRouteLocally();
      $scope.closeSavePopover();
    }

    function saveRouteLocally(){
      if($scope.editMode === true){
        storageService.updateRoute($scope.route, function(result) {
          ngToast.create({
            className: 'info',
            content: 'Saved route to local store.',
            timeout: 2000
          });
          $scope.route.local_id = result;
          //Reset description
          $scope.route.local_description = "";
        });
      }else{
        storageService.saveRoute($scope.route, function(result) {
          ngToast.create({
            className: 'info',
            content: 'Saved route to local store.',
            timeout: 2000
          });
          $scope.route.local_id = result;
          //Reset description
          $scope.route.local_description = "";
        });
      }

    }
  })

/**
 * Created by naomileow on 23/9/15.
 */
var app = angular.module('st.listsaved', [])
.controller('listSavedController', function($scope, $state, storageService){
    $scope.requireReload = false;
    function loadRoutes(){
      storageService.getAllRoutesForUser(function(results){
        $scope.savedRoutes = results;
        // console.log("routes");
        // console.log(results);

        if(!navigator.onLine) {
          $scope.requireReload = true;
          var response = window.addEventListener("online", function(e) {
            window.location.reload(true);
            $scope.requireReload = false;
          });
        }
      });
    }

    $scope.$on('$ionicView.enter', function(){
      loadRoutes();
    });

    $scope.viewRoute = function (route){
      $state.go('mapview', {routeId:route.local_id});
    }

    $scope.deleteRoute = function(route, index){
      storageService.deleteRoute(route.local_id)
        .then(function(result){
          if(result == 'Transaction Completed'){
            $scope.savedRoutes.splice(index, 1);
          }
      });
    }



  })

app.filter('routesFilter', function(){
  function hasOriginOrDestinationMatch(route, searchStr) {
    return hasMatchInPlaceList(route.origins, searchStr) || hasMatchInPlaceList(route.destinations, searchStr);
  }

  function hasMatchInPlaceList(places, searchStr) {
    for(var idx in places){
      var place = places[idx];
      if(nameMatch(place.name, searchStr) ||
        (place.formatted_address && nameMatch(place.formatted_address, searchStr))){
        return true;
      }
    }
    return false;
  }

  function nameMatch(name, str) {
    if(!str){
      return true;
    }
    var lname = name.toLowerCase();
    var lstr = str.toLowerCase();
    return (lname.indexOf(lstr) >= 0);
  }

  return function(routes, searchStr){
    var result = [];
    angular.forEach(routes, function(route){
      var notes = route.sharing_options.notes;
      var local_desc = route.local_description;
      if(notes && nameMatch(notes, searchStr)){
        result.push(route);
      }else if(local_desc && nameMatch(local_desc, searchStr)){
        result.push(route);
      } else if(nameMatch(route.directions.getStartAddress(), searchStr)){
        result.push(route);
      } else if(nameMatch(route.directions.getEndAddress(), searchStr)){
        result.push(route);
      }else if(hasOriginOrDestinationMatch(route, searchStr)){
        result.push(route);
      }
    });
    return result;
  }
})

var app = angular.module('st.listshared', ['ngTouch', 'st.rideShare.service', 'ngStorage'])
.controller('listSharedCtrl', function($scope, $rootScope, $ionicPopup, $state, rideService, $ionicLoading){
  //$scope.sharedRoutes = [{
  //  route_id: 0,
  //  local_description: "Going to School",
  //  num_requests: 1,
  //  start_address: "NUS",
  //  end_address: "Vivocity",
  //  deadline: "8:30pm",
  //  sharing: "Naomi Leow and 1 other"
  //}];

  $scope.openSharedMap = function(ride) {
    $state.go('sharedmap', {rideId: ride.ride_share_id});
  }

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = 'Getting list of routes you have shared...';

  function loadRoutes(){
    showLoading();
    if(!$rootScope.isLoggedIn){
      $ionicLoading.hide();
      showLoginDialog();

    }else{
      rideService.loadAllRideShares().then(function(result){
        $scope.sharedRoutes = result;
        $ionicLoading.hide();
      });
    }

  }

    function showLoginDialog()  {
      var popup = $ionicPopup.confirm({
        title: 'Login to view your shared routes',
      });
      popup.then(function(res) {
        if(res) {
          $rootScope.login();
        } else {
        }
      });
    };

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders.filter(function(user){return user.user_id != sharedRoute.owner.user_id;});
      var num = (sharers)? sharers.length : 0;
      if(num > 0){
        var dis = sharers[0].name;
        if(num > 1){
          dis += " and " + (num - 1) + " other";
        }
        return dis;
      }else{
        return "";
      }
    }

    $scope.getNumberOfRequests = function(index){
      //TODO:
      return $scope.requestCounts[index];
    }

  $scope.$on('$ionicView.enter', function(){
     loadRoutes();
  });


  $scope.deleteRoute = function(ride, index){
    rideService.deleteSharedRide(ride).then(function(result){
      if(result){
        $scope.sharedRoutes.splice(index, 1);
      }
    });
  }

})

app.filter('sharedRideFilter', function(){
  function hasOriginOrDestinationMatch(route, searchStr) {
    return hasMatchInPlaceList(route.origins, searchStr) || hasMatchInPlaceList(route.destinations, searchStr);
  }

  function hasMatchInPlaceList(places, searchStr) {
    for(var idx in places){
      var place = places[idx];
      if(nameMatch(place.name, searchStr) ||
        (place.formatted_address && nameMatch(place.formatted_address, searchStr))){
        return true;
      }
    }
    return false;
  }

  function nameMatch(name, str) {
    if(!str){
      return true;
    }
    var lname = name.toLowerCase();
    var lstr = str.toLowerCase();
    var idx = lname.indexOf(lstr);
    return (idx >= 0);
  }

  return function(sharedRides, searchStr){
    var result = [];
    angular.forEach(sharedRides, function(ride){
      var route = ride.route;
      var notes = route.sharing_options.notes;
      var local_desc = route.local_description;
      if(notes && nameMatch(notes, searchStr)){
        result.push(ride);
      } else if(nameMatch(route.directions.getStartAddress(), searchStr)){
        result.push(ride);
      } else if(nameMatch(route.directions.getEndAddress(), searchStr)){
        result.push(ride);
      } else if(local_desc && nameMatch(local_desc, searchStr)){
        result.push(ride);
      } else if(hasOriginOrDestinationMatch(route, searchStr)){
        result.push(ride);
      }
    });
    return result;
  }
})

angular.module('st.listfriends', ['ngTouch', 'models.user','models.route', 'models.rideshare', 'models.sharerequest', 'models.place', 'st.service'])
.controller('listFriendsCtrl', function($scope, $state, $rootScope, $ionicPopup, rideService, storageService, $localStorage, $ionicLoading, $ionicModal,
                                        User, Route, RideShare, ShareRequest, ngToast, Place, placeService){

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.disableTap = function(){
      var container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){

        document.getElementById("friends-route-search").blur();

      });
    }
    $scope.loadingMessage = "Getting list of your friends' shared routes...";

    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders.filter(function(user){return user.user_id != sharedRoute.owner.user_id;});
      var num = (sharers)? sharers.length : 0;
      if(num > 0){
        var dis = sharers[0].name;
        if(num > 1){
          dis += " and " + (num - 1) + " other";
        }
        return dis;
      }else{
        return "";
      }
    }

    function showLoginDialog()  {
      var popup = $ionicPopup.confirm({
        title: "Login to view your friends' shared rides",
      });
      popup.then(function(res) {
        if(res) {
          $rootScope.login();
        } else {
        }
      });
    };

    function attachAutocomplete(google) {
      var input = document.getElementById("friends-route-search");
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if(place === ""){
          $scope.friendsRoutes = $scope.allFriendsRoutes;
          return;
        }
        //Convert to local representation of the place object
        place = new Place(place);

        placeService.setPlaceDetails(place, function(place){
          rideService.getRideSharesNearPlace(place).then(function(results){
            $scope.friendsRoutes = results;
          })
        });
      })
    }

  $scope.joinRoute = function(index) {
    var shareReq = ShareRequest.createRequestObject($scope.friendsRoutes[index], new Route());
    rideService.requestSharedRide(shareReq).then(function(result){
      if(!result) {
        ngToast.create({
          className: 'warning',
          content: 'Failed send request.',
          timeout: 2000
        });
      } else {
        ngToast.create({
          className: 'info',
          content: 'Successfully sent request!',
          timeout: 2000
        });
        loadRequestForAllRides();
      }
    });

  }

    $scope.getImageSrc = function(ride) {
      var fbId = ride.owner.facebook_id;
      if(fbId && fbId != ""){
        return "http://graph.facebook.com/" +fbId +"/picture";
      }else {
        return "/img/icon.png";
      }
    }

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

  //Plan Route View
  $ionicModal.fromTemplateUrl('components/share-request/route-details.html', {
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });

  $scope.openPopover = function(index){
    //storageService.getRouteByLocalId(1,function(result){console.log(result)})
    var rideShare = $scope.friendsRoutes[index];
    $scope.$broadcast(REQUEST_POPOVER_SHOW_EVENT, {
      rideShare: rideShare,
        route:new Route(),
      originalRoute:rideShare.route
    })

    $scope.popover.show();
  };
  $scope.closePopover = function(){
    $scope.popover.hide();
  };


  function loadRoutes(){
    showLoading();
    if(!$rootScope.isLoggedIn){
      $ionicLoading.hide();
      showLoginDialog();
    } else{
      rideService.loadAllFriendsRides().then(function(result){
        $scope.allFriendsRoutes = result;
        $scope.friendsRoutes = result;
        $ionicLoading.hide();
      });
      loadRequestForAllRides();
    }

  }

    function loadRequestForAllRides() {
      rideService.getAllSharedRideRequests().then(function(result){
        $scope.requestedIds = result.map(function(req){return req.ride_share_id});
      })
    }
  $scope.isAccepted = function(ride) {
    return ride.hasRider($localStorage.user);
  }
  $scope.isRequested = function(ride) {

      if($scope.requestedIds){
        var requested = ($scope.requestedIds.indexOf(ride.ride_share_id) >= 0);
        return requested;
      }else {
        return false;
      }

    }

  $scope.$on('$ionicView.enter', function(){
     loadRoutes();
  });

  GoogleMapsLoader.load(attachAutocomplete);

  //$scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
  //}

})

angular.module('st.listjoined', ['ngTouch', 'st.rideShare.service'])
.controller('listJoinedCtrl', function($scope, $state, $rootScope, $ionicPopup, storageService, rideService, $ionicLoading){
  //$scope.joinedRoutes = [{
  //  routeId: 0,
  //  owner: "Justin Yeo",
  //  local_description: "Going to School",
  //  start_address: "NUS",
  //  end_address: "Vivocity",
  //  deadline: "8:30pm",
  //  sharing: "Naomi Leow and 1 other"
  //}];

  $scope.openJoinedMap = function(ride) {
     $state.go('routeview', {rideId: ride.ride_share_id, routeId:ride.route.route_id});
  }

  function loadRoutes(){
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });
    showLoading();
    if(!$rootScope.isLoggedIn){
      $ionicLoading.hide();
      showLoginDialog();
    }else{
      rideService.loadAllJoinedRidesFromServer().then(function(result){
        $scope.joinedRoutes = result;
        $ionicLoading.hide();
      });
    }

    //rideService.loadAllRideShares().then(function(result){
    //  $scope.joinedRoutes = result;
    //});
  }

    function showLoginDialog()  {
      var popup = $ionicPopup.confirm({
        title: 'Login to view the cab shares you have joined',
      });
      popup.then(function(res) {
        if(res) {
          $rootScope.login();
        } else {
        }
      });
    };

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = 'Getting list of routes you have joined...';

    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders.filter(function(user){return user.user_id != sharedRoute.owner.user_id;});
      var num = (sharers)? sharers.length : 0;
      if(num > 0){
        var dis = sharers[0].name;
        if(num > 1){
          dis += " and " + (num - 1) + " other";
        }
        return dis;
      }else{
        return "";
      }
    }

    $scope.getImageSrc = function(ride) {
      var fbId = ride.owner.facebook_id;
      if(fbId && fbId != ""){
        return "http://graph.facebook.com/" +fbId +"/picture";
      }else {
        return "/img/icon.png";
      }
    }

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

    $scope.$on('$ionicView.enter', function(){
       loadRoutes();
    });


  $scope.leaveRoute = function(ride, index){
    //rideService.deleteRequestForRide
    //this.route = new Route();
    //this.ride_id = -1;
  }

})

angular.module('models.route', ['models.place', 'st.service', 'models.directions', 'models.sharingoptions'])
.factory('Route', function($http, Place, SharingOptions, Directions, directionsService){
  function Route(){
    //Locally cached routes have an attribute local_id
    //TODO: taxi fares will be stored as an attribute of route as well
    this.creator_id = -1;
    this.route_id = -1;
    this.origins = [];
    this.destinations = [];
    this.directions = new Directions();
    this.route_type = FASTEST_ROUTE_KEY;
    this.sharing_options = new SharingOptions();
  }

  Route.prototype.goOnline = function () {
    for(var idx in this.origins){
      this.origins[idx].goOnline();
    }
    for(var idx in this.destinations) {
      this.destinations[idx].goOnline();
    }
    this.directions.goOnline();
  }

  Route.prototype.saveToBackend = function($http){
    //POST to backend
  };

    Route.prototype.createMergedRoute = function(other) {
      var result = Route.clone(this);
      result.origins.push.apply(result.origins, other.origins);
      result.destinations.push.apply(result.destinations, other.destinations);
      return result;
    }

    Route.clone = function(route){
      var c = JSON.parse(JSON.stringify(route));
      return Route.buildFromCachedObject(c);
    }

    Route.buildFromCachedObject = function(obj) {
      var route = new Route();
      route.route_id = obj.route_id;
      route.local_id = obj.local_id;
      route.local_description = obj.local_description;
      route.origins = obj.origins.map(Place.buildFromCachedObject);
      route.destinations = obj.destinations.map(Place.buildFromCachedObject);
      route.directions = Directions.buildFromCachedObject(obj.directions);
      route.creator_id = obj.creator_id;
      if(obj.sharing_options){
        route.sharing_options = SharingOptions.buildFromCachedObject(obj);
      }
      return route;
    }

  Route.buildFromBackendObject = function(obj){
    var route = new Route();
    route.route_id = obj.id;
    route.creator_id = obj.user_id;
    route.origins = obj.origins.map(Place.buildFromBackendObject);
    route.destinations = obj.destinations.map(Place.buildFromBackendObject);
    route.directions = Directions.buildFromBackendObject(obj.direction); //yup it is direction on the server
    if(obj.share_details){
      route.sharing_options = SharingOptions.buildFromBackendObject(obj.share_details);
    }
    return route;
  };

  Route.prototype.addSharingOptions = function(sharingOptions) {
    this.sharing_options = sharingOptions;
  };

  Route.prototype.addOrigin = function(place){
    this.origins.push(place);
  };


  Route.prototype.addDestination = function(place){
    this.destinations.push(place);
  };

  Route.prototype.calculateDirections = function(cb){
    var self = this;
    directionsService.getDirections(this.origins, this.destinations, this.route_type, function(results, status){
      if(status == google.maps.DirectionsStatus.OK){
        self.directions = results;
        if(cb){
          cb(results, status);
        }
      }
    });
  };

  Route.prototype.hasOrigins = function(){
    return (this.origins.length > 0);
  };

  Route.prototype.hasDestinations = function(){
    return (this.destinations.length > 0);
  };

  Route.prototype.toBackendObject = function(){
    return {
      route_id: this.route_id,
      origins: this.origins.map(function(place){return place.toBackendObject()}),
      destinations: this.destinations.map(function(place){return place.toBackendObject()}),
      google_directions: this.directions.toBackendObject(),
      share_details: (this.sharing_options)?this.sharing_options.toBackendObject():{},
    }
  };

  return Route;
});

angular.module('models.directions', [])
  .factory('Directions', function(){
    function Directions(){
      this.data = {};
    }

    Directions.prototype.isEmpty = function(){
      return Object.keys(this.data).length == 0;
    }

    Directions.prototype.getAllIndexes = function(){
      return Object.keys(this.data);
    }

    Directions.reconstructBounds = function(bounds){
      var sw = bounds.Ga;
      var ne = bounds.Ka;
      var s = new google.maps.LatLng(sw.H, sw.j);
      var n = new google.maps.LatLng(ne.H, ne.j);
      return new google.maps.LatLngBounds(s, n);
    }

    Directions.reconstructPath = function(path){
      for(var i = 0; i<path.length; i++){
        path[i] = Directions.reconstructPoint(path[i]);
      }
      return path;
    }

    Directions.reconstructPoint = function(pt){
      return new google.maps.LatLng(pt.H, pt.L);
    }
    Directions.reconstructDirectionsFromJson = function(json){
      json.routes[0].bounds = Directions.reconstructBounds(json.routes[0].bounds);
      var legs = json.routes[0].legs;
      for(var i = 0; i < legs.length; i++){
        var steps = legs[i].steps;
        json.routes[0].legs[i].end_location = new google.maps.LatLng(legs[i].end_location.H, legs[i].end_location.L);
        json.routes[0].legs[i].start_location = new google.maps.LatLng(legs[i].end_location.H, legs[i].end_location.L);
        for(var j = 0; j < steps.length; j++){
          json.routes[0].legs[i].steps[j].end_location = Directions.reconstructPoint(steps[j].end_location);
          json.routes[0].legs[i].steps[j].end_point = Directions.reconstructPoint(steps[j].end_point);
          json.routes[0].legs[i].steps[j].start_location = Directions.reconstructPoint(steps[j].start_location);
          json.routes[0].legs[i].steps[j].start_point = Directions.reconstructPoint(steps[j].start_point);
        }
      }
      Directions.reconstructPath(json.routes[0].overview_path);
      json.request.destination = Directions.reconstructPoint(json.request.destination);
      json.request.origin = Directions.reconstructPoint(json.request.origin);
      return json;
    }

    Directions.prototype.getIterator = function(){
      var keys = Object.keys(this.data);
      var length = keys.length;
      var index = 0;
      var directions = this.data;
      return {
        next: function() {
          if (!this.hasNext()) {
            return null;
          }
          var dir = directions[index];
          index++;
          return dir;
        },
        hasNext: function() {
          return index < length;
        },
        current: function() {
          return directions[index];
        }
      }
    }

    Directions.prototype.insertDirectionInOrder = function (idx, dir) {
      this.data[idx] = dir;
    }

    Directions.prototype.getDirectionForOrder = function(idx) {
      return this.data[idx];
    }

    Directions.prototype.getTotalDistance = function() {
      var total = 0;
      for(var i in this.data){
        var route = this.getDirectionForOrder(i).routes[0].legs;
        for(var l in route){
          total += route[l].distance.value;
        }
      }
      return total;
    }

    Directions.prototype.getTotalDuration = function() {
      var total = 0;
      for(var i in this.data){
        var route = this.getDirectionForOrder(i).routes[0].legs;
        for(var l in route){
          total += route[l].duration.value;
        }
      }
      return total;
    }

    Directions.prototype.getAllLegs = function() {
      var allLegs = []
      for(var i in this.data){
        var route = this.getDirectionForOrder(i).routes[0].legs;
        allLegs.push.apply(allLegs, route);
      }
      return allLegs;
    }

    Directions.buildFromBackendObject = function(obj){
      var dirs = new Directions();
      if(obj){
        for(var idx in obj){
          var dir =  obj[idx];
          dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
          dirs.insertDirectionInOrder(idx, dir);
        }
        dirs.deserialised = true;
      }

      return dirs;
    }

    Directions.prototype.isDeserialisedDirections = function() {
      if(this.deserialised){
        return true;
      }else{
        return false;
      }
    }

    Directions.prototype.goOnline = function() {
      GoogleMapsLoader.load(function(google){
        if(this.needSerialising){
          var data = this.data;
          for(var idx in data){
            var dir = data[idx];
            dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
            this.insertDirectionInOrder(idx, dir);
          }
          this.needSerialising = false;
        }
      });
    }

    Directions.buildFromCachedObject = function(obj){
      var dirs = new Directions();
      var data = obj.data;
      if(navigator.onLine) {
        for(var idx in obj.data){
          var dir = data[idx];
          dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
          dirs.insertDirectionInOrder(idx, dir);
        }
      } else {
        dirs.needSerialising = true;
        for(var idx in data){
          dirs.insertDirectionInOrder(idx, data[idx]);
        }
      }
      dirs.deserialised = true;
      return dirs;
    }

    Directions.prototype.toBackendObject = function() {
      return this.data;
    }

    Directions.prototype.getStartAddress = function() {
      var legs = this.getAllLegs();
      if(legs.length > 0){
        var sleg = legs[0];
        return sleg.start_address;
      }
    }

    Directions.prototype.getEndAddress = function() {
      var legs = this.getAllLegs();
      var endIdx = legs.length - 1;
      if(endIdx >= 0){
        return legs[endIdx].end_address;
      }
    }

    Directions.prototype.getStopsInOrder = function() {
      var legs = this.getAllLegs();
      var stops = [];
      var num = legs.length;
      for(var i=0; i < num - 1; i++){
        stops.push(legs[i].start_address);
      }
      stops.push(legs[num - 1].start_address);
      stops.push(legs[num - 1].end_address);
      return stops;
    }

    //Takes Google Maps API v3 directionsRequest and directionsResult objects as input.
//Returns serialized directionsResult string.
    function serializeDirectionsResult (directionsRequest, directionsResult) {
      var copyright = directionsResult.routes[0].copyrights;
      var travelMode = directionsRequest.travelMode;
      var legs = directionsResult.routes[0].legs;
      var steps = [];
      for(var idx = 0; idx < legs.length; idx++){
        var startLat = directionsResult.routes[0].legs[idx].start_location.H;
        var startLng = directionsResult.routes[0].legs[idx].start_location.L;
        var endLat = directionsResult.routes[0].legs[idx].end_location.H;
        var endLng = directionsResult.routes[0].legs[idx].end_location.L;
        for (var i = 0; i < directionsResult.routes[0].legs[idx].steps.length; i++){
          var pathLatLngs = [];
          for (var c = 0; c < directionsResult.routes[0].legs[idx].steps[i].path.length; c++){
            var lat = directionsResult.routes[0].legs[idx].steps[i].path[c].H;
            var lng = directionsResult.routes[0].legs[idx].steps[i].path[c].L;
            pathLatLngs.push( { "lat":lat , "lng":lng }  );
          }
          steps.push( pathLatLngs );
        }
      }
      var serialSteps = JSON.stringify(steps);
      //Return custom serialized directions result object.
      return copyright + "`" + travelMode + "`" + startLat + "`" + startLng + "`" + endLat + "`" + endLng + "`" + serialSteps;
    }

    //Takes serialized directionResult object string as input.
    //Returns directionResult object.
    function deserializeDirectionsResult (serializedResult) {
      var serialArray = serializedResult.split("`");
      const travMode = serialArray[1];
      var directionsRequest = {
        travelMode: travMode,
        origin: new google.maps.LatLng(serialArray[2], serialArray[3]),
        destination: new google.maps.LatLng(serialArray[4], serialArray[5]),
      };
      var directionsResult = {};
      directionsResult.request = directionsRequest;
      directionsResult.routes = [];
      directionsResult.routes[0] = {};
      directionsResult.routes[0].copyrights = serialArray[0];
      directionsResult.routes[0].legs = [];
      directionsResult.routes[0].legs[0] = {};
      directionsResult.routes[0].legs[0].start_location = directionsRequest.origin;
      directionsResult.routes[0].legs[0].end_location = directionsRequest.destination;
      directionsResult.routes[0].legs[0].steps = [];
      var deserializedSteps = JSON.parse(serialArray[6]);
      for (var i = 0; i < deserializedSteps.length; i++){
        var dirStep = {};
        dirStep.path = [];
        for (var c = 0; c < deserializedSteps[i].length; c++){
          var lat = deserializedSteps[i][c].lat;
          var lng = deserializedSteps[i][c].lng;
          var theLatLng = new google.maps.LatLng(lat, lng);
          dirStep.path.push( theLatLng );
        }
        dirStep.travel_mode = travMode;
        directionsResult.routes[0].legs[0].steps.push( dirStep );
      }
      return directionsResult;
    }

    return Directions;
  });

angular.module('models.place', [])
.factory('Place', function($http){
  function Place(googlePlace){
    if(googlePlace){
      this.name = (googlePlace.name)?googlePlace.name:"";
      this.place_id = (googlePlace.place_id)?googlePlace.place_id:"";
      this.location = (googlePlace.geometry)?googlePlace.geometry.location:null;
      this.formatted_address = (googlePlace.formatted_address)? (googlePlace.formatted_address): "";
    }
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      formatted_address: this.formatted_address,
      // longitude: this.location.lat(),
      // latitude: this.location.lng()
      longitude: this.location.lng(), 
      latitude: this.location.lat()
    }
  };

    Place.buildFromCachedObject = function(obj) {
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.place_id;
      place.formatted_address = obj.formatted_address;
      if (navigator.onLine){
        var location = new google.maps.LatLng(obj.location.H, obj.location.L);
        place.location = location;
      } else {
        
        if(obj.location && obj.location.H){
          place.latitude = obj.location.H;
          place.longitude = obj.location.L;
        } 
        
      }
      
      return place;
    };

    Place.buildFromBackendObject = function(obj){
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.google_place_id;
      place.formatted_address = obj.formatted_address;
      // var location = new google.maps.LatLng(obj.longitude, obj.latitude);
      var location = new google.maps.LatLng(obj.latitude, obj.longitude);

      place.location = location;
      return place;
    };

    Place.prototype.goOnline = function() {
      if(this.latitude){
        GoogleMapsLoader.load(function(google){
          this.location = new google.maps.LatLng(this.latitude, this.longitude);
          delete this.latitude;
          delete this.longitude;
        })
      }
    }

  return Place;
});

angular.module('models.sharingoptions', [])
.factory('SharingOptions', function(){
  function SharingOptions(){
    this.notes = "";
    this.setCurrentDate();
  }

  SharingOptions.buildFromCachedObject = function(obj){
    var ret = new SharingOptions();
    ret.notes = obj.notes;
    ret.arr_date = ret.parseDate(obj.arr_date);
    ret.arr_time = ret.parseDate(obj.arr_time);
    return ret;
  }

  SharingOptions.prototype.parseDate = function (dateAsString) {
    //Assumes UTC date
    if(dateAsString){
      var parsed = new Date(dateAsString.replace(/-/g, '/'));
      var result = new Date(parsed.setHours(parsed.getHours() + 8));
      return result;
    }else {
      return new Date();
    }

  };

  SharingOptions.prototype.constructArrivalDate = function(){
    var arr_date = this.arr_date;
    var arr_time = this.arr_time;
    var date = new Date(arr_date.getFullYear(), arr_date.getMonth(),
      arr_date.getDate(), arr_time.getHours(), arr_time.getMinutes(),
      arr_time.getSeconds(), arr_time.getMilliseconds());
    return date;
  };

  SharingOptions.prototype.setCurrentDate = function(){
    this.arr_date = new Date();
    this.arr_time = new Date();
    this.arr_time.setMinutes((this.arr_date.getMinutes() + 15));
  };

  SharingOptions.buildFromBackendObject = function(obj){
    var sharingOptions = new SharingOptions();
    sharingOptions.notes = obj.notes;
    sharingOptions.arr_date = sharingOptions.parseDate(obj.arrival_time);
    sharingOptions.arr_time = sharingOptions.parseDate(obj.arrival_time);
    return sharingOptions;
  };

  SharingOptions.prototype.toBackendObject = function(){
    return {
      arrival_time: this.constructArrivalDate(),
      notes: this.notes
    }
  };

  return SharingOptions;
});

angular.module('models.user', [])
  .factory('User', function($http){
    function User(){
      this.name = "";
      this.facebook_id = "";
      this.user_id = -1;
    }

    User.buildFromCachedObject = function(obj){
      var user = new User();
      user.name = obj.name;
      user.facebook_id = obj.facebook_id;
      user.user_id = obj.user_id;
      return user;
    }

    User.prototype.toBackendObject = function(){
      return {
        name: this.name,
        facebook_id: this.facebook_id,
        user_id: this.user_id
      }
    };

    User.buildFromBackendObject = function(obj) {
      var user = new User();
      user.user_id = obj.id;
      user.name = obj.name;
      user.email = obj.email;
      if(obj.facebook_id){
        user.facebook_id = obj.facebook_id;
      }
      return user;
    };

    return User;
  });

angular.module('models.rideshare', ['models.route', 'models.user', 'st.user.service'])
.factory('RideShare', function($http, Route, User, userService){
  function RideShare(){
    //attributes: owner, riders, route
    this.ride_share_id = -1;
    this.owner = new User();
    this.riders = [];
    this.route = new Route();
  }

    function formatDisplayAddress(address){
      var split = address.split(",");
      if(split.length > 0){
        return split[0];
      }else{
        return address;
      }
    }

    RideShare.prototype.goOnline = function() {
      this.route.goOnline();
    }

  RideShare.prototype.hasRider = function(user) {
    var riders = this.riders;
    for(var idx in riders){
      if(user.user_id == riders[idx].user_id){
        return true;
      }
    }
    return false;
  }

  RideShare.prototype.toShareMessage = function() {
    var directions = this.route.directions;
    var start = formatDisplayAddress(directions.getStartAddress());
    var end = formatDisplayAddress(directions.getEndAddress());
    return "Share a cab with me from " + start + " to " + end;
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

angular.module('models.sharerequest', ['models.route', 'st.service'])
  .factory('ShareRequest', function(Route){
    function ShareRequest(){
      this.share_request_id = -1;
      this.route = new Route();
      this.merged_route = new Route();
      this.ride_share_id = -1;
    }

    ShareRequest.prototype.addMergedResult = function(route){
      this.merged_route = route;
    }

    ShareRequest.prototype.getMergedResult = function(route){
      return this.merged_route;
    }

    ShareRequest.createRequestObject = function(rideShare, route){
      var req = new ShareRequest();
      req.route = route;
      req.ride_share_id = rideShare.ride_share_id;
      return req;
    }

    ShareRequest.prototype.toBackendObject = function(){
      var routeObj = this.route.toBackendObject();
      routeObj.ride_id = this.ride_share_id;
      return routeObj;
    };

    ShareRequest.prototype.buildFromCachedObject = function() {
      //TODO: implement local caching
    }

    ShareRequest.buildFromBackendObject = function(obj){
      var re = new ShareRequest();
      if(obj.share_request_id){
        re.share_request_id = obj.share_request_id;
      }
      re.route = Route.buildFromBackendObject(obj);
      re.ride_share_id = obj.ride_id;
      return re;
    };

    return ShareRequest;
  });


/**
 * Created by naomileow on 22/9/15.
 */
angular.module('vm.map', ['st.service'])
.factory('MapVM', function($q, displayService, placeService, Place){
    //Stores the map view, location markers and route renderers
    var view = {
      directionRenders: [],
      mapMarkers: {}
    }

    function loadMap(lat, long){
      var result = displayService.loadMap(lat, long);
      view.map = result.map;
      setPosition(result.location);
    }

    function loadMapForElement(elm, lat, long){
      var result = displayService.loadMapForElement(elm, lat, long);
      view.map = result.map;
    }

    function loadMapAtLocation(loc){
      var map = displayService.loadMapAtLocation(loc);
      view.map = map;
    }

    function loadMapAtAddress(addr, cb) {
      displayService.loadMapAtAddress(addr, function(map){
        view.map = map;
        cb();
      });
    }

    function setMap(map){
      view.map = map;
    }

    function getMap(){
      return view.map;
    }

    function clearView(){
      clearDirections();
      clearMarkers();
    }

    function setPosition(myLatLng){
      view.position = myLatLng;
      placeService.getPlace(myLatLng, function(place){
        view.currentPlace = place;
      })
    }

    function getPosition(){
      return view.position;
    }

    function getCurrentPlace() {
      return view.currentPlace;
    }

    function displayDirections(directions, showMarkers){
      //TODO: refactor this process
      displayService.displayDirections(view.directionRenders, view.map, directions, showMarkers);
    }

    function displayOrigins(origins) {
      displayMarkersForPlaces(origins, 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }

    function displayDestinations(destinations) {
      displayMarkersForPlaces(destinations, 'default');
    }

    function displayMarkersForPlaces(places, icon) {
      for(var idx in places){
        var place = places[idx];
        var marker = addMarker(place);
        if(marker && icon !== 'default') {
          marker.setIcon(icon);
        }
      }
    }

    function clearDirections(){
      displayService.clearDirections(view.directionRenders);
      view.directionRenders = [];
    }

    function addPositionMarker(){
      var defer = $q.defer();
      var place = view.currentPlace;
      if(view.positionMarker){
        defer.resolve(null);
      }
      if(!place){
        var pos = view.position;
        placeService.getPlace(pos, function(place){
          view.currentPlace = place;
          displayPositionMarker(place);
          defer.resolve(view.positionMarker);
        })
      }else{
        displayPositionMarker(place);
        defer.resolve(view.positionMarker);
      }
      return defer.promise;
    }

    function displayPositionMarker(place){
      view.positionMarker = displayService.addMarker(place, view.map);
      view.positionMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }

    function removePositionMarker(){
      var marker = view.positionMarker;
      if(marker){
        displayService.removeMarker(marker);
      }
    }
    function addMarker(place) {
      var id = place.place_id;
      var markers = view.mapMarkers;
      if(markers[id] === undefined){
        var marker = displayService.addMarker(place, view.map);
        if(marker){
          markers[id] = marker;
        }
        return marker;
      }
    }

    function removeMarker(place) {
      var marker = view.mapMarkers[place.place_id];
      if(marker){
        displayService.removeMarker(marker);
        delete view.mapMarkers[place.place_id];
      }
    }

    function clearMarkers(){
      for(var id in view.mapMarkers) {
        var marker = view.mapMarkers[id];
        displayService.removeMarker(marker);
        delete view.mapMarkers[id];
      }
    }

    return {
      //setMap: setMap,
      getMap: getMap,
      loadMap: loadMap,
      loadMapAtLocation: loadMapAtLocation,
      loadMapAtAddress: loadMapAtAddress,
      loadMapForElement: loadMapForElement,
      setPosition: setPosition,
      getPosition: getPosition,
      getCurrentPlace: getCurrentPlace,
      addPositionMarker: addPositionMarker,
      removePositionMarker: removePositionMarker,
      clearDirections: clearDirections,
      displayDirections: displayDirections,
      addMarker: addMarker,
      removeMarker: removeMarker,
      clearMarkers: clearMarkers,
      clearView: clearView,
      displayOrigins: displayOrigins,
      displayDestinations: displayDestinations
    }
  });
