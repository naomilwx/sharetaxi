angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options', 'models.route', 'monospaced.elastic', 'models.sharingoptions'])
  .controller('planRouteForm',
  function($scope, $ionicPopup, directionsService, displayService, Route){

    var isSetup = false;

    $scope.autocompleteElements = {
      start: 'start-place',
      end: 'end-place'
    };

    $scope.rootElementId = "location-selection-modal";

    $scope.submitSelections = function(){
      if(checkLocationInputs()){
        displayService.clearDirections($scope.directionRenders);
        $scope.directionRenders = [];

        $scope.route.calculateDirections(function(results, status){
          if(status == google.maps.DirectionsStatus.OK){

            displayService.displayDirections($scope.directionRenders, $scope.map, results);

            $scope.$emit(SHOW_DIRECTIONS_RESULT, results);
          }
        });

        $scope.closePopover();
      }

    };

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
    }

    $scope.showAlert = function(message) {
      var alertPopup = $ionicPopup.alert({
        title: 'Invalid Inputs',
        template: message
      });
    };

    function setup(){
      $scope.route = new Route();
      $scope.directionRenders = [];
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
    })

  })
  .controller('shareRouteForm', function($scope, displayService, Route, SharingOptions){
    $scope.autocompleteElements = {
      start: 'share-start',
      end: 'share-end'
    };
    $scope.rootElementId = "location-share-modal";

    var isSetup = false;


    $scope.submitSelections = function(){
      displayService.clearDirections($scope.directionRenders);
      $scope.directionRenders = [];

      $scope.route.calculateDirections(function(results, status){
        if(status == google.maps.DirectionsStatus.OK){
          displayService.displayDirections($scope.directionRenders, $scope.map, results);
          shareRequest(results);
        }
      });
      $scope.closeSharePopover();
    };

    function shareRequest(dirResult){
      //TODO: save data
    }

    function setup(){
      $scope.route = new Route();
      $scope.directionRenders = [];
      $scope.sharingOptions = new SharingOptions();

      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    }

    $scope.$on(SHARE_POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
      $scope.sharingOptions.setCurrentDate();
    });
  });
