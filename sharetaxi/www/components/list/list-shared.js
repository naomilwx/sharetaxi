var app = angular.module('st.listshared', ['ngTouch', 'st.rideShare.service', 'ngStorage'])
.controller('listSharedCtrl', function($scope, $state, rideService, $ionicLoading){
  //$scope.sharedRoutes = [{
  //  route_id: 0,
  //  local_description: "Going to School",
  //  num_requests: 1,
  //  start_address: "NUS",
  //  end_address: "Vivocity",
  //  deadline: "8:30pm",
  //  sharing: "Naomi Leow and 1 other"
  //}];

  $scope.openSharedMap = function(ride) {
    $state.go('sharedmap', {rideId: ride.ride_share_id});
  }

    function showLoading(){
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

    }

    $scope.loadingMessage = 'Getting list of routes you have shared...';

  function loadRoutes(){
    showLoading();
    rideService.loadAllRideShares().then(function(result){
      $scope.sharedRoutes = result;
      $ionicLoading.hide();
    });
  }

    $scope.getRideDeadline = function(ride) {
      if(ride){
        return ride.route.sharing_options.constructArrivalDate();
      }else{
        return "";
      }
    }

    $scope.getSharingDisplay = function(sharedRoute){
      var sharers = sharedRoute.riders.filter(function(user){return user.user_id != sharedRoute.owner.user_id;});
      var num = (sharers)? sharers.length : 0;
      if(num > 0){
        var dis = sharers[0].name;
        if(num > 1){
          dis += " and " + (num - 1) + " other";
        }
        return dis;
      }else{
        return "";
      }
    }

    $scope.getNumberOfRequests = function(index){
      //TODO:
      return $scope.requestCounts[index];
    }

  $scope.$on('$ionicView.enter', function(){
     loadRoutes();
  });


  $scope.deleteRoute = function(ride, index){
    rideService.deleteSharedRide(ride).then(function(result){
      if(result){
        $scope.sharedRoutes.splice(index, 1);
      }
    });
  }

})

app.filter('sharedRideFilter', function(){
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
    var idx = lname.indexOf(lstr);
    return (idx >= 0);
  }

  return function(sharedRides, searchStr){
    var result = [];
    angular.forEach(sharedRides, function(ride){
      var route = ride.route;
      var notes = route.sharing_options.notes;
      var local_desc = route.local_description;
      if(notes && nameMatch(notes, searchStr)){
        result.push(ride);
      } else if(nameMatch(route.directions.getStartAddress(), searchStr)){
        result.push(ride);
      } else if(nameMatch(route.directions.getEndAddress(), searchStr)){
        result.push(ride);
      } else if(local_desc && nameMatch(local_desc, searchStr)){
        result.push(ride);
      } else if(hasOriginOrDestinationMatch(route, searchStr)){
        result.push(ride);
      }
    });
    return result;
  }
})
