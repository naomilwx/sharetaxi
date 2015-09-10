angular.module('st.selector', [])
.controller('locationSelector', ['$scope', function($scope){
  function locationAutocomplete(itemId){
    var input = document.getElementById(itemId);
    return function(google){
      //var autocomplete = new google.maps.places.Autocomplete(input);
      var searchBox = new google.maps.places.SearchBox(input);

    };
  }

  GoogleMapsLoader.load(locationAutocomplete('start-place'));

  }]);
