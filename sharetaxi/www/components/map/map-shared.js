angular.module('st.sharedmap',['ngCordova', 'vm.map'])
.controller('sharedMapCtrl', function($scope, $cordovaGeolocation, $ionicLoading, MapVM, $state, $stateParams, $ionicScrollDelegate){
  $scope.returnToList = function() {
    console.log("in map view:");
    console.log($stateParams.currRoute); // Doesn't seem to be working. Use routeId?
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
      console.log("heremap");
      MapVM.loadMapForElement("shared-route-map", lat, long);
    }

    function loadData() {
      //TODO:
      if($stateParams.routeId){
        $scope.sharedId = parseInt($stateParams.routeId);
      }
      $ionicLoading.hide();
    }

    function executeLoadSequence(){
      showLoading()
      loadMap();
      loadData();
    }

    //actually load stuff
    executeLoadSequence();

});
