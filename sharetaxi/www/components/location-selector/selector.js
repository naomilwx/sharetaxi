var start = 'start-place';
var end = 'end-place';
var between = 'between-place';

angular.module('st.selector', [])
  .controller('locationSelector', ['$scope', function($scope){
    var isSetup = false;
    function clearTextField(itemId){
      document.getElementById(itemId).value = "";
    }

    function addMarker(place){
      if(place.geometry){
        var marker = new google.maps.Marker({
          position: place.geometry.location,
          title: place.name,
          map: $scope.map
        });
        place.mapMarker = marker;
      }
    }


    function respondToLocationSelection(itemId, place){
      console.log(place);
      if(itemId == start){
        $scope.startpts.push(place);
      }else if(itemId == end){
        $scope.endpts.push(place);
      }else{
        $scope.btwnpts.push(place);
      }
      clearTextField(itemId);
      addMarker(place);
      $scope.$apply();
    }

    $scope.disableTap = function(itemId){
      container = document.getElementsByClassName('pac-container');
      // disable ionic data tab

      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){
        console.log("here");
        document.getElementById(itemId).blur();
      });
    };

    $scope.removeLocation = function(locations, idx){
      var loc = locations.splice(idx, 1)[0];
      loc.mapMarker.setMap(null);
      loc.mapMarker = null;
    };

    $scope.submitSelections = function(){

    }

    function locationAutocomplete(itemId){
      var input = document.getElementById(itemId);
      return function(google){
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();
          respondToLocationSelection(itemId, place);
        })

      };
    }

    function setup(){
      $scope.startpts = [];
      $scope.endpts = [];
      $scope.btwnpts = [];

      GoogleMapsLoader.load(locationAutocomplete(start));
      GoogleMapsLoader.load(locationAutocomplete(between));
      GoogleMapsLoader.load(locationAutocomplete(end));
    }

    $scope.$on(POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
    })

  }]);
