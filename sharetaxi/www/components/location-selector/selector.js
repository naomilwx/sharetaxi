function generateTapDisable(rootId){
  return function(itemId){
      var container = document.getElementsByClassName('pac-container');
      var acontainer = angular.element(container);
      var parent = acontainer.parent();
      var target = angular.element(document.getElementById(rootId)).parent();

      if(parent[0].$$hashKey != target[0].$$hashKey){
        container = acontainer.detach();
        target.prepend(container);
      }

      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){

        document.getElementById(itemId).blur();

      });

    };
}

function clearTextField(itemId){
  document.getElementById(itemId).value = "";
}

function generateAutocompleteFunc(selectionResponse){
  return function (itemId){
    var input = document.getElementById(itemId);

    return function(google){
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        selectionResponse(itemId, place);
      })
    };
  }

}

function removeLocation(locations, idx){
  var loc = locations.splice(idx, 1)[0];
  loc.mapMarker.setMap(null);
  loc.mapMarker = null;
};

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options', 'models.route', 'monospaced.elastic', 'models.sharingoptions'])
  .controller('locationSelector',
  function($scope, $ionicPopup, directionsService, displayService, placeService, Route){
    var start = 'start-place';
    var end = 'end-place';

    var isSetup = false;
    $scope.disableTap = generateTapDisable("location-selection-modal");

    function respondToLocationSelection(itemId, place){
      if(place === ""){
        return;
      }
      if(itemId == start){
        $scope.route.addOrigin(place);
      }else if(itemId == end){
        $scope.route.addDestination(place);
      }
      clearTextField(itemId);
      placeService.setPlaceDetails(place, function(place){
        displayService.addMarker(place, $scope.map);
      });


      $scope.$apply();
    }

    $scope.removeLocation = removeLocation;

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
        message += "Destintations must not be empty \n"
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

    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    function setup(){
      $scope.route = new Route();
      $scope.directionRenders = [];

      GoogleMapsLoader.load(locationAutocomplete(start));
      GoogleMapsLoader.load(locationAutocomplete(end));
    }

    $scope.$on(POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
    })

  })
  .controller('shareSelector', function($scope, displayService, placeService, Route, SharingOptions){
    var start = 'start-place-s';
    var end = 'end-place-s';

    var isSetup = false;
    $scope.disableTap = generateTapDisable("location-share-modal");

    function respondToLocationSelection(itemId, place){
      if(place === ""){
        return;
      }
      if(itemId == start){
        $scope.route.addOrigin(place);
      }else if(itemId == end){
        $scope.route.addDestination(place);
      }

      clearTextField(itemId);
      placeService.setPlaceDetails(place, function(place){
        displayService.addMarker(place, $scope.map);
      });
      displayService.addMarker(place, $scope.map);

      $scope.$apply();
    }

    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    $scope.removeLocation = removeLocation;

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

      GoogleMapsLoader.load(locationAutocomplete(start));
      GoogleMapsLoader.load(locationAutocomplete(end));
    }

    $scope.disabledDate = function(date, mode) {
      return date < (new Date()).setHours(0,0,0,0);
    };

    $scope.timeOptions = {
      readonlyInput: false,
      showMeridian: false
    };

    $scope.dateStatus = {
      opened: false
    };

    $scope.timeStatus = {
      opened: false
    };

    $scope.openDatePopup = function($event, popup) {
      popup.opened = true;
    };

    $scope.$on(SHARE_POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
      $scope.sharingOptions.setCurrentDate();
    });
  });
