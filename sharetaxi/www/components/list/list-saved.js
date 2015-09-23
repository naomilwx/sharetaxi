/**
 * Created by naomileow on 23/9/15.
 */
angular.module('st.listsaved', [])
.controller('listSavedController', function($scope, storageService){
   storageService.getAllRoutesForUser(function(results){
     $scope.savedRoutes = results;
     console.log(results);
     console.log(results[0])
   });

  })
