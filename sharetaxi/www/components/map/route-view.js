angular.module('st.routeview',['ngCordova', 'vm.map', 'st.rideShare.service', 'st.user.service', 'models.route'])
  .controller('routeViewCtrl', function($scope, $ionicLoading, $ionicHistory, MapVM, $state, $stateParams,
                                        $ionicScrollDelegate, rideService, userService, Route){
    $scope.returnToList = function() {
      console.log("in map view:");
      $state.go('routeview');
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
        $scope.routeId = $stateParams.routeId;
        rideService.getRouteForSharedRide($scope.rideId, $scope.routeId).then(function(route){
          console.log(route);
          $scope.route = route;
          displayDirectionsForRoute(route);
          displayRouteDetails(route);
        });

        $ionicLoading.hide();
      }else{
        //TODO: handle redirect
        $ionicLoading.hide();
      }

    }





    function displayDirectionsForRoute(route){
      MapVM.displayDirections(route.directions, true);
    }


    function displayRouteDetails(route) {
      if(route.directions.isEmpty()){
        route.calculateDirections(function(results, status){
          setAndDisplayDirectionResult(results);
        })
      }else{
        console.log("not empty");
        console.log(route.directions);
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
      $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, result);
      $scope.showDirectionsResult();
    }


    $scope.$on('$ionicView.beforeEnter', function(){
      //actually load stuff
      $ionicHistory.clearCache();
      executeLoadSequence();
    });
    $scope.showResult= true;
  });
