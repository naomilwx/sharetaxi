/**
 * Created by naomileow on 23/9/15.
 */
var app = angular.module('st.listsaved', [])
.controller('listSavedController', function($scope, $state, storageService){
    $scope.requireReload = false;
    function loadRoutes(){
      storageService.getAllRoutesForUser(function(results){
        $scope.savedRoutes = results;
        // console.log("routes");
        // console.log(results);

        if(!navigator.onLine) {
          $scope.requireReload = true;
          var response = window.addEventListener("online", function(e) {
            window.location.reload(true);
            $scope.requireReload = false;
          });
        }
      });
    }

    $scope.$on('$ionicView.enter', function(){
      loadRoutes();
    });

    $scope.viewRoute = function (route){
      $state.go('mapview', {routeId:route.local_id});
    }

    $scope.deleteRoute = function(route, index){
      storageService.deleteRoute(route.local_id)
        .then(function(result){
          if(result == 'Transaction Completed'){
            $scope.savedRoutes.splice(index, 1);
          }
      });
    }



  })

app.filter('routesFilter', function(){
  function hasOriginOrDestinationMatch(route, searchStr) {
    return hasMatchInPlaceList(route.origins, searchStr) || hasMatchInPlaceList(route.destinations, searchStr);
  }

  function hasMatchInPlaceList(places, searchStr) {
    for(var idx in places){
      var place = places[idx];
      if(nameMatch(place.name, searchStr) ||
        (place.formatted_address && nameMatch(place.formatted_address, searchStr))){
        return true;
      }
    }
    return false;
  }

  function nameMatch(name, str) {
    if(!str){
      return true;
    }
    var lname = name.toLowerCase();
    var lstr = str.toLowerCase();
    return (lname.indexOf(lstr) >= 0);
  }

  return function(routes, searchStr){
    var result = [];
    angular.forEach(routes, function(route){
      var notes = route.sharing_options.notes;
      var local_desc = route.local_description;
      if(notes && nameMatch(notes, searchStr)){
        result.push(route);
      }else if(local_desc && nameMatch(local_desc, searchStr)){
        result.push(route);
      } else if(nameMatch(route.directions.getStartAddress(), searchStr)){
        result.push(route);
      } else if(nameMatch(route.directions.getEndAddress(), searchStr)){
        result.push(route);
      }else if(hasOriginOrDestinationMatch(route, searchStr)){
        result.push(route);
      }
    });
    return result;
  }
})
