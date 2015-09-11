var start = 'start-place';
var end = 'end-place';
var between = 'between-place';

angular.module('st.selector', [])
  //.directive('ngEnter', function () {
  //  return function (scope, element, attrs) {
  //    element.bind("keydown keypress", function (event) {
  //      if(event.which === 13) {
  //        scope.$apply(function (){
  //          scope.$eval(attrs.ngEnter);
  //        });
  //
  //        event.preventDefault();
  //      }
  //    });
  //  };
  //})
  .controller('locationSelector', ['$scope', function($scope){
    $scope.startpts = [];
    $scope.endpts = [];
    $scope.btwnpts = [];
    function clearTextField(itemId){
      document.getElementById(itemId).value = "";
    }

    function respondToLocationSelection(itemId, place){
      if(itemId == start){
        $scope.startpts.push(place);
      }else if(itemId == end){
        $scope.endpts.push(place);
      }else{
        $scope.btwnpts.push(place);
      }
      clearTextField(itemId);
      console.log(place.name);
      $scope.$apply();
    }

    $scope.removeLocation = function(locations, idx){
      locations.splice(idx, 1);
    };

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

    GoogleMapsLoader.load(locationAutocomplete(start));
    GoogleMapsLoader.load(locationAutocomplete(between));
    GoogleMapsLoader.load(locationAutocomplete(end));
  }]);
