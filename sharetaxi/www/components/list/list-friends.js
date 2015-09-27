angular.module('st.listfriends', ['ngTouch', 'models.user','models.route', 'models.rideshare', 'models.sharerequest'])
.controller('listFriendsCtrl', function($scope, $state, $rootScope, $ionicPopup, rideService, storageService, $localStorage, $ionicLoading, $ionicModal,
                                        User, Route, RideShare, ShareRequest, ngToast){

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = "Getting list of your friends' shared routes...";

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

    function showLoginDialog()  {
      var popup = $ionicPopup.confirm({
        title: "Login to view your friends' shared rides",
      });
      popup.then(function(res) {
        if(res) {
          $rootScope.login();
        } else {
        }
      });
    };

  $scope.joinRoute = function(index) {
    var shareReq = ShareRequest.createRequestObject($scope.friendsRoutes[index], new Route());
    rideService.requestSharedRide(shareReq).then(function(result){
      if(!result) {
        ngToast.create({
          className: 'warning',
          content: 'Failed send request.',
          timeout: 2000
        });
      } else {
        ngToast.create({
          className: 'info',
          content: 'Successfully sent request!',
          timeout: 2000
        });
      }
    });

  }

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

  //Plan Route View
  $ionicModal.fromTemplateUrl('components/share-request/route-details.html', {
    scope: $scope
  }).then(function(popover){
    $scope.popover = popover;
  });

  $scope.openPopover = function(index){
    //storageService.getRouteByLocalId(1,function(result){console.log(result)})
    var rideShare = $scope.friendsRoutes[index];
    $scope.$broadcast(REQUEST_POPOVER_SHOW_EVENT, {
      rideShare: rideShare,
        route:new Route(),
      originalRoute:rideShare.route
    })

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
    showLoading();
    if(!$rootScope.isLoggedIn){
      $ionicLoading.hide();
      showLoginDialog();
    } else{
      rideService.loadAllFriendsRides().then(function(result){
        $scope.friendsRoutes = result;
        $ionicLoading.hide();
      });
      rideService.getAllSharedRideRequests().then(function(result){
        console.log(result);
        $scope.requestedIds = result.map(function(req){return req.ride_share_id});
      })
    }

  }
  $scope.isAccepted = function(ride) {
    return ride.hasRider($localStorage.user);
  }
  $scope.isRequested = function(ride) {

      if($scope.requestedIds){
        var requested = ($scope.requestedIds.indexOf(ride.ride_share_id) >= 0);
        return requested;
      }else {
        return false;
      }

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
