var routeOptions = [
  [FASTEST_ROUTE_KEY, "Fastest route"],
  [SHORTEST_ROUTE_KEY,  "Shortest route"],
  [AVOID_ERP_KEY, "Avoid Erp"]
];

function optionsSelect(scope){
  return function(option){
    scope.routeType = option;
    scope.$emit(ROUTE_OPTIONS_SELECTED, option);
  }
}



angular.module('st.options', ['ui.bootstrap', 'ui.bootstrap.datetimepicker', 'models.sharingoptions'])
.directive('routeOptions', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/options.html',
      controller: "optionsController",
      scope: false
    }
  })
  .controller('optionsController', function($scope){
    $scope.routeType = FASTEST_ROUTE_KEY;
    $scope.options = routeOptions;
    $scope.optionsSelect = optionsSelect($scope);
  })
