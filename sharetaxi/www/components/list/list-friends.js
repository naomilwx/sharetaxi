angular.module('st.listfriends', ['ngTouch'])
.controller('listFriendsCtrl', function($scope, $state, storageService, $ionicModal){
  $scope.friendsRoutes = [{
    routeId: 0,
    owner: "Justin Yeo",
    local_description: "Going to School",
    start_address: "NUS",
    end_address: "Vivocity",
    deadline: "8:30pm",
    sharing: "Naomi Leow, Ding Xiangfei and Colin Tan"
  }];

  //Plan Route View
  $ionicModal.fromTemplateUrl('components/share-request/route-details.html', {
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });
  $scope.openPopover = function(route){
    //storageService.getRouteByLocalId(1,function(result){console.log(result)})
    console.log(route);
    $scope.rideShare = {owner: {name: route.owner}};
    $scope.popover.show();
    $scope.$broadcast(POPOVER_SHOW_EVENT);
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
  }

  $scope.$on('$ionicView.enter', function(){
    // loadRoutes();
  });


  $scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
  }

})
