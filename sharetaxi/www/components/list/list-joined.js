angular.module('st.listjoined', ['ngTouch'])
.controller('listJoinedCtrl', function($scope, $state, storageService){
  $scope.joinedRoutes = [{
    routeId: 0,
    owner: "Justin Yeo",
    local_description: "Going to School",
    start_address: "NUS",
    end_address: "Vivocity",
    deadline: "8:30pm",
    sharing: "Naomi Leow and 1 other"
  }];

  $scope.openJoinedMap = function(route) {
    // $state.go('mapview', {routeId: route.routeId});
  }

  function loadRoutes(){
    // storageService.getAllRoutesForUser(function(results){
    //   $scope.savedRoutes = results;
    //   console.log("routes");
    //   console.log(results);
    // });
  }

  $scope.$on('$ionicView.enter', function(){
    // loadRoutes();
  });


  $scope.deleteRoute = function(route, index){
    // console.log(route);
    // storageService.deleteRoute(route.local_id, function(result){
    //   //Remove deleted route from view
    //   $scope.savedRoutes.splice(index, 1);
    // });
  }

})
