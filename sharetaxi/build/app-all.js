// App entrance
angular.module('sharetaxi', ['ionic', 'st.map', 'st.selector', 'st.toolbar', 'st.results', 'ngOpenFB', 'st.user.service', 'ngStorage', 'st.routeDetails'])
  .constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
  .constant('fbAppId', '1919268798299218')
  .constant('backendPort', 8000)
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';


    $stateProvider
      .state('mapview',{
        url: '/',
        templateUrl: 'components/map/map-view.html',
        controller: 'mapCtrl'
      })
      .state('routeview', {
        url: '/route/:routeId'
      })
      .state('saved', {
        url: '^/saved',
        templateUrl: 'components/list/list-saved.html'
      })
      .state('shared', {
        url: '^/shared',
        templateUrl: 'components/list/list-shared.html'
      })
      .state('friends', {
        url: '^/friends',
        templateUrl: 'components/list/list-friends.html'
      })
      .state('joined', {
        url: '^/joined',
        templateUrl: 'components/list/list-joined.html'
      })
      .state('test',{
        url:'/test',
        templateUrl: 'components/share-request/route-details.html',
        controller: 'routeDetails'
      })
    $urlRouterProvider.otherwise('/');
  }])
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
}).controller('mainCtrl', ['googleApiKey', '$scope', '$ionicSideMenuDelegate', 'userService', '$localStorage',
              function(googleApiKey, $scope, $ionicSideMenuDelegate, userService, $localStorage){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.login = function(){
      userService.fbLogin().then(function(result){
        if(result === true){
          $scope.isLoggedIn = true;
        }
      });
  };
  $scope.logout = function(){
    userService.logout().then(function(result){
      if(result.data.success == true){
        $scope.isLoggedIn = false;
        $localStorage.$reset();
      }
    });
  };

  if(navigator.onLine){
    userService.getServerLoginStatus().then(function(result){
      if(result.data.loggedIn == true){
        userService.getFbLoginStatus().then(function(result){
          console.log(result);
          if(result.status === 'connected'){
            $scope.isLoggedIn = true;
          }else{
            $scope.isLoggedIn = false;
          }
        });
      }else{
        console.log(result.data);
        $scope.isLoggedIn = false;
      }
    });
  }


}]);


SHORTEST_ROUTE_KEY = "short";
FASTEST_ROUTE_KEY = "fast";
AVOID_ERP_KEY = "erp";

SHOW_DIRECTIONS_RESULT = "show directions result in map";
HIDE_DIRECTIONS_RESULT = "hide directions result in map";

POPOVER_SHOW_EVENT = "showpopover";
SHARE_POPOVER_SHOW_EVENT = 'showsharepopover';

RESULT_POPOVER_SHOW_EVENT = "show distance result";
SET_GOOGLE_AUTOCOMPLETE = "set google autocomplete";

angular.module('st.service', [])
.factory('directionsService', function(){
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
      var coord = place.geometry.location;
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
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;

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
        var results = {};
        if(status != google.maps.DistanceMatrixStatus.OK){
          cb(null, status);
        }
        var dPoints = d.filter(function(pt){
          return pt != endPoints.end;
        });
        var sPoints;
        var count = 2;
        function handleGoogleReturn(order){
          return function(response, status){
            if(status == google.maps.DirectionsStatus.OK){
              results[order] = response;
              --count;
              if(count == 0){
                cb(results, status);
              }
            }else{
              cb(null, status);
            }

          }
        }

        sPoints = o.filter(function(pt){
          return (pt != endPoints.start) && (pt!= endPoints.lastStart);
        });
        if(sPoints.length > 1){
          getGoogleDirections(endPoints.start, endPoints.lastStart, sPoints, true, avoidErp, handleGoogleReturn(0));
          getGoogleDirections(endPoints.lastStart, endPoints.end, dPoints, true, avoidErp, handleGoogleReturn(1));
        }else{
          count = 1;
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
    function displayDirections(renderers, map, results){
      for(var i in results){
        var renderer = new google.maps.DirectionsRenderer({
            map: map
          });
        renderer.setDirections(results[i]);
        renderers.push(renderer);
      }
    }

    function clearDirections(renderers){
      for(var i = 0; i < renderers.length; i++){
        renderers[i].setMap(null);
      }
    }

    function addMarker(place, map){
      if(place.geometry){
        var marker = new google.maps.Marker({
          position: place.geometry.location,
          title: place.name,
          map: map
        });
        place.mapMarker = marker;
      }
    }

    function clearMarkers(places){
      for(var idx in places){
        places[idx].mapMarker.setMap(null);
      }
    }

    return {
      displayDirections: displayDirections,
      clearDirections: clearDirections,
      addMarker: addMarker,
      clearMarkers: clearMarkers
    }
  })
  .factory('placeService', function(){
    var geocoder;
    function loadGeocoder(google){
      geocoder = new google.maps.Geocoder;
    }
    GoogleMapsLoader.load(loadGeocoder);
    function setPlaceDetails(place, cb){
      if(!place.geometry){
        geocoder.geocode({address: place.name}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK) {
            place.place_id = results[0].place_id;
            place.geometry = results[0].geometry;
            place.formatted_address = results[0].formatted_address;
            cb(place);
          }
        });
      }else{
        cb(place);
      }
    }
    return {
      geocoder: geocoder,
      setPlaceDetails: setPlaceDetails
    }
  });

/**
 * Created by naomileow on 18/9/15.
 */
angular.module('st.user.service', ['ngOpenFB', 'models.user'])
.factory('userService', function($http, $location, ngFB, backendPort, User){
    var userData = new User();

    function doBackendLogin(response){
      userData.access_token = response.authResponse.accessToken;
      getUserDataFromFacebook().then(loginToBackend);
    }

    function loginToBackend(){
      //post to /facebook/token
      var loginUrl = "http://" + $location.host() + ":" + backendPort + "/facebook/token";
      $http({
        method: 'POST',
        url: loginUrl,
        withCredentials: true,
        data: {
              token: userData.access_token
              }
      }).then(function(response){
        console.log(response);
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
              doBackendLogin(response);
              return true;
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

angular.module('st.map',['ngCordova'])
.controller('mapCtrl', function($scope, $cordovaGeolocation, $ionicLoading){
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
          //var marker = new google.maps.Marker({
          //  position: myLatLng,
          //  map: map,
          //});

          $scope.map = map;
          //$scope.marker = marker;
          $scope.latLng = myLatLng;
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

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options', 'models.route', 'monospaced.elastic', 'models.sharingoptions'])
  .controller('planRouteForm',
  function($scope, $ionicPopup, directionsService, displayService, Route){

    var isSetup = false;
    $scope.route = new Route();
    $scope.directionRenders = [];

    $scope.autocompleteElements = {
      start: 'start-place',
      end: 'end-place'
    };

    $scope.rootElementId = "location-selection-modal";

    $scope.submitSelections = function(){
      if(checkLocationInputs()){
        displayService.clearDirections($scope.directionRenders);
        $scope.directionRenders = [];

        $scope.route.calculateDirections(function(results, status){
          if(status == google.maps.DirectionsStatus.OK){

            displayService.displayDirections($scope.directionRenders, $scope.map, results);

            $scope.$emit(SHOW_DIRECTIONS_RESULT, results);
          }
        });

        $scope.closePopover();
      }

    };

    function checkLocationInputs(){
      var alright = true;
      var message = "";
      if(!$scope.route.hasOrigins()){
        alright = false;
        message += "Starting Points must not be empty \n";
      }
      if(!$scope.route.hasDestinations()){
        alright = false;
        message += "Destinations must not be empty \n"
      }
      if(!alright){
        $scope.showAlert(message);
      }
      return alright;
    }

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
  .controller('shareRouteForm', function($scope, displayService, Route, SharingOptions){
    $scope.autocompleteElements = {
      start: 'share-start',
      end: 'share-end'
    };
    $scope.rootElementId = "location-share-modal";

    var isSetup = false;

    $scope.route = new Route();
    $scope.directionRenders = [];
    $scope.sharingOptions = new SharingOptions();

    $scope.submitSelections = function(){
      displayService.clearDirections($scope.directionRenders);
      $scope.directionRenders = [];

      $scope.route.calculateDirections(function(results, status){
        if(status == google.maps.DirectionsStatus.OK){
          displayService.displayDirections($scope.directionRenders, $scope.map, results);
          shareRequest(results);
        }
      });
      $scope.closeSharePopover();
    };

    function shareRequest(dirResult){
      //TODO: save data
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
.controller('locationSelectorController', function($scope, placeService, displayService){
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
      if(itemId == start){
        $scope.route.addOrigin(place);
      }else if(itemId == end){
        $scope.route.addDestination(place);
      }
      clearTextField(itemId);
      placeService.setPlaceDetails(place, function(place){
        displayService.addMarker(place, $scope.map);
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
      loc.mapMarker.setMap(null);
      loc.mapMarker = null;
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

angular.module('st.toolbar', ['st.selector'])
.directive('shareTaxiToolbar', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/toolbar/map-toolbar.html',
      controller: "toolbarController"
    }
  })
.controller('toolbarController', function($scope, $ionicModal){

    $ionicModal.fromTemplateUrl('components/location-selector/plan-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.popover = popover;
    });
    $scope.openPopover = function(){
      $scope.popover.show();
      $scope.$broadcast(POPOVER_SHOW_EVENT);
    };
    $scope.closePopover = function(){
      $scope.popover.hide();
    };


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

    $scope.$on('$destroy', function() {
      $scope.dropdown.remove();
      $scope.popover.remove();
      $scope.sharePopover.remove();
    });
  })
;

var routeOptions = [
  [FASTEST_ROUTE_KEY, "Fastest route"],
  [SHORTEST_ROUTE_KEY,  "Shortest route"],
  [AVOID_ERP_KEY, "Cheapest route (Avoiding ERP)"]
];



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
  })

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


    function getTotalDistance(directions){
      var total = 0;
      for(var i in directions){
        var route = directions[i].routes[0].legs;
        for(var l in route){
          total += route[l].distance.value;
        }
      }
      return total;
    }

    function getTotalDuration(directions){
      var total = 0;
      for(var i in directions){
        var route = directions[i].routes[0].legs;
        for(var l in route){
          total += route[l].duration.value;
        }
      }

      return total;
    }

    function combineLegs(directions){
      var allLegs = []
      for(var i in directions){
        var route = directions[i].routes[0].legs;
        allLegs.push.apply(allLegs, route);
      }
      return allLegs;
    }

    function updateDisplay(){
      $scope.travel_time = getTotalDuration($scope.directions);
      $scope.travel_time_formatted = formatTime($scope.travel_time);
      $scope.legs = combineLegs($scope.directions);
    }

    function formatTime(totalSecs){
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
  });

angular.module('st.routeDirections', [])
  .factory('directionsMock', function(){
    return {
      directions: {
        "geocoded_waypoints" : [
          {
            "geocoder_status" : "OK",
            "partial_match" : true,
            "place_id" : "ChIJ2QJCeFYa2jERa434wdYIjUg",
            "types" : [ "university", "point_of_interest", "establishment" ]
          },
          {
            "geocoder_status" : "OK",
            "place_id" : "ChIJb_EWhHoW2jERjnZZ_OKYEtk",
            "types" : [ "route" ]
          }
        ],
        "routes" : [
          {
            "bounds" : {
              "northeast" : {
                "lat" : 1.3936208,
                "lng" : 103.8789678
              },
              "southwest" : {
                "lat" : 1.2775255,
                "lng" : 103.7828593
              }
            },
            "copyrights" : "Map data ©2015 Google, Urban Redevelopment Authority",
            "legs" : [
              {
                "distance" : {
                  "text" : "24.3 km",
                  "value" : 24291
                },
                "duration" : {
                  "text" : "27 mins",
                  "value" : 1590
                },
                "end_address" : "Fernvale Link, Singapore",
                "end_location" : {
                  "lat" : 1.3936208,
                  "lng" : 103.8789678
                },
                "start_address" : "21 Lower Kent Ridge Rd, National University of Singapore, Singapore 119077",
                "start_location" : {
                  "lat" : 1.293515,
                  "lng" : 103.7850164
                },
                "steps" : [
                  {
                    "distance" : {
                      "text" : "0.4 km",
                      "value" : 438
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 67
                    },
                    "end_location" : {
                      "lat" : 1.2967792,
                      "lng" : 103.7829959
                    },
                    "html_instructions" : "Head \u003cb\u003enorth\u003c/b\u003e on \u003cb\u003eLower Kent Ridge Rd\u003c/b\u003e",
                    "polyline" : {
                      "points" : "os{FkomxRIBC@OBU@I?Y@O@O@c@LULgBfA}A`A[LUHe@Ti@VSLKHa@XUVMPOP[f@"
                    },
                    "start_location" : {
                      "lat" : 1.293515,
                      "lng" : 103.7850164
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.5 km",
                      "value" : 524
                    },
                    "duration" : {
                      "text" : "2 mins",
                      "value" : 92
                    },
                    "end_location" : {
                      "lat" : 1.2933528,
                      "lng" : 103.7852333
                    },
                    "html_instructions" : "At the roundabout, take the \u003cb\u003e2nd\u003c/b\u003e exit and stay on \u003cb\u003eLower Kent Ridge Rd\u003c/b\u003e",
                    "maneuver" : "roundabout-left",
                    "polyline" : {
                      "points" : "{g|FwbmxR?@@??@?@?@?@?@?@?@?@A??@?@A??@A??@A?A??@A?A?A?A?A?A?A?AAA??AA??AA??AA??A?AA??A?A?A?A?A?A@??A?A@??A@??A@??A@?@??Af@m@`@g@VUHGJIPMtCwA|DcC\\SPGHCLALAD?XAZ?JC@?JCVGNIPM"
                    },
                    "start_location" : {
                      "lat" : 1.2967792,
                      "lng" : 103.7829959
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "39 m",
                      "value" : 39
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 11
                    },
                    "end_location" : {
                      "lat" : 1.2936049,
                      "lng" : 103.7854737
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003eSouth Buona Vista Rd\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "mr{FupmxR[YUU"
                    },
                    "start_location" : {
                      "lat" : 1.2933528,
                      "lng" : 103.7852333
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.2 km",
                      "value" : 153
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 14
                    },
                    "end_location" : {
                      "lat" : 1.2948972,
                      "lng" : 103.7858556
                    },
                    "html_instructions" : "Keep \u003cb\u003eright\u003c/b\u003e to continue on \u003cb\u003eBuona Vista Flyover\u003c/b\u003e",
                    "maneuver" : "keep-right",
                    "polyline" : {
                      "points" : "_t{FermxRQKMIMIOIWGMCc@GQCWCc@CG?SAQA"
                    },
                    "start_location" : {
                      "lat" : 1.2936049,
                      "lng" : 103.7854737
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "60 m",
                      "value" : 60
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 27
                    },
                    "end_location" : {
                      "lat" : 1.295361,
                      "lng" : 103.7860866
                    },
                    "html_instructions" : "Slight \u003cb\u003eright\u003c/b\u003e toward \u003cb\u003eAYE\u003c/b\u003e",
                    "maneuver" : "turn-slight-right",
                    "polyline" : {
                      "points" : "c|{FstmxRAACAA?IAOCMCKAIEGCCEIM"
                    },
                    "start_location" : {
                      "lat" : 1.2948972,
                      "lng" : 103.7858556
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "4.7 km",
                      "value" : 4687
                    },
                    "duration" : {
                      "text" : "4 mins",
                      "value" : 257
                    },
                    "end_location" : {
                      "lat" : 1.2789443,
                      "lng" : 103.8230134
                    },
                    "html_instructions" : "Turn \u003cb\u003eright\u003c/b\u003e to merge onto \u003cb\u003eAYE\u003c/b\u003e toward \u003cb\u003eKeppel Road\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003ePartial toll road\u003c/div\u003e",
                    "polyline" : {
                      "points" : "__|FavmxRB_@ZGj@KrC]REHEFCNIbEaEb@Q|@wAhHmMb@w@zA{Cd@w@P[fBeCf@o@HMFGHKhAyAt@gAf@{@z@}AxD_I^s@n@mAb@w@fAeB`BsChCgEd@}@^q@Z{@ZaAVsAJk@Ho@?E?A?ABm@?C@URoGXaRZyLRuHVcFT{BXsBl@sDf@}AfAaDjA{BjDsGpCcF@A?ATc@@Ap@wAl@kA|@gBfAwCZ}BBSJoAD}@J_G@_@B]"
                    },
                    "start_location" : {
                      "lat" : 1.295361,
                      "lng" : 103.7860866
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "9.1 km",
                      "value" : 9110
                    },
                    "duration" : {
                      "text" : "8 mins",
                      "value" : 466
                    },
                    "end_location" : {
                      "lat" : 1.3353521,
                      "lng" : 103.862084
                    },
                    "html_instructions" : "Keep \u003cb\u003eright\u003c/b\u003e at the fork to continue on \u003cb\u003eCTE\u003c/b\u003e, follow signs for \u003cb\u003eAng Mo Kio\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003ePartial toll road\u003c/div\u003e",
                    "maneuver" : "fork-right",
                    "polyline" : {
                      "points" : "kxxFy|txRBUJq@H[FY@IFS@G@A?CJi@HUFQPc@v@cBh@cARc@Zo@No@?ADWHg@BM?ABy@?W?OEi@Gk@Ok@Qi@Wg@W_@W[c@_@WSkBgAQKCCA?KIECCAi@]SQiA{@y@s@u@w@}@cAq@_Ag@}@aAiB_@w@GOEIAGKWiBuF_@kAg@kBGQEOEQ[iA[aASu@Qc@EG?AKSCEACOYCGEKYa@[_@_@[y@k@mAs@kAm@i@Ye@Yc@_@UU[]AACCAAMQS[EIQ]yCoGEKMUIMGKKOGKS[CCAACCm@{@KOMM?ASUQOQMsAk@KEUKg@Ug@U]S_@QqAy@q@c@EEECGEIE}C_BuB{@_A_@gA_@yB{@YKGC[ISCSC_AKe@?k@?gA@}DX_BLmAH_AFsCRoA@c@@wBBO?iABeCDY@G?E@A?mALm@J_@Lc@PA?IDC@GBMFEBEBGDGDKHg@l@ABq@p@MLaAlAs@z@q@|@iAvAo@n@]Ze@Z_@ROFa@RYL_@L]HWDm@Fw@Fy@Bo@Ac@A[Co@IIAu@S{@SSGaD_CGKIKs@cAaBoCiCqCgAkAy@w@k@o@SQa@YWUCACAQKA?AAGCGECAAAKCEAA?UIm@MoF}@yB]s@K}Ai@IEC?k@SCACAuAe@{@[c@WCA_@Sa@YcAw@IIKI[W]YuA{AcBiCcAyB}CmIuB_HaB{EYo@Qc@IQ?AACEIAAKQ?AAAAC?AA?IOAAS_@{BgEwAsBW[{AaBcDqC}@{@uDeDi@g@o@q@gMwMY[i@i@w@u@aAw@oAo@{@[y@Ys@Sw@Sk@Ic@KA?{@Gs@C]Ie@Cc@?Y?C?I?C?I?M?c@@E?S?C?Y@sA?}DBkCFi@@cAD_@@K?kBBgDF{@@"
                    },
                    "start_location" : {
                      "lat" : 1.2789443,
                      "lng" : 103.8230134
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.5 km",
                      "value" : 490
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 22
                    },
                    "end_location" : {
                      "lat" : 1.3397117,
                      "lng" : 103.861609
                    },
                    "html_instructions" : "Take the exit on the \u003cb\u003eright\u003c/b\u003e toward \u003cb\u003eCTE\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003eToll road\u003c/div\u003e",
                    "maneuver" : "ramp-right",
                    "polyline" : {
                      "points" : "}xcG_q|xRcD?sBBaCD}ADqBLK@c@DG@SB}@Pe@Hw@NUD"
                    },
                    "start_location" : {
                      "lat" : 1.3353521,
                      "lng" : 103.862084
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "5.6 km",
                      "value" : 5625
                    },
                    "duration" : {
                      "text" : "4 mins",
                      "value" : 269
                    },
                    "end_location" : {
                      "lat" : 1.3883618,
                      "lng" : 103.8581016
                    },
                    "html_instructions" : "Continue onto \u003cb\u003eCTE\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003ePartial toll road\u003c/div\u003e",
                    "polyline" : {
                      "points" : "etdGan|xRwBh@oHfBaFlAk@NKB?@KBA?G@ODKBA@E@IBoBd@A@KDyD~@gJ|BsAd@}@NeZ|HqAReDh@mAJwBFcDBC?cA?A?C?CAC?I?A?I?C?MAWAm@E{AMsBSoEaAw@OuHmByT{FmAUUE_EaAkCo@gD}@yDaAa@K]Gk@G]EUEOAa@Es@EuAGE?]@C?[@C?C?U@[B[Bg@Fa@Hy@Lq@P_D`AcMnEgBd@cAZwFhA_AJSBE@K@SBC@[BSBqDVkAH_ABgA@eA@oA?sBCaAA}LMmBC}AAU@qIJ_C@yIJcBB"
                    },
                    "start_location" : {
                      "lat" : 1.3397117,
                      "lng" : 103.861609
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.3 km",
                      "value" : 308
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 39
                    },
                    "end_location" : {
                      "lat" : 1.3910231,
                      "lng" : 103.8580595
                    },
                    "html_instructions" : "Take exit \u003cb\u003e15\u003c/b\u003e for \u003cb\u003eYio Chu Kang Rd\u003c/b\u003e",
                    "maneuver" : "ramp-left",
                    "polyline" : {
                      "points" : "gdnGcx{xR[LGBi@D_BNy@FsBPu@AUESCUEKEGCa@UCACCA?AA"
                    },
                    "start_location" : {
                      "lat" : 1.3883618,
                      "lng" : 103.8581016
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "1.2 km",
                      "value" : 1203
                    },
                    "duration" : {
                      "text" : "2 mins",
                      "value" : 106
                    },
                    "end_location" : {
                      "lat" : 1.3884572,
                      "lng" : 103.8683134
                    },
                    "html_instructions" : "Turn \u003cb\u003eright\u003c/b\u003e onto \u003cb\u003eYio Chu Kang Rd\u003c/b\u003e",
                    "maneuver" : "turn-right",
                    "polyline" : {
                      "points" : "{tnG{w{xRi@A@I@I@E?Ah@oDd@qC`@}BBIBYfBiK\\}At@sDpAmHX{AN{@dAcGP}@Hc@Nw@"
                    },
                    "start_location" : {
                      "lat" : 1.3910231,
                      "lng" : 103.8580595
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "23 m",
                      "value" : 23
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 2
                    },
                    "end_location" : {
                      "lat" : 1.3885724,
                      "lng" : 103.8684883
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e toward \u003cb\u003eSengkang W Rd\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "{dnG}w}xRIKCEGQ"
                    },
                    "start_location" : {
                      "lat" : 1.3884572,
                      "lng" : 103.8683134
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.3 km",
                      "value" : 313
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 38
                    },
                    "end_location" : {
                      "lat" : 1.391263,
                      "lng" : 103.8690676
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003eSengkang W Rd\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "qenGay}xROWCCCAIC_@I[GICa@M[Cq@GA?qCOu@Gk@AkAG"
                    },
                    "start_location" : {
                      "lat" : 1.3885724,
                      "lng" : 103.8684883
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "1.1 km",
                      "value" : 1126
                    },
                    "duration" : {
                      "text" : "3 mins",
                      "value" : 158
                    },
                    "end_location" : {
                      "lat" : 1.3919294,
                      "lng" : 103.8788555
                    },
                    "html_instructions" : "Turn \u003cb\u003eright\u003c/b\u003e onto \u003cb\u003eSengkang West Ave\u003c/b\u003e",
                    "maneuver" : "turn-right",
                    "polyline" : {
                      "points" : "kvnGu|}xRSA@[DqA@s@JwBBa@LcCBUDw@B{@N}CNkDVsFDsABu@@WCSAOE[E[Mk@qAiE{@qCK[Sq@]gA"
                    },
                    "start_location" : {
                      "lat" : 1.391263,
                      "lng" : 103.8690676
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.2 km",
                      "value" : 192
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 22
                    },
                    "end_location" : {
                      "lat" : 1.3936208,
                      "lng" : 103.8789678
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003eFernvale Link\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "qznG{y_yRKCCACCAACAIEYD[Ba@B[?UAcDM"
                    },
                    "start_location" : {
                      "lat" : 1.3919294,
                      "lng" : 103.8788555
                    },
                    "travel_mode" : "DRIVING"
                  }
                ],
                "via_waypoint" : []
              }
            ],
            "overview_polyline" : {
              "points" : "os{FkomxRMDe@DcADc@LULeEhCaCdA_@Vw@p@]b@[h@@@?B?DABGFK@IECKBIpA}A~@u@tCwA|DcCn@[j@GbAEb@K`@Wq@o@_@U]Se@Ku@K{@Go@E_@GYEQIMSB_@ZG~Di@\\KVMbEaEb@Q|@wAhHmM~BsEv@sAnCuDdB{B|AcCz@}AxD_InAaCb@w@hDyFhCgEd@}@^q@Z{@ZaAVsAT{A?EBu@TeHXaRZyLRuHVcFn@oFl@sDf@}AfAaDjA{B|HwN@CVe@~AcD|@gBfAwC^qCPmCL_HFs@^qBJa@T_AXu@pC{FNq@N_ABOBqAEy@Gk@Ok@i@qAo@{@{@s@}BsAWQm@_@}AmAoBkB}@cAq@_AiBgDg@gA}B_HuAyEqAsEc@aAYk@_@m@{@{@y@k@mAs@uBgAiAy@q@s@GGy@uAwD_Io@cAqAeBe@e@eBy@qB}@}@e@cC}A]U}C_BuB{@gC_A{CkAo@MsAOqA?gA@}DXmDVsEZ{FFiFJ}ANmAXe@Pc@R[Rs@v@s@t@uDtEyBfCcAv@kB|@}@VeALqBJsACkAM_AUoA[iDkC}@oAaBoCiCqCaCcC_AaAaAs@i@YUGcAWiJ{As@K}Ai@MEiC}@{@[c@Wc@U{BeBy@q@uA{AcBiCcAyB}CmIuB_HaB{Ek@sAISUa@Q[oCgFoBoC{AaBcDqCsFaF{PmQaB_BaAw@oAo@uBu@kBg@oAU}@Gs@C]IiACg@?wBBqGBuDH{EJcFHwGB_FJ}BNk@FqAT}AXmCn@iQhEMDu@RwHlBgJ|BsAd@}@NeZ|HwF|@mAJwBFgDBeA?GAO?}DWsBSoEaAw@OuHmByT{FmAUuEgAoO{D}B[q@GiCMg@@y@Bw@FiAPkB^_D`AcMnEkD`AwFhA_AJYD_@DeF`@kCLmCBcUSkEEgJLyMLcBB[Lq@HyCVsBPu@Ai@Ia@Ki@YKGi@A@IBOh@qDnAsHfBiK\\}AfCaN`CyMX{AMQWi@GEoAYa@M[Cs@G_Ia@SA@[FeCNyCPyCh@}Lb@uKQ{A_BuFgAmDq@yBOESMu@H}@ByDO"
            },
            "summary" : "CTE",
            "warnings" : [],
            "waypoint_order" : []
          }
        ],
        "status" : "OK"
      }
    }
  })
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

angular.module('models.route', ['models.place', 'st.service'])
.factory('Route', function($http, Place, SharingOptions, directionsService){
  function Route(){
    this.route_id = -1;
    this.origins = [];
    this.destinations = [];
    this.directions = {};
    this.route_type = FASTEST_ROUTE_KEY;
  }

  Route.prototype.save = function($http){
    //POST to backend
  };

  Route.prototype.loadFromBackend = function(route_id){

  }

  Route.buildFromBackendObject = function(obj){
    var route = new Route();
    route.route_id = obj.route_id;
    route.origins = obj.origins.map(Place.buildFromBackendObject);
    route.destinations = obj.destinations.map(Place.buildFromBackendObject);
    route.directions = obj.directions;
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
      origins: this.origins.map(Place.createBackendObject),
      destinations: this.origins.map(Place.createBackendObject),
      google_directions: this.directions,
      share_details: this.sharing_options.toBackendObject()
    }
  };

  return Route;
});

angular.module('models.place', [])
.factory('Place', function($http){
  function Place(placeData){
    angular.extend(this, placeData);
  }

  Place.prototype.toBackendObject = function(){
    return {
      name: this.name,
      google_place_id: this.place_id,
      foramtted_address: this.formatted_address,
      longtitude: this.geometry.location.H,
      latitude: this.geometry.location.L
    }
  };

    Place.buildFromBackendObject = function(obj){
      var place = new Place();
      place.name = obj.name;
      place.place_id = obj.google_place_id;
      place.foramtted_address = obj.foramtted_address;
      place.longtitude = obj.longtitude;
      place.latitude = obj.latitude;
      return place;
    };

  Place.createBackendObject = function(placeData){
    return {
      name: placeData.name,
      google_place_id: placeData.place_id,
      foramtted_address: placeData.formatted_address,
      longtitude: placeData.geometry.location.H,
      latitude: placeData.geometry.location.L
    }
  };

  return Place;
});

angular.module('models.sharingoptions', [])
.factory('SharingOptions', function(){
  function SharingOptions(){
    this.notes = "";
    this.setCurrentDate();
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
    this.owner = new User();
    this.riders = [];
    this.route = new Route();
  }

  RideShare.prototype.getNumberOfRiders = function(){
    return this.riders.length;
  }
  RideShare.prototype.toBackendObject = function(){
    return {
      owner: this.owner.toBackendObject(),
      riders: this.riders.map(User.toBackendObject),
      route: this.route.toBackendObject()
    };
  };

  RideShare.buildFromBackendObject = function(obj) {
    var rideShare = new RideShare();
    rideShare.owner = User.buildFromBackendObject(obj.owner);
    rideShare.riders = obj.riders.map(User.buildFromBackendObject);
    rideShare.route = Route.buildFromBackendObject(obj.route);
    return rideShare;
  };

  return RideShare;
});

angular.module('models.routeextend', ['models.route', 'st.service'])
  .factory('RouteExtend', function(Route){
    function RouteExtend(){
      this.route = new Route;
      this.original_route_id = -1;
    }

    RouteExtend.prototype.toBackendObject = function(){
      var routeObj = this.route.toBackendObject();
      routeObj.original_route_id = this.original_route_id;
      return routeObj;
    };

    RouteExtend.buildFromBackendObject = function(obj){
      var re = new RouteExtend();
      re.route = Route.buildFromBackendObject(obj);
      re.original_route_id = obj.original_route_id;
      return re;
    };

    return RouteExtend;
  });

