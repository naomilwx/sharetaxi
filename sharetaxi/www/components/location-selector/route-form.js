function checkLocationInputs(){
  var alright = true;
  var message = "";
  if(!$scope.route.hasOrigins()){
    alright = false;
    message += "Starting Points must not be empty \n";
  }
  if(!$scope.route.hasDestinations()){
    alright = false;
    message += "Destinations must not be empty \n"
  }
  if(!alright){
    $scope.showAlert(message);
  }
  return alright;
};

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options', 'monospaced.elastic', 'models.sharingoptions', 'vm.map'])
  .controller('planRouteForm',
  function($scope, $ionicPopup, directionsService, MapVM){

    var isSetup = false;

    $scope.autocompleteElements = {
      start: 'start-place',
      end: 'end-place'
    };

    $scope.rootElementId = "location-selection-modal";

    $scope.submitSelections = function(){
      if(checkLocationInputs()){
        MapVM.removePositionMarker();
        MapVM.clearDirections();

        $scope.route.calculateDirections(function(results, status){
          if(status == google.maps.DirectionsStatus.OK){
            MapVM.displayDirections(results)
            $scope.$emit(SHOW_DIRECTIONS_RESULT, results);
          }
        });

        $scope.closePopover();
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
  .controller('shareRouteForm', function($scope, SharingOptions, MapVM){
    $scope.autocompleteElements = {
      start: 'share-start',
      end: 'share-end'
    };
    $scope.rootElementId = "location-share-modal";

    var isSetup = false;

    $scope.sharingOptions = new SharingOptions();

    $scope.submitSelections = function(){
      if(checkLocationInputs()) {
        MapVM.removePositionMarker();
        MapVM.clearDirections();

        $scope.route.calculateDirections(function (results, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            MapVM.displayDirections(results);
            shareRequest(results);
          }
        });
      }
      $scope.closeSharePopover();
    };

    function shareRequest(dirResult){
      //TODO: save data
    }

    function setup(){


      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(SHARE_POPOVER_SHOW_EVENT, function(event, response){
      console.log($scope);
      if(!isSetup){
        setup();
        isSetup = true;
      }
      $scope.sharingOptions.setCurrentDate();
    });
  });
