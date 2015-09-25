angular.module('st.listshared', ['ngTouch', 'st.rideShare.service'])
.controller('listSharedCtrl', function($scope, $state, rideService, storageService){
  $scope.sharedRoutes = [{
    route_id: 0,
    local_description: "Going to School",
    num_requests: 1,
    start_address: "NUS",
    end_address: "Vivocity",
    deadline: "8:30pm",
    sharing: "Naomi Leow and 1 other"
  }];

  $scope.openSharedMap = function(route) {
    console.log(route);
    $state.go('sharedmap', {routeId: route.route_id});
  }

  function loadRoutes(){
    rideService.loadAllRideShares().then(function(result){
      $scope.sharedRoutes = result;
      console.log(result);
    });
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });

  }

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders;
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

  $scope.$on('$ionicView.enter', function(){
     loadRoutes();
  });


  $scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
  }

})
