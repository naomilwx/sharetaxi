var routeOptions = [
  ["fast", "Fastest route"],
  ["short",  "Shortest route"],
  ["erp", "Avoid Erp"]
];

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
    $scope.routeType = "fast";
    $scope.options = routeOptions;
  })
  .controller('shareOptionsController', function($scope){
    $scope.routeType = "fast";
    $scope.options = routeOptions;


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
