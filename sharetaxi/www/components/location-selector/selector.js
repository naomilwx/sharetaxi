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
    var isSetup = false;
    function clearTextField(itemId){
      document.getElementById(itemId).value = "";
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
      $scope.$apply();
    }

    $scope.removeLocation = function(locations, idx){
      locations.splice(idx, 1);
    };

    $scope.submitSelections = function(){

    }

    function locationAutocomplete(itemId){
      var input = document.getElementById(itemId);
      console.log(input);
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
      $scope.btwnpts = [];GoogleMapsLoader.load(locationAutocomplete(start));
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
