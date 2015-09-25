angular.module('st.listjoined', ['ngTouch', 'st.rideShare.service'])
.controller('listJoinedCtrl', function($scope, $state, storageService, rideService){
  //$scope.joinedRoutes = [{
  //  routeId: 0,
  //  owner: "Justin Yeo",
  //  local_description: "Going to School",
  //  start_address: "NUS",
  //  end_address: "Vivocity",
  //  deadline: "8:30pm",
  //  sharing: "Naomi Leow and 1 other"
  //}];

  $scope.openJoinedMap = function(route) {
    // $state.go('mapview', {routeId: route.routeId});
  }

  function loadRoutes(){
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });
    rideService.loadAllJoinedRidesFromServer().then(function(result){
      //TODO: server error on this
      $scope.joinedRoutes = result;
    });
  }

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

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

    $scope.$on('$ionicView.enter', function(){
       loadRoutes();
    });


  $scope.leaveRoute = function(ride, index){
    //rideService.deleteRequestForRide
    //this.route = new Route();
    //this.ride_id = -1;
  }

})
