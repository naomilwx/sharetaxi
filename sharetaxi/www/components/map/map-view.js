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
        MapVM.clearView();
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

    console.log("controller loaded");
    $ionicHistory.clearCache();
    setupListeners();
    $scope.showResult = true;
  });
