SHORTEST_ROUTE_KEY = "short";
FASTEST_ROUTE_KEY = "fast";
AVOID_ERP_KEY = "erp";
var routeOptions = [
  [FASTEST_ROUTE_KEY, "Fastest route"],
  [SHORTEST_ROUTE_KEY,  "Shortest route"],
  [AVOID_ERP_KEY, "Avoid Erp"]
];
ROUTE_OPTIONS_SELECTED = 'selected route options';
function optionsSelect(scope){
  return function(option){
    scope.$emit(ROUTE_OPTIONS_SELECTED, option);
  }
}



angular.module('st.options', ['monospaced.elastic', 'ui.bootstrap', 'ui.bootstrap.datetimepicker'])
.directive('routeOptions', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/options.html',
      controller: "optionsController",
      scope: false
    }
  })
  .directive('shareRouteOptions', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/share-options.html',
      controller: "shareOptionsController",
      scope: false
    }
  })
  .controller('optionsController', function($scope){
    $scope.routeType = FASTEST_ROUTE_KEY;
    $scope.options = routeOptions;
    $scope.optionsSelect = optionsSelect($scope);
  })
  .controller('shareOptionsController', function($scope){
    $scope.routeType = FASTEST_ROUTE_KEY;
    $scope.options = routeOptions;
    $scope.optionsSelect = optionsSelect($scope);

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

    $scope.$on('modal.shown', function() {
      $scope.dep_date = new Date();
      $scope.dep_time = new Date();
      $scope.dep_time.setMinutes(($scope.dep_date.getMinutes() + 15));
    });
  });
