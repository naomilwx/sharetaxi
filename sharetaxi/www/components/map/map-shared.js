angular.module('st.sharedmap',['ngCordova', 'vm.map', 'st.rideShare.service', 'st.user.service'])
.controller('sharedMapCtrl', function($scope, $ionicLoading, $ionicHistory, MapVM, $state, $stateParams,
                                      $ionicScrollDelegate, rideService, userService){
  $scope.returnToList = function() {
    console.log("in map view:");
    $state.go('shared');
  }
  $scope.sharedRouteName = "Going to School";

  $scope.origOption = { sharer: "Justin Yeo",
                      start_points: ["NUS", "Vivocity"],
                      end_points: ["Tampines Mall", "Pasir Ris Park"],
                      deadline: "8:30pm" };

  $scope.routeOptions = [{ sharer: "Someone Neo",
                        start_points: ["NUS", "Vivocity"],
                        end_points: ["Tampines Mall", "Pasir Ris Park"],
                        deadline: "8:30pm" },
                        { sharer: "Naomi Leow",
                        start_points: ["Ang Mo Kio"],
                        end_points: ["NTU"],
                        deadline: "8pm" },
                        { sharer: "Ding Xiangfei",
                        start_points: ["Ang Mo Kio"],
                        end_points: ["NTU"],
                        deadline: "8pm" }];

  $scope.activeOpt = $scope.origOption;

  var firstClick = true;
  $scope.tabPressed = function(opt) {
    // Set active button
    $scope.activeOpt = opt;
    if(firstClick && $scope.activeOpt !== $scope.origOption) {
      $ionicScrollDelegate.$getByHandle('tabs-scroll').scrollBy(50, 0, true);
      firstClick = false;
    }
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
      //TODO:
      if($stateParams.rideId){
        $scope.rideId = parseInt($stateParams.rideId);
        convertRideShareToDisplayModel($scope.rideId);
        rideService.getRequestsForSharedRide($scope.rideId).then(function(shareRequests){
          console.log(shareRequests);
          convertShareRequestsToDisplayModel(shareRequests);
        })
      }
      $ionicLoading.hide();
    }

    function convertRideShareToDisplayModel(rideId){
      rideService.getRideShareById(rideId).then(function(rideShare){
        var sharedRouteModel = routeToDisplayModel(rideShare.route);
        $scope.origOption = sharedRouteModel;
      })
    }
    function convertShareRequestsToDisplayModel(shareRequests){
      $scope.routeOptions = shareRequests.map(function(request){
        return routeToDisplayModel(request.route);
      })

    }

    function routeToDisplayModel(route) {
      var creator = userService.getUserWithId(route.creator_id);
      var deadline = route.sharing_options.constructArrivalDate();
      var stops = getOriginsAndDestsInOrder(route);
      return {
        sharer: creator.name,
        sharerDara: creator,
        deadline: deadline,
        start_points: stops.start_points,
        end_points: stop.end_points
      }
    }

    function getOriginsAndDestsInOrder(route){
      var stops = route.directions.getStopsInOrder();
      var dests = stops.splice(route.origins.length);
      return {
        start_points: stops,
        end_points: dests
      }
    }
    function executeLoadSequence(){
      showLoading();
      loadMap();
      loadData();
    }



    $scope.$on('$ionicView.beforeEnter', function(){
      console.log("hello");
      //actually load stuff
      $ionicHistory.clearCache();
      executeLoadSequence();
    });

});
