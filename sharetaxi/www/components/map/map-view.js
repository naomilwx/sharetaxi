angular.module('st.map',['ngCordova', 'ngStorage', 'vm.map', 'models.route'])
.controller('mapCtrl', function($scope, $localStorage, $cordovaGeolocation, $ionicLoading, MapVM, Route){
    var scopeRef = $scope;
    $scope.resetRoute = function(){
      scopeRef.route = new Route();
      if($localStorage.user){
        scopeRef.route.creator_id = $localStorage.user.user_id;
      }
    }


    $scope.$on('$ionicView.enter', function(){
      if($scope.notNew){
        console.log("here");
        $scope.showResult = false;
        MapVM.clearView();
        $scope.resetRoute();
        if($scope.map){
          console.log("set cached map");
          MapVM.setMap($scope.map);
          $scope.$apply();
        }else {
          console.log("reload");
          loadGoogleMap(MapVM.getPosition());
        }
      }

    });

    $scope.showResult = false;
    ionic.Platform.ready(onDeviceReady);
    $scope.loadingMessage = 'Acquiring location data...';

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
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

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
      $scope.resetRoute();
    };
  });
