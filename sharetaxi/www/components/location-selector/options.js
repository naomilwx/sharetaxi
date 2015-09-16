angular.module('st.options', [])
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
    $scope.routeType = "fast";

  })
  .controller('shareOptionsController', function($scope){
    $scope.routeType = "fast";
    $scope.dateOptions = {
      'year-format': "'yyyy'",
      'starting-day': 1
    };
  })
