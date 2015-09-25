angular.module('st.selector')
.directive('locationSelector', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/location-selector.html',
      controller: "locationSelectorController"
    }
  })
.controller('locationSelectorController', function($scope, placeService, displayService, MapVM, Place){
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

    var start = $scope.autocompleteElements.start;
    console.log(start);
    var end = $scope.autocompleteElements.end;

    $scope.disableTap = generateTapDisable($scope.rootElementId);

    function respondToLocationSelection(itemId, place){
      if(place === ""){
        return;
      }
      //Convert to local representation of the place object
      place = new Place(place);
      if(itemId == start){
        $scope.route.addOrigin(place);
      }else if(itemId == end){
        $scope.route.addDestination(place);
      }
      clearTextField(itemId);
      placeService.setPlaceDetails(place, function(place){
        MapVM.addMarker(place);
      });


      $scope.$apply();
    };

    $scope.startPlaceHolder = function(){
      if($scope.route.hasOrigins()){
        return "Choose a place to pick up a friend (optional)";
      }else{
        return "Choose a starting point for yourself";
      }
    };

    $scope.endPlaceHolder = function(){
      if($scope.route.hasDestinations()){
        return "Choose a place to drop off a friend (optional)";
      }else{
        return "Choose a destination for yourself";
      }
    };

    $scope.removeLocation = function(locations, idx){
      var loc = locations.splice(idx, 1)[0];
      MapVM.removeMarker(loc);
    };

    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    function setup(){
      if(document.getElementById(start) != null){
        GoogleMapsLoader.load(locationAutocomplete(start));
        GoogleMapsLoader.load(locationAutocomplete(end));
        autocompleteAttach();
      }
    }

    var autocompleteAttach = $scope.$on(SET_GOOGLE_AUTOCOMPLETE, function(event, response){
      setup();
    })
  });
