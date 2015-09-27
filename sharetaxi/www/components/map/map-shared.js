angular.module('st.sharedmap',['ngCordova', 'vm.map', 'st.rideShare.service', 'st.user.service', 'models.route'])
.controller('sharedMapCtrl', function($scope, $ionicLoading, $ionicHistory, MapVM, $state, $stateParams,
                                      $ionicScrollDelegate, rideService, userService, ngToast){
  $scope.returnToList = function() {
    console.log("in map view:");
    $state.go('shared');
  }

    $scope.showResponseBtns = false;

    //Start mock data
  //$scope.sharedRouteName = "Going to School";
  //
  //$scope.origOption = { sharer: "Justin Yeo",
  //                    start_points: ["NUS", "Vivocity"],
  //                    end_points: ["Tampines Mall", "Pasir Ris Park"],
  //                    deadline: "8:30pm" };
  //
  //$scope.routeOptions = [{ sharer: "Someone Neo",
  //                      start_points: ["NUS", "Vivocity"],
  //                      end_points: ["Tampines Mall", "Pasir Ris Park"],
  //                      deadline: "8:30pm" },
  //                      { sharer: "Naomi Leow",
  //                      start_points: ["Ang Mo Kio"],
  //                      end_points: ["NTU"],
  //                      deadline: "8pm" },
  //                      { sharer: "Ding Xiangfei",
  //                      start_points: ["Ang Mo Kio"],
  //                      end_points: ["NTU"],
  //                      deadline: "8pm" }];
    //End mock data
  $scope.shareRequests = []; //contains the data for the requests
    //$scope.rideShare contains the data for the shared route
  //$scope.activeOpt = $scope.origOption;
  $scope.activeIdx = -1;

  var firstClick = true;
  $scope.tabPressed = function(opt, index) {
    // Set active button
    $scope.activeIdx = index;
    if(firstClick && $scope.activeIdx !== -1) {
      //$ionicScrollDelegate.$getByHandle('tabs-scroll').scrollBy(50, 0, true);
      firstClick = false;
    }

    handleDisplay(opt);
  }

    $scope.deleteRequest = function() {
      if($scope.activeIdx >= 0){
        console.log("delete");
        rideService.deleteRequestForRide($scope.shareRequests[$scope.activeIdx]).then(function(result){
          if(result == true) {
            $scope.showResponseBtns = false;
            handleDeleteSuccess($scope.activeIdx);
          }else {
            ngToast.create({
              className: 'warning',
              content: 'Failed to delete request.',
              timeout: 2000
            });
          }
        });
      }
    }

    function handleDeleteSuccess(currIdx){
      $scope.shareRequests.splice(currIdx, 1);
      $scope.routeOptions.splice(currIdx, 1);
      $scope.activeIdx = -1;
      ngToast.create({
        className: 'info',
        content: 'Successfully deleted request!',
        timeout: 2000
      });
      $scope.showResponseBtns = false;
      handleDisplay($scope.origOption);
    }

    $scope.acceptRequest = function() {
      if($scope.activeIdx >= 0){
        console.log("accept");
        var shareRequest = $scope.shareRequests[$scope.activeIdx];
        shareRequest.addMergedResult($scope.routeOptions[$scope.activeIdx].mergedRoute);
        rideService.acceptRequestForRide(shareRequest).then(function(result){
          //TODO: handle display
          handleAcceptRequestSuccess(result, $scope.activeIdx);
        })
      }else {
        ngToast.create({
          className: 'warning',
          content: 'Failed to accept request.',
          timeout: 2000
        });
      }
    }

    function handleAcceptRequestSuccess(rideShare, currIdx){
      convertRideShareToDisplayModel(rideShare, currIdx);
      $scope.shareRequests.splice(currIdx, 1);
      $scope.routeOptions.splice(currIdx, 1);
      $scope.activeIdx = -1;
      displayDirectionsForRoute(rideShare.route);
      displayRouteDetails(rideShare.route);
      ngToast.create({
        className: 'info',
        content: 'Successfully accepted request!',
          timeout: 2000
      });
      $scope.showResponseBtns = false;
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
      if($stateParams.rideId > 0){
        $scope.rideId = parseInt($stateParams.rideId);
        loadRideShare($scope.rideId).then(function(rideShare){
          convertRideShareToDisplayModel(rideShare);
        });
        rideService.getRequestsForSharedRide($scope.rideId).then(function(shareRequests){
          $scope.shareRequests = shareRequests;
          convertShareRequestsToDisplayModel(shareRequests);
        })
        $ionicLoading.hide();
      }else{
        //TODO: handle redirect
        $ionicLoading.hide();
      }

    }

    function loadRideShare(rideId){
      return rideService.getRideShareById(rideId).then(function (rideShare){
        $scope.rideShare = rideShare;
        return rideShare;
      });
    }

    function convertRideShareToDisplayModel(rideShare){
      $scope.origOption = routeToDisplayModel(rideShare.route);
      $scope.sharedRouteName = rideShare.getShareDescription();
      displayDirectionsForRoute(rideShare.route);
      displayRouteDetails(rideShare.route);
    }

    function convertShareRequestsToDisplayModel(shareRequests){
      $scope.routeOptions = shareRequests.map(function(request){
        return routeToDisplayModel(request.route);
      })

    }

    function displayDirectionsForRoute(route){
      MapVM.clearDirections();
      MapVM.displayDirections(route.directions);
      MapVM.displayOrigins(route.origins);
      MapVM.displayDestinations(route.destinations);
    }

    function routeToDisplayModel(route) {
      var creator = userService.getUserWithId(route.creator_id);
      var deadline = route.sharing_options.constructArrivalDate();
      //var stops = getOriginsAndDestsInOrder(route);
      return {
        sharer: creator.name,
        sharerDara: creator,
        deadline: deadline,
        route: route
      }
    }

    function handleDisplay(displayModel) {
      var route = displayModel.route;
      var shared = $scope.rideShare.route;

      if(shared.route_id != displayModel.route.route_id) {
        if (!displayModel.mergedRoute) {
          var merged = shared.createMergedRoute(route);
          displayModel.mergedRoute = merged;
          merged.calculateDirections(function(results, status){
            displayRouteDetails(merged);
            $scope.showResponseBtns = true;
          })
        }else{
          displayRouteDetails(displayModel.mergedRoute);
          $scope.showResponseBtns = true;
        }
        displayDirectionsForRoute(displayModel.mergedRoute);
      }else{
        $scope.showResponseBtns = false;
        displayRouteDetails(shared);
        displayDirectionsForRoute(shared);
      }
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

    //function getOriginsAndDestsInOrder(route){
    //  var stops = route.directions.getStopsInOrder();
    //  var dests = stops.splice(route.origins.length);
    //  return {
    //    start_points: stops,
    //    end_points: dests
    //  }
    //}
    function executeLoadSequence(){
      showLoading();
      GoogleMapsLoader.load(function(google){loadMap()});
      loadData();
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


    $scope.$on('$ionicView.beforeEnter', function(){
      console.log("hello");
      //actually load stuff
      $ionicHistory.clearCache();
      executeLoadSequence();
    });

});
