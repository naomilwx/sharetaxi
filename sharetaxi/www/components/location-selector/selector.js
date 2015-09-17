function generateTapDisable(rootId){
  return function(itemId){
      var container = document.getElementsByClassName('pac-container');
      var acontainer = angular.element(container);
      var parent = acontainer.parent();
      var target = angular.element(document.getElementById(rootId)).parent();

      if(parent[0].$$hashKey != target[0].$$hashKey){
        console.log(parent[0].$$hashKey)

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

function getDirections(scope, displayService, directionsService, cb){
  displayService.clearDirections(scope.directionRenders);
  scope.directionRenders = [];
  if(!scope.btwnpts){
    scope.btwnpts = [];
  }
  directionsService.getDirections(scope.startpts, scope.btwnpts, scope.endpts, scope.routeType, function(results, status){
    if(status == google.maps.DirectionsStatus.OK){
      scope.directions = results;
      displayService.displayDirections(scope.directionRenders, scope.map, results);
      if(cb){
        cb(results);
      }
    }

  });
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

angular.module('st.selector', ['st.service', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'st.options'])
  .controller('locationSelector',
  ['$scope', 'directionsService', 'displayService', function($scope, directionsService, displayService){
    var start = 'start-place';
    var end = 'end-place';
    var between = 'between-place';

    var geocoder;
    var isSetup = false;
    $scope.disableTap = generateTapDisable("location-selection-modal");

    function loadGeocoder(google){
      geocoder = new google.maps.Geocoder;
    }

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
            place.formatted_address = results[0].formatted_address;
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
      getDirections($scope, displayService, directionsService, null);
      $scope.closePopover();
    };

    $scope.$on(ROUTE_OPTIONS_SELECTED, function(event, option){
      $scope.routeType = option;
    });

    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    function setup(){
      $scope.startpts = [];
      $scope.endpts = [];
      $scope.btwnpts = [];
      $scope.directionRenders = [];

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
  .controller('shareSelector', ['$scope', 'displayService', 'directionsService', function($scope, displayService, directionsService){
    var start = 'start-place-s';
    var end = 'end-place-s';

    var geocoder;
    function loadGeocoder(google){
      geocoder = new google.maps.Geocoder;
    }

    var isSetup = false;
    $scope.disableTap = generateTapDisable("location-share-modal");

    function respondToLocationSelection(itemId, place){
      if(place === ""){
        return;
      }
      if(itemId == start){
        $scope.startpts.push(place);
      }else{
        place.datetimeStatus = {opened: false};
        $scope.endpts.push(place);
      }

      clearTextField(itemId);
      if(!place.geometry){
        geocoder.geocode({address: place.name}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK) {
            place.geometry = results[0].geometry;
            place.formatted_address = results[0].formatted_address;
            addMarker(place, $scope.map);
          }
        });
      }else{
        addMarker(place, $scope.map);
      }

      $scope.$apply();
    }
    var locationAutocomplete = generateAutocompleteFunc(respondToLocationSelection);

    $scope.removeLocation = removeLocation;

    $scope.submitSelections = function(){

      $scope.$broadcast(PARENT_DONE_REQUEST);


    };
    function applyReply(reply){
      $scope.routeType = reply.routeType;
      $scope.departure_time = reply.departure_time;
      $scope.notes = reply.notes;
      $scope.bufferTime = reply.bufferTime;
      console.log($scope.routeType);
    }

    $scope.$on(CHILD_DONE_REPLY, function(event, reply){
      applyReply(reply);
      getDirections($scope, displayService, directionsService, shareRequest); //TODO: handle departure time
      $scope.closeSharePopover();
    });

    function shareRequest(dirResult){
      //TODO: save data
    }

    $scope.disabledDate = function(date, mode) {
      return date < (new Date()).setHours(0,0,0,0);
    };

    $scope.openDatePopup = function($event, popup) {
      popup.opened = true;
    };

    function setup(){
      $scope.startpts = [];
      $scope.endpts = [];
      $scope.directionRenders = [];
      GoogleMapsLoader.load(loadGeocoder);
      GoogleMapsLoader.load(locationAutocomplete(start));
      GoogleMapsLoader.load(locationAutocomplete(end));
    }

    $scope.$on(SHARE_POPOVER_SHOW_EVENT, function(event, response){
      if(!isSetup){
        setup();
        isSetup = true;
      }
    })

  }]);
