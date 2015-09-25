angular.module('st.listfriends', ['ngTouch', 'models.user','models.route', 'models.rideshare', 'models.sharerequest'])
.controller('listFriendsCtrl', function($scope, $state, rideService, storageService, $localStorage, $ionicModal,
                                        User, Route, RideShare, ShareRequest){
    var testUser = new User();
    testUser.name = "Justin Yeo";
    var testRoute = new Route();
    var testRide = new RideShare();
    testRide.owner = testUser;
    testRide.ride_share_id = 0;
    testRide.route = testRoute;
    var u1 = new User();
    u1.name = "Naomi Leow";
    var u2 = new User();
    u2.name = "Ding Xiangfei";
    var u3 = new User();
    u3.name = "Colin Tan";
    testRide.riders = [u1,u2,u3];
  //  $scope.friendsRoutes = [{
  //  routeId: 0,
  //  owner: "Justin Yeo",
  //  local_description: "Going to School",
  //  start_address: "NUS",
  //  end_address: "Vivocity",
  //  deadline: "8:30pm",
  //  sharing: "Naomi Leow, Ding Xiangfei and Colin Tan"
  //}];
    $scope.friendsRoutes = [testRide];


    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders.filter(function(user){return user.user_id != $localStorage.user.user_id;});
      var num = (sharers)? sharers.length : 0;
      if(num > 0){
        var dis = sharers[0].name;
        if(num > 1){
          dis += " and " + (num - 1) + " other";
        }
        return dis;
      }else{
        return "";
      }
    }
  $scope.joinRoute = function(index) {
    var shareReq = ShareRequest.createRequestObject($scope.friendsRoutes[index], new Route());
    console.log(shareReq);
    //rideService.requestSharedRide(shareReq);

  }

  //Plan Route View
  $ionicModal.fromTemplateUrl('components/share-request/route-details.html', {
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });

  $scope.openPopover = function(index){
    //storageService.getRouteByLocalId(1,function(result){console.log(result)})
    $scope.rideShare = $scope.friendsRoutes[index];
    $scope.route = new Route();
    $scope.originalRoute = $scope.rideShare.route;

    $scope.popover.show();
  };
  $scope.closePopover = function(){
    $scope.popover.hide();
  };

  function loadRoutes(){
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });
    rideService.loadAllFriendsRides().then(function(result){
      $scope.friendsRoutes = result;
    });

  }

  $scope.$on('$ionicView.enter', function(){
     loadRoutes();
  });


  //$scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
  //}

})
