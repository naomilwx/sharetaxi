/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.saveroute', ['st.storage'])
.controller('saveRouteController', function($scope, storageService){
    $scope.getRouteTypeDisplay = function(){
      var type = $scope.route.route_type;
      return routeOptions[type];
    }

    $scope.handleSaveRoute = function() {
      saveRouteLocally();
      $scope.closeSavePopover();
    }
    function saveRouteLocally(){
      storageService.saveRoute($scope.route).then(function(result) {
        console.log("saved");
        console.log(result);
      });
    }
  })
