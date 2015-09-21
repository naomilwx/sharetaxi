var routeOptions = [
  [FASTEST_ROUTE_KEY, "Fastest route"],
  [SHORTEST_ROUTE_KEY,  "Shortest route"],
  [AVOID_ERP_KEY, "Cheapest route (Avoiding ERP)"]
];

function optionsSelect(scope){
  return function(option){
    scope.routeType = option;
    scope.$emit(ROUTE_OPTIONS_SELECTED, option);
  }
}



angular.module('st.options', ['monospaced.elastic', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'models.sharingoptions'])
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
  .controller('shareOptionsController', function($scope, SharingOptions){
    $scope.sharingOptions = new SharingOptions();
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
      var items = {
        sharing_options: $scope.sharingOptions,
        route_type: $scope.routeType
      };
      $scope.$emit(CHILD_DONE_REPLY, items);
    });

    $scope.$on('modal.shown', function() {
      $scope.sharingOptions.setCurrentDate();
    });
  });
