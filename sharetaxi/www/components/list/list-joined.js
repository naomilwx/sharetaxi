angular.module('st.listjoined', ['ngTouch', 'st.rideShare.service'])
.controller('listJoinedCtrl', function($scope, $state, storageService, rideService, $ionicLoading){
  //$scope.joinedRoutes = [{
  //  routeId: 0,
  //  owner: "Justin Yeo",
  //  local_description: "Going to School",
  //  start_address: "NUS",
  //  end_address: "Vivocity",
  //  deadline: "8:30pm",
  //  sharing: "Naomi Leow and 1 other"
  //}];

  $scope.openJoinedMap = function(ride) {
     $state.go('routeview', {rideId: ride.ride_share_id, routeId:ride.route.route_id});
  }

  function loadRoutes(){
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });
    showLoading();
    rideService.loadAllJoinedRidesFromServer().then(function(result){
      $scope.joinedRoutes = result;
      $ionicLoading.hide();
    });
    //rideService.loadAllRideShares().then(function(result){
    //  $scope.joinedRoutes = result;
    //});
  }

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = 'Getting list of routes you have joined...';

    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders.filter(function(user){return user.user_id != sharedRoute.owner.user_id;});
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
