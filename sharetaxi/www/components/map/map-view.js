angular.module('st.map',['ngCordova', 'ngStorage', 'vm.map', 'models.route', 'st.storage', 'st.service'])
.controller('mapCtrl', function($scope, $localStorage, $cordovaGeolocation, $ionicLoading, MapVM, Route, $stateParams, displayService, storageService){
    var scopeRef = $scope;
    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }
    function checkandSetState(){
      if($stateParams.routeId){
        $scope.editMode = true;
        $scope.loadingMessage = 'Acquiring route data...';
        loadRoute();
        $scope.showResult = true;
      }else{
        setNewRoute();
        $scope.editMode = false;
        $scope.loadingMessage = 'Acquiring location data...';
        $scope.showResult = false;
      }
    }
    function loadRoute(){
      $scope.route = new Route();
      showLoading();
      var id = parseInt($stateParams.routeId);
      console.log(id);
      storageService.getRouteByLocalId(id, function(route){
        $scope.route = route;
        //displayService.loadMapAtAddress(route.directions.getStartAddress(), function(map){
        //  MapVM.setMap(map);
        //  console.log(map);
        //  console.log("here address");
        //});

        console.log(route.directions);
        //MapVM.displayDirections(route.directions);
        $ionicLoading.hide();
        $scope.oldRoute = Route.clone(route);
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


    $scope.$on('$ionicView.enter', function(){
      checkandSetState();
      if($scope.editMode == false && $scope.notNew){
        MapVM.clearView();
        if(!$scope.map){
          loadGoogleMap(MapVM.getPosition());
        }
      }
    });



    function loadGoogleMap(position){
      var lat;
      var long;
      if(position == null){
        console.log("null");
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
        MapVM.addPositionMarker();
        $scope.map = MapVM.getMap();
        $ionicLoading.hide();
      }

      $scope.$on('$destroy', function() {
        console.log('destroy map view');
        $scope.map = null;
      });

      $scope.$on('$ionicView.leave', function(){
        $scope.notNew = true;
      });

      if(navigator.onLine){
        GoogleMapsLoader.load(loadMap);
      }else{
        $ionicLoading.hide();
      }

    }
    /*
    * Function to load initial view when site is first loaded
    * */
    function onDeviceReady() {
      showLoading();
      $scope.$on(SHOW_DIRECTIONS_RESULT, function(event, result){
        $scope.showDirectionsResult();
        $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, result);
      });

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

    //Load view
    checkandSetState();
    ionic.Platform.ready(onDeviceReady);
    console.log("controller loaded");
  });
