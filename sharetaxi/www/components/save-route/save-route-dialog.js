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
      console.log(storageService.getAllRoutes(function(result){
        console.log(result)
        console.log("currently saved");
      }))
      saveRouteLocally();
      $scope.closeSavePopover();
    }
    function saveRouteLocally(){
      storageService.saveRoute($scope.route, function(result) {
        console.log("saved");
        console.log(result);
      });
    }
  })
