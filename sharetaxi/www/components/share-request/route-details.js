/**
 * Created by naomileow on 21/9/15.
 */
angular.module('st.routeDetails', ['models.route', 'models.rideshare', 'relativeDate'])
.controller('routeDetails', function($scope, Route, RideShare, SharingOptions){
  $scope.rideShare = new RideShare();
  $scope.route = new Route();
  $scope.originalRoute = $scope.rideShare.route;

  //start Testdata
    $scope.rideShare.owner.name = "Justin Yeo";
    $scope.rideShare.riders = [{name: "Naomi Leow"}, {name: "blah"}];
    $scope.originalRoute.origins = [{name: "o1"}, {name: "o2"}]
    $scope.originalRoute.destinations = [{name: "d1"}, {name: "d2"}]

    $scope.originalRoute.sharing_options = new SharingOptions();

    $scope.route.origins = [{name:"a1"}];
  //End Testdata

  $scope.arrival_date =  $scope.originalRoute.sharing_options.constructArrivalDate();

  $scope.autocompleteElements = {
    start: 'rq-start-place',
    end: 'rq-end-place'
  };
  $scope.displayOtherRiders = function(){
    var num = $scope.rideShare.getNumberOfRiders();
    if(num == 0){
      return "";
    }
    var disp = $scope.rideShare.riders[0].name;
    if(num == 2){
      disp += " and 1 other";
    }else if(num > 2){
      disp += " and " + (num + 1) + "other";
    }
    return disp;
  };
    $scope.rootElementId = "share-request-modal";

    $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
  });
