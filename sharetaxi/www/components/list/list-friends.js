angular.module('st.listfriends', ['ngTouch', 'models.user','models.route', 'models.rideshare', 'models.sharerequest', 'models.place', 'st.service'])
.controller('listFriendsCtrl', function($scope, $state, $rootScope, $ionicPopup, rideService, storageService, $localStorage, $ionicLoading, $ionicModal,
                                        User, Route, RideShare, ShareRequest, ngToast, Place, placeService){

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.disableTap = function(){
      var container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){

        document.getElementById("friends-route-search").blur();

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

    function attachAutocomplete(google) {
      var input = document.getElementById("friends-route-search");
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if(place === ""){
          $scope.friendsRoutes = $scope.allFriendsRoutes;
          return;
        }
        //Convert to local representation of the place object
        place = new Place(place);

        placeService.setPlaceDetails(place, function(place){
          rideService.getRideSharesNearPlace(place).then(function(results){
            $scope.friendsRoutes = results;
          })
        });
      })
    }

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
        loadRequestForAllRides();
      }
    });

  }

    $scope.getImageSrc = function(ride) {
      var fbId = ride.owner.facebook_id;
      if(fbId && fbId != ""){
        return "http://graph.facebook.com/" +fbId +"/picture";
      }else {
        return "/img/icon.png";
      }
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
    showLoading();
    if(!$rootScope.isLoggedIn){
      $ionicLoading.hide();
      showLoginDialog();
    } else{
      rideService.loadAllFriendsRides().then(function(result){
        $scope.allFriendsRoutes = result;
        $scope.friendsRoutes = result;
        $ionicLoading.hide();
      });
      loadRequestForAllRides();
    }

  }

    function loadRequestForAllRides() {
      rideService.getAllSharedRideRequests().then(function(result){
        $scope.requestedIds = result.map(function(req){return req.ride_share_id});
      })
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

  GoogleMapsLoader.load(attachAutocomplete);

  //$scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
  //}

})
