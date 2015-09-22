/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.saveroute', [])
.controller('saveRouteController', function($scope){
    $scope.getRouteTypeDisplay = function(){
      var type = $scope.route.route_type;
      return routeOptions[type];
    }
  })
