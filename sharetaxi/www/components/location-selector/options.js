var routeOptions = [
  [FASTEST_ROUTE_KEY, "Fastest route"],
  [SHORTEST_ROUTE_KEY,  "Shortest route"],
  [AVOID_ERP_KEY, "Cheapest route (Avoiding ERP)"]
];



angular.module('st.options', ['ui.bootstrap', 'ui.bootstrap.datetimepicker', 'models.sharingoptions'])
.directive('routeOptions', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/options.html',
      controller: "optionsController"
    }
  })
  .controller('optionsController', function($scope){
    $scope.routeType = FASTEST_ROUTE_KEY;
    $scope.options = routeOptions;
  })
