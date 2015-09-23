/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.listsaved', [])
.controller('listSavedController', function($scope, storageService){
   storageService.getAllRoutesForUser(function(results){
     $scope.savedRoutes = results;
     console.log("routes");
     console.log(results);
   });

    $scope.deleteRoute = function(route){
      console.log(route);
      storageService.deleteRoute(route.local_id, function(result){
        console.log(result);
      });
    }

  })
