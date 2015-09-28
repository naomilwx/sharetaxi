function checkLocationInputs(scope){
  var alright = true;
  var message = "";
  if(!scope.route.hasOrigins()){
    alright = false;
    message += "Starting Points must not be empty \n";
  }
  if(!scope.route.hasDestinations()){
    alright = false;
    message += "Destinations must not be empty \n"
  }
  if(!alright){
    scope.showAlert(message);
  }
  return alright;
};

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options',
  'models.sharingoptions', 'vm.map', 'st.rideShare.service'])
  .controller('planRouteForm',
  function($scope, $ionicPopup, directionsService, MapVM){

    var isSetup = false;

    $scope.autocompleteElements = {
      start: 'start-place',
      end: 'end-place'
    };

    $scope.rootElementId = "location-selection-modal";

    $scope.submitSelections = function(){
      if(checkLocationInputs($scope)){
        MapVM.removePositionMarker();
        MapVM.clearDirections();
        $scope.route.calculateDirections(function(results, status){
          if(status == google.maps.DirectionsStatus.OK){
            $scope.route.directions = results;
            MapVM.displayDirections(results, false);
            $scope.$emit(SHOW_DIRECTIONS_RESULT, results);
          }
        });

        $scope.closePopover();

        // ngToast.create({
        //   className: 'info',
        //   content: 'Success!',
        //   timeout: 3000
        // });
      }

    };

    $scope.showAlert = function(message) {
      var alertPopup = $ionicPopup.alert({
        title: 'Invalid Inputs',
        template: message
      });
    };

    function setup(){
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
    })

  })
  .controller('shareRouteForm', function($scope, $localStorage, rideService, SharingOptions, MapVM, ngToast){
    $scope.autocompleteElements = {
      start: 'share-start',
      end: 'share-end'
    };
    $scope.rootElementId = "location-share-modal";

    var isSetup = false;

      $scope.submitSelections = function(){
      if(checkLocationInputs($scope)) {
        MapVM.removePositionMarker();
        MapVM.clearDirections();
        $scope.route.calculateDirections(function (results, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            $scope.route.directions = results;
            MapVM.displayDirections(results, false);
            shareRequest($scope.route);
          }else {
            //Directions loading fail. but just send anyway.
            shareRequest($scope.route);
          }
        });
      }

      $scope.closeSharePopover();
    };

    function shareRequest(route){
      // console.log(route);
      rideService.createSharedRide(route).then(function(result){
        if(result) {
          if(!$localStorage.noFbShare){
            shareToFacebook(result);
          }
            ngToast.create({
            className: 'info',
            content: 'Successfully shared route!',
            timeout: 3000
          });
        }else {
          ngToast.create({
          className: 'warning',
          content: 'Failed to share route.',
          timeout: 3000
        });
        }
      })
    }



    function shareToFacebook(ride) {
      //console.log("facebook");
      var link = window.location.origin+"/routemap/" + ride.ride_share_id +"/"+ ride.route.route_id;
      var caption = ride.toShareMessage();
      //http://localhost:8100/routemap/2/2
      var opts =
      {
        method: 'feed',
          link: link,
        caption: caption,
      }
      facebookAPI.showDialog(opts, function(response){
        // console.log(response);
      }, function(error){
        // console.log("error");
        // console.log(error);
        $localStorage.noFbShare = true;
      })
    }

    function setup(){
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(SHARE_POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
      $scope.route.sharing_options.setCurrentDate();
    });
  });
