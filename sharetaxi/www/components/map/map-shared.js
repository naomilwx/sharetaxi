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
      console.log($stateParams)
      if($stateParams.rideId){
        $scope.rideId = parseInt($stateParams.rideId);
        rideService.getRequestsForSharedRide($scope.rideId).then(function(shareRequests){
          console.log(shareRequests);
        })
      }
      $ionicLoading.hide();
    }

    function convertShareRequestsToDisplayModel(shareRequests){
      //{ sharer: "Justin Yeo",
      //  start_points: ["NUS", "Vivocity"],
      //  end_points: ["Tampines Mall", "Pasir Ris Park"],
      //  deadline: "8:30pm" }
      //this.route = new Route();


    }

    function routeToDisplayModel(route) {
      //this.creator_id = -1;
      //this.route_id = -1;
      //this.origins = [];
      //this.destinations = [];
      //this.directions = new Directions();
      var creator = userService.getUserWithId(route.creator_id);

      return {
        sharer: creator.name,
        sharerDara: creator,

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
