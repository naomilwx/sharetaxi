/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.listsaved', [])
.controller('listSavedController', function($scope, storageService){

    function loadRoutes(){
      storageService.getAllRoutesForUser(function(results){
        $scope.savedRoutes = results;
        console.log("routes");
        console.log(results);
      });
    }
    
    $scope.$on('$ionicView.enter', function(){
      loadRoutes();
    });


    $scope.deleteRoute = function(route, index){
      console.log(route);
      storageService.deleteRoute(route.local_id, function(result){
        //Remove deleted route from view
        $scope.savedRoutes.splice(index, 1);
      });
    }

  })
