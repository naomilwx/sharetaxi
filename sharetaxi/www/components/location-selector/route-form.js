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

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options', 'monospaced.elastic',
  'models.sharingoptions', 'vm.map', 'st.rideShare.service'])
  .controller('planRouteForm',
  function($scope, $ionicPopup, directionsService, MapVM, ngToast){

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
  .controller('shareRouteForm', function($scope, rideService, SharingOptions, MapVM, ngToast){
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
