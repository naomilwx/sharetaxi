angular.module('st.listshared', ['ngTouch'])
.controller('listSharedCtrl', function($scope, $state, storageService){
  $scope.savedRoutes = [{
    id: 0,
    local_description: "Going to School",
    num_requests: 1,
    start_address: "NUS",
    end_address: "Vivocity",
    deadline: "8:30pm",
    sharing: "Naomi Leow and 1 other"
  }];

  $scope.openSharedMap = function(route) {
    console.log(route);
    $state.go('sharedmap', {currRoute: route});
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
