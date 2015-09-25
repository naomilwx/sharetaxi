/**
 * Created by naomileow on 21/9/15.
 */
angular.module('st.routeDetails', ['models.route', 'models.rideshare', 'relativeDate', 'st.rideShare.service'])
.controller('routeDetails', function($scope, Route, RideShare, SharingOptions, rideService){
  $scope.rideShare = new RideShare();
  $scope.route = new Route();
  $scope.route.sharing_options = new SharingOptions();
  $scope.originalRoute = $scope.rideShare.route;

  //start Testdata
    $scope.rideShare.owner.name = "Justin Yeo";
    $scope.rideShare.riders = [{name: "Naomi Leow"}, {name: "blah"}];
    $scope.originalRoute.origins = [{name: "o1"}, {name: "o2"}]
    $scope.originalRoute.destinations = [{name: "d1"}, {name: "d2"}]

    $scope.originalRoute.sharing_options = new SharingOptions();

    $scope.route.origins = [{name:"a1"}];
  //End Testdata
    var setAutocomplete = true;
  $scope.arrival_date =  $scope.originalRoute.sharing_options.constructArrivalDate();

  $scope.autocompleteElements = {
    start: 'req-start-place',
    end: 'req-end-place'
  };
    $scope.rootElementId = "share-request-modal";
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

    $scope.submitRequest = function() {
      var shareReq = ShareRequest.createRequestObject($scope.rideShare, $scope.route);
      rideService.requestSharedRide(shareReq);
    }

    $scope.$watch('document.getElementById("req-start-place")', function(value){
      console.log(value);
      console.log("changed")
      $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
    })

    var evnt = $scope.$watch(function () {
      return document.getElementById($scope.autocompleteElements.start);
    }, function(val) {
      if(val){
        $scope.$broadcast(SET_GOOGLE_AUTOCOMPLETE);
        evnt();
      }
    });

  });
