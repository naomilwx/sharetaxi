angular.module('st.routeview',['ngCordova', 'vm.map', 'st.rideShare.service', 'models.route'])
  .controller('routeViewCtrl', function($scope, $rootScope, $localStorage, $ionicLoading, $ionicModal, $ionicHistory, MapVM, $state, $stateParams,
                                        $ionicScrollDelegate, rideService, Route){
    $scope.returnToList = function() {
      console.log("in map view:");
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
          console.log(route);
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
