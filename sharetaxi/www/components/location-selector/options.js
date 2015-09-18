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

    $scope.$on(PARENT_DONE_REQUEST, function(event, res){
      var departure_time = new Date($scope.dep_date.getFullYear(), $scope.dep_date.getMonth(),
        $scope.dep_date.getDate(), $scope.dep_time.getHours(), $scope.dep_time.getMinutes(),
        $scope.dep_time.getSeconds(), $scope.dep_time.getMilliseconds());
      var items = {
        departure_time: departure_time,
        bufferTime: $scope.bufferTime,
        notes: $scope.notes,
        routeType: $scope.routeType
      };
      $scope.$emit(CHILD_DONE_REPLY, items);
    });

    $scope.$on('modal.shown', function() {
      $scope.dep_date = new Date();
      $scope.dep_time = new Date();
      $scope.dep_time.setMinutes(($scope.dep_date.getMinutes() + 15));
    });
  });
