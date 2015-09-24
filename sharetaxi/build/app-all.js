// App entrance

angular.module('sharetaxi', ['ionic', 'indexedDB', 'st.map', 'st.selector', 'st.toolbar', 'st.results', 'ngOpenFB', 'st.user.service', 'ngStorage', 'st.routeDetails', 'st.sidemenu', 'st.intro', 'st.listsaved', 'st.listshared', 'st.sharedmap' ])
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
      .state('mapview', {
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
        templateUrl: 'components/map/map-shared.html',
        controller: 'sharedMapCtrl'
      })
      .state('friends', {
        url: '^/friends',
        templateUrl: 'components/list/list-friends.html'
      })
      .state('joined', {
        url: '^/joined',
        templateUrl: 'components/list/list-joined.html'
      })
      .state('test', {
        url: '/test',
        templateUrl: 'components/share-request/route-details.html',
        controller: 'routeDetails'
      })
    $urlRouterProvider.otherwise('/main/0');
  })
.run(function($ionicPlatform, $localStorage, ngFB, fbAppId) {
  ngFB.init({appId: fbAppId, tokenStore: $localStorage});
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
.controller('mainCtrl', function(googleApiKey, $rootScope, $state, $scope, $ionicSideMenuDelegate, userService, $localStorage, $window){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];
  ionic.Platform.ready(function(){
    // will execute when device is ready, or immediately if the device is already ready.
    $ionicSideMenuDelegate.canDragContent(false);
  });

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.goToMainAndToggleLeft = function(){
    $scope.toggleLeft();
    if($rootScope.visitedEdit){
      $window.location.href = "/main/";
    }else{
      $state.go('mapview');
    }
  }

  $rootScope.login = function(){
      userService.fbLogin().then(function(result){
        $rootScope.isLoggedIn = result;
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

  if(navigator.onLine){
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
  }

    function checkAppCacheForUpdates(){
      if (window.applicationCache) {
        applicationCache.addEventListener('updateready', function() {
          $window.location.reload();
        });
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

RESULT_POPOVER_SHOW_EVENT = "show distance result";
SET_GOOGLE_AUTOCOMPLETE = "set google autocomplete";

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

    function loadMapAtLocation(latLng){

      var mapOptions = {
        center: latLng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
      };
      console.log(mapOptions)
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
      loadMapAtLocation: loadMapAtLocation,
      loadMapAtAddress: loadMapAtAddress,
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
angular.module('st.user.service', ['ngOpenFB', 'models.user', 'ngStorage'])
.factory('userService', function($http, $location, $localStorage, ngFB, backendPort, User){
    var userData = $localStorage.user? $localStorage.user: new User();

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

    function getUserDataFromFacebook(cb){
      return ngFB.api({path:'/me'}).then(function (response) {
        userData.name = response.name;
        userData.userID = response.id;
      });
    }
    return {
      fbLogin: function(){
        return ngFB.login({scope: 'email, user_friends'}).then(
          function(response){
            if (response.status === 'connected') {
              return doBackendLogin(response);
            } else {
              console.log('Facebook login failed');//TODO:
              return false;
            }
          }
        )
      },
      fbLogout: function(){
        return ngFB.logout().then(
          function(response){
            logoutFromBackend();
          }
        );
      },
      logout: logoutFromBackend,
      getFbLoginStatus: function(){
        return ngFB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
              doBackendLogin(response);
            }
        });
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
      }
    }

  });

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


    function requestSharedRide(){
      //TODO: WTH the api is weird. but no time to fix it
      var postUrl = "http://" + $location.host() + ":" + backendPort + "/route";

      return $http({
        method: 'POST',
        url: postUrl,
        withCredentials: true,
        data: route
      }).then(function(ride){

      });
    }



    return {
      createSharedRide: createSharedRide,
      requestSharedRide: requestSharedRide
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
        store.insert(rideShare).then(function(result){
          cb(result[0]);
        });
      });
    }

    function updateRideShare(rideShare, cb){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        //rideShare = JSON.parse(JSON.stringify(rideShare));
        store.upsert(rideShare).then(function(result){
          cb(result[0]);
        });
      });
    }

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
      updateRideShare: updateRideShare,
      getRideShareById: getRideShareById,
      getRideShareForRoute: getRideShareForRoute,
      getRideShareByOwner: getRideShareByOwner,
      deleteRideShare: deleteRideShare
  }
  });

angular.module('st.map',['ngCordova', 'ngStorage', 'vm.map', 'models.route', 'st.storage', 'st.service'])
.controller('mapCtrl', function($scope, $rootScope, $localStorage, $cordovaGeolocation, $ionicHistory, $ionicLoading, MapVM, Route, $stateParams, displayService, storageService){
    var scopeRef = $scope;
    function showLoading(){
      console.log("show loading")
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }
    function checkandSetState(){
      if($stateParams.routeId && parseInt($stateParams.routeId) > 0){
        $rootScope.visitedEdit = true;
        $scope.editMode = true;
        $scope.loadingMessage = 'Acquiring route data...';
        $scope.showResult = true;
        $scope.routeId =  parseInt($stateParams.routeId);
      }else{
        $scope.editMode = false;
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
    function loadRouteFromStore(){
      $scope.route = new Route();
      showLoading();
      GoogleMapsLoader.load(function(google){
        //Ensure things are loaded only when google is loaded into the dom
        storageService.getRouteByLocalId($scope.routeId, function(route){
          $scope.route = route;
          MapVM.loadMapAtAddress(route.directions.getStartAddress(), function(){
            console.log("directions display");
            MapVM.displayDirections(route.directions, true);
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
      loadRouteData();
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
        console.log("gps")
        lat  = position.coords.latitude;
        long = position.coords.longitude;
      }else {
        console.log("google");
        lat = position.lat();
        long = position.lng();
      }
      function loadMap(google){
        MapVM.loadMap(lat, long);
        if(!$scope.editMode){
          MapVM.addPositionMarker();
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

    function setupListeners(){
      $scope.$on(SHOW_DIRECTIONS_RESULT, function(event, result){
        setAndDisplayDirectionResult(result)
      });
      $scope.$on('$destroy', function() {
        console.log('destroy map view');
        $scope.map = null;
      });

      $scope.$on('$ionicView.leave', function(){
        $scope.notNew = true;
      });

      $scope.$on('$ionicView.beforeEnter', function(){
        console.log("before");
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

    console.log("controller loaded");
    $ionicHistory.clearCache();
    setupListeners();
  });

angular.module('st.sharedmap',['ngCordova', 'vm.map'])
.controller('sharedMapCtrl', function($scope, $cordovaGeolocation, $ionicLoading, MapVM, $state, $stateParams){
  $scope.returnToList = function() {
    console.log("in map view:");
    console.log($stateParams.currRoute);
    $state.go('shared');
  }

  $scope.showResult = false;
  ionic.Platform.ready(onDeviceReady);
  $scope.loadingMessage = 'Acquiring location data...';
  function onDeviceReady() {
    $ionicLoading.show({
      templateUrl: 'components/spinner/loading-spinner.html',
      scope: $scope
    });

    $scope.$on(SHOW_DIRECTIONS_RESULT, function(event, result){
      $scope.directions = result;
      $scope.showDirectionsResult();
      $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, $scope.directions);
    });

    $scope.hideDirectionsResult = function(){
      $scope.showResult = false;
      $scope.$apply();
    }

    $scope.showDirectionsResult = function(){
      $scope.showResult= true;
      $scope.$apply();
    }


    var posOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    function loadGoogleMap(position){
      var lat;
      var long;
      if(position == null){
        lat = 1.3000;
        long = 103.8000;
      }else{
        lat  = position.coords.latitude;
        long = position.coords.longitude;
      }


      function loadMap(google){
        var myLatLng = new google.maps.LatLng(lat, long);
        MapVM.setPosition(myLatLng);
        console.log(myLatLng)
        var mapOptions = {
          center: myLatLng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          panControl: false,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        MapVM.setMap(map);
        MapVM.addPositionMarker();
        //$scope.geocoder = new google.maps.Geocoder;
        //$scope.geocoder.geocode({'location': myLatLng}, function(results, status) {
        //  if (status === google.maps.GeocoderStatus.OK) {
        //    $scope.country = results[4].formatted_address;
        //  }
        //});
        $ionicLoading.hide();
      }
      if(navigator.onLine){
        GoogleMapsLoader.load(loadMap);
      }else{
        $ionicLoading.hide();
      }

    }

    $cordovaGeolocation.getCurrentPosition(posOptions).then(loadGoogleMap, function(err) {
      loadGoogleMap(null);
      console.log(err);
    });
  };
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
    console.log("toolbar controller");
    $scope.refresh = function(){
      $scope.resetRoute();
      MapVM.clearView();
      $scope.resetDisplayedDirections();
    }

    $scope.hasValidLocations = function(){
      return $scope.route.hasOrigins() && $scope.route.hasDestinations();
    };

    $scope.canSaveRoute = function(){
      return !$scope.route.directions.isEmpty() && $scope.hasValidLocations();
    };

    //User must be logged in in order to use the share route function
    $scope.openSharePopoverOrLogin = function(){
      if($rootScope.isLoggedIn){
        $scope.openSharePopover();
      }else{
        $scope.showLoginDialog();
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
          console.log('You are not sure');
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
      $scope.popover.show();
      $scope.$broadcast(POPOVER_SHOW_EVENT);
    };
    $scope.closePopover = function(){
      $scope.popover.hide();
    };

    //Share Route View
    $ionicModal.fromTemplateUrl('components/location-selector/share-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.sharePopover = popover;
    });
    $scope.openSharePopover = function(){
      $scope.sharePopover.show();
      $scope.$broadcast(SHARE_POPOVER_SHOW_EVENT);
    };
    $scope.closeSharePopover = function(){
      $scope.sharePopover.hide();
    };

    //Save Route View
    $ionicModal.fromTemplateUrl('components/save-route/save-route-dialog.html', {
      scope: $scope
    }).then(function(popover){
      $scope.savePopover = popover;
    });
    $scope.openSavePopover = function(){
      $scope.savePopover.show();
    }
    $scope.closeSavePopover = function() {
      $scope.savePopover.hide();
    }


    $scope.$on('$destroy', function() {
      console.log("destroyed modals")
      $scope.popover.remove();
      $scope.sharePopover.remove();
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

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options', 'monospaced.elastic',
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
  .controller('shareRouteForm', function($scope, rideService, SharingOptions, MapVM){
    $scope.autocompleteElements = {
      start: 'share-start',
      end: 'share-end'
    };
    $scope.rootElementId = "location-share-modal";

    var isSetup = false;

    $scope.sharingOptions = new SharingOptions();

    $scope.submitSelections = function(){
      if(checkLocationInputs($scope)) {
        MapVM.removePositionMarker();
        MapVM.clearDirections();

        $scope.route.calculateDirections(function (results, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            MapVM.displayDirections(results, false);
            shareRequest($scope.route);
          }else {
            //TODO: alert fail
          }
        });
      }
      $scope.closeSharePopover();
    };

    function shareRequest(route){
      rideService.createSharedRide(route).then(function(result){

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
      $scope.sharingOptions.setCurrentDate();
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
      $scope.travel_time = $scope.directions.getTotalDuration();
      $scope.distance = $scope.directions.getTotalDistance();

      $scope.legs = $scope.directions.getAllLegs();
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
angular.module('st.routeDetails', ['models.route', 'models.rideshare', 'relativeDate'])
.controller('routeDetails', function($scope, Route, RideShare, SharingOptions){
  $scope.rideShare = new RideShare();
  $scope.route = new Route();
  $scope.originalRoute = $scope.rideShare.route;

  //start Testdata
    $scope.rideShare.owner.name = "Justin Yeo";
    $scope.rideShare.riders = [{name: "Naomi Leow"}, {name: "blah"}];
    $scope.originalRoute.origins = [{name: "o1"}, {name: "o2"}]
    $scope.originalRoute.destinations = [{name: "d1"}, {name: "d2"}]

    $scope.originalRoute.sharing_options = new SharingOptions();

    $scope.route.origins = [{name:"a1"}];
  //End Testdata

  $scope.arrival_date =  $scope.originalRoute.sharing_options.constructArrivalDate();

  $scope.autocompleteElements = {
    start: 'rq-start-place',
    end: 'rq-end-place'
  };
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
    $scope.rootElementId = "share-request-modal";

    $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
  });

/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.saveroute', ['st.storage'])
.controller('saveRouteController', function($scope, storageService){
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
          console.log("route updated")
          $scope.route.local_id = result;
          //Reset description
          $scope.route.local_description = "";
        });
      }else{
        storageService.saveRoute($scope.route, function(result) {
          console.log("route saved")
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
angular.module('st.listsaved', [])
.controller('listSavedController', function($scope, $state, storageService){

    function loadRoutes(){
      storageService.getAllRoutesForUser(function(results){
        $scope.savedRoutes = results;
        console.log("routes");
        console.log(results);
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

angular.module('st.listshared', ['ngTouch'])
.controller('listSharedCtrl', function($scope, $state, storageService){
  $scope.savedRoutes = [{
    local_description: "Going to School",
    num_requests: 1,
    start_address: "NUS",
    end_address: "Vivocity",
    deadline: "8:30pm",
    sharing: "Naomi Leow and 1 other"
  }];

  $scope.openSharedMap = function(route) {
    $state.go('sharedmap', {currRoute: route});
  }

  function loadRoutes(){
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });
  }

  $scope.$on('$ionicView.enter', function(){
    // loadRoutes();
  });


  $scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
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
  }

  Route.prototype.saveToBackend = function($http){
    //POST to backend
  };

  Route.prototype.loadFromBackend = function(route_id){

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
    route.route_id = obj.route_id;
    route.origins = obj.origins.map(Place.buildFromBackendObject);
    route.destinations = obj.destinations.map(Place.buildFromBackendObject);
    route.directions = Directions.buildFromBackendObject(obj.directions);
    if(obj.sharing_options){
      route.sharing_options = SharingOptions.buildFromBackendObject(obj.sharing_options);
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
    directionsService.getDirections(this.origins, this.destinations, this.route_type, function(results, status){
      if(status == google.maps.DirectionsStatus.OK){
        this.directions = results;
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
      origins: this.origins.map(place.toBackendObject),
      destinations: this.destinations.map(place.toBackendObject),
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
      var data = obj.data;
      for(var idx in obj.data){
        var dir =  data[idx];
        dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
        dirs.insertDirectionInOrder(idx, dir);
      }
      dirs.deserialised = true;
      return dirs;
    }

    Directions.prototype.isDeserialisedDirections = function(){
      if(this.deserialised){
        return true;
      }else{
        return false;
      }
    }

    Directions.buildFromCachedObject = function(obj){
      var dirs = new Directions();
      var data = obj.data;
      for(var idx in obj.data){
        var dir = data[idx];
        dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
        dirs.insertDirectionInOrder(idx, dir);
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
    }
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      formatted_address: this.formatted_address,
      //longtitude: this.location.H,
      longtitude: this.location.lat(),
      latitude: this.location.lng()
    }
  };

    Place.buildFromCachedObject = function(obj) {
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.place_id;
      place.formatted_address = obj.formatted_address;

      var location = new google.maps.LatLng(obj.location.H, obj.location.L);

      place.location = location;
      return place;
    };

    Place.buildFromBackendObject = function(obj){
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.google_place_id;
      place.formatted_address = obj.formatted_address;
      var location = new google.maps.LatLng(obj.longtitude, obj.latitude);
      place.location = location;
      return place;
    };

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
    ret.arr_date = obj.arr_date;
    ret.arr_time = obj.arr_time;
    return ret;
  }

  SharingOptions.prototype.constructArrivalDate = function(){
    var arr_date = this.arr_date;
    var arr_time = this.arr_time;
    return new Date(arr_date.getFullYear(), arr_date.getMonth(),
     arr_date.getDate(), arr_time.getHours(), arr_time.getMinutes(),
      arr_time.getSeconds(), arr_time.getMilliseconds());
  };

  SharingOptions.prototype.setCurrentDate = function(){
    this.arr_date = new Date();
    this.arr_time = new Date();
    this.arr_time.setMinutes((this.arr_date.getMinutes() + 15));
  };

  SharingOptions.buildFromBackendObject = function(obj){
    var sharingOptions = new SharingOptions();
    sharingOptions.notes = obj.notes;
    sharingOptions.arr_date = obj.arrival_time;
    sharingOptions.arr_time = obj.arrival_time;
    return sharingOptions;
  };

  SharingOptions.prototype.toBackendObject = function(){
    return {
      arrival_time: constructArrivalDate(),
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
      angular.extend(this, obj);
      return user;
    };

    return User;
  });

angular.module('models.rideshare', ['models.route', 'models.user'])
.factory('RideShare', function($http, Route, User){
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
    rideShare.riders = obj.riders.map(User.buildFromCachedObject(obj.owner));
    return rideShare;
  }

  RideShare.prototype.toBackendObject = function(){
    return {
      ride_share_id: this.ride_share_id,
      owner: this.owner.toBackendObject(),
      riders: this.riders.map(User.toBackendObject),
      route: this.route.toBackendObject()
    };
  };

  RideShare.buildFromBackendObject = function(obj) {
    var rideShare = new RideShare();
    rideShare.ride_share_id = obj.ride_share_id;
    rideShare.owner = User.buildFromBackendObject(obj.owner);
    rideShare.riders = obj.riders.map(User.buildFromBackendObject);
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
      this.ride_id = -1;
    }

    ShareRequest.prototype.toBackendObject = function(){
      var routeObj = this.route.toBackendObject();
      routeObj.ride_id = this.ride_id;
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
      re.ride_id = obj.ride_id;
      return re;
    };

    return ShareRequest;
  });


/**
 * Created by naomileow on 22/9/15.
 */
angular.module('vm.map', ['st.service'])
.factory('MapVM', function(displayService, placeService, Place){
    //Stores the map view, location markers and route renderers
    var view = {
      directionRenders: [],
      mapMarkers: {}
    }

    function loadMap(lat, long){
      var result = displayService.loadMap(lat, long);
      view.map = result.map;
      setPosition(result.location);
      console.log(result.location);
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

    function displayDirections(directions, showMarkers){
      //TODO: refactor this process
      displayService.displayDirections(view.directionRenders, view.map, directions, showMarkers);
    }



    function clearDirections(){
      displayService.clearDirections(view.directionRenders);
      view.directionRenders = [];
    }

    function addPositionMarker(){
      var place = view.currentPlace;
      if(view.positionMarker){
        return;
      }
      if(!place){
        var pos = view.position;
        placeService.getPlace(pos, function(place){
          view.currentPlace = place;
          displayPositionMarker(place);
        })
      }else{
        displayPositionMarker(place);
      }

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
      }
    }

    return {
      //setMap: setMap,
      getMap: getMap,
      loadMap: loadMap,
      loadMapAtLocation: loadMapAtLocation,
      loadMapAtAddress: loadMapAtAddress,
      setPosition: setPosition,
      getPosition: getPosition,
      addPositionMarker: addPositionMarker,
      removePositionMarker: removePositionMarker,
      clearDirections: clearDirections,
      displayDirections: displayDirections,
      addMarker: addMarker,
      removeMarker: removeMarker,
      clearMarkers: clearMarkers,
      clearView: clearView
    }
  });
