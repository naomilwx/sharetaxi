var start = 'start-place';
var end = 'end-place';
var between = 'between-place';

function generateTapDisable(rootId){
  var corrected = false;
  return {
    corrected: corrected,
    disableTap: function(itemId){
      var container = document.getElementsByClassName('pac-container');

      if(!corrected){
        var target = angular.element(document.getElementById(rootId)).parent();
        container = angular.element(container).detach();
        target.prepend(container);
        corrected = true;
      }

      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){

        document.getElementById(itemId).blur();
      });

    }
  };
}

function loadGeocoder(google){
  geocoder = new google.maps.Geocoder;
}

function addMarker(place, map){
  if(place.geometry){
    var marker = new google.maps.Marker({
      position: place.geometry.location,
      title: place.name,
      map: map
    });
    place.mapMarker = marker;
  }
}

function clearTextField(itemId){
  document.getElementById(itemId).value = "";
}

function generateAutocompleteFunc(locSelResp){
  return function (itemId){
    var input = document.getElementById(itemId);
    return function(google){
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        locSelResp(itemId, place);
      })
    };
  }

}

function removeLocation(locations, idx){
  var loc = locations.splice(idx, 1)[0];
  loc.mapMarker.setMap(null);
  loc.mapMarker = null;
};

angular.module('st.selector', [])
  .controller('locationSelector', ['$scope', function($scope){
    var geocoder;
    var isSetup = false;
    var temp = generateTapDisable("location-selection-modal");
    var corrected = temp.corrected;
    $scope.disableTap = temp.disableTap;

    function respondToLocationSelection(itemId, place){
      if(place === ""){
        return;
      }
      if(itemId == start){
        $scope.startpts.push(place);
      }else if(itemId == end){
        $scope.endpts.push(place);
      }else{
        $scope.btwnpts.push(place);
      }
      clearTextField(itemId);
      if(!place.geometry){
        geocoder.geocode({address: place.name}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK) {
            place.geometry = results[0].geometry;
            addMarker(place, $scope.map);
          }
        });
      }else{
        addMarker(place, $scope.map);
      }
      $scope.$apply();
    }

    $scope.removeLocation = removeLocation;

    $scope.submitSelections = function(){

      //TODO
      $scope.closePopover();
    };

    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    function setup(){
      $scope.startpts = [];
      $scope.endpts = [];
      $scope.btwnpts = [];
      $scope.routeType = "fast";

      GoogleMapsLoader.load(loadGeocoder);
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

  }])
  .controller('shareSelector', [$scope, function($scope){
    var geocoder;
    var isSetup = false;
    var temp = generateTapDisable("location-share-modal");
    var corrected = temp.corrected;
    $scope.disableTap = temp.disableTap;

    function respondToLocationSelection(itemId, place){
      //TODO
    }
    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    $scope.removeLocation = removeLocation;

    $scope.submitSelections = function(){

      //TODO
      $scope.closePopover();
    };
    function setup(){
      $scope.startpts = [];
      $scope.endpts = [];

      GoogleMapsLoader.load(loadGeocoder);
      GoogleMapsLoader.load(locationAutocomplete(start));
      GoogleMapsLoader.load(locationAutocomplete(end));
    }

  }]);
