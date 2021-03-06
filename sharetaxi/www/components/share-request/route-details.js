/**
 * Created by naomileow on 21/9/15.
 */
angular.module('st.routeDetails', ['models.route', 'models.rideshare', 'relativeDate', 'st.rideShare.service', 'models.sharerequest'])
.controller('routeDetails', function($scope, Route, RideShare, SharingOptions, rideService, ShareRequest, ngToast){
  $scope.rideShare = new RideShare();
  $scope.route = new Route();
  $scope.originalRoute = $scope.rideShare.route;

    var setAutocomplete = true;


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

    $scope.$on(REQUEST_POPOVER_SHOW_EVENT, function(event, result){
      $scope.rideShare = result.rideShare;
      $scope.route = result.route;
      $scope.originalRoute = result.rideShare.route;
      $scope.arrival_date =  $scope.originalRoute.sharing_options.constructArrivalDate();
      // console.log(result);
      //$scope.$apply();
    })

    $scope.submitRequest = function() {
      var shareReq = ShareRequest.createRequestObject($scope.rideShare, $scope.route);
      // console.log(shareReq);
      rideService.requestSharedRide(shareReq).then(function(result){
        if(!result) {
          ngToast.create({
            className: 'warning',
            content: 'Failed send request.',
            timeout: 2000
          });
        } else {
          ngToast.create({
            className: 'info',
            content: 'Successfully sent request!',
            timeout: 2000
          });
        }
      });
      $scope.closePopover();
    }

    $scope.$watch('document.getElementById("req-start-place")', function(value){
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
