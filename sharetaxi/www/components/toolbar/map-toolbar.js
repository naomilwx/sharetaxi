angular.module('st.toolbar', ['st.selector', 'ngStorage','st.saveroute','st.storage', 'models.route'])
.directive('shareTaxiToolbar', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/toolbar/map-toolbar.html',
      controller: "toolbarController"
    }
  })
.controller('toolbarController', function($localStorage, $scope, $ionicModal, Route, storageService){
    $scope.route = new Route();
    if($localStorage.user){
      $scope.route.creator_id =$localStorage.user.user_id;
    }

    //storageService.getAllRoutesForUser(function(result){
    //  console.log("created routes");
    //  console.log(result);
    //})

    $scope.hasValidLocations = function(){
      return $scope.route.hasOrigins() && $scope.route.hasDestinations();
    };

    $scope.canSaveRoute = function(){
      return !$scope.route.directions.isEmpty() && $scope.hasValidLocations();
    };


    //Plan Route View
    $ionicModal.fromTemplateUrl('components/location-selector/plan-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.popover = popover;
    });
    $scope.openPopover = function(){
      $scope.popover.show();
      $scope.$broadcast(POPOVER_SHOW_EVENT);
    };
    $scope.closePopover = function(){
      $scope.popover.hide();
    };

    //Share Route View
    $ionicModal.fromTemplateUrl('components/location-selector/share-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.sharePopover = popover;
    });
    $scope.openSharePopover = function(){
      $scope.sharePopover.show();
      $scope.$broadcast(SHARE_POPOVER_SHOW_EVENT);
    };
    $scope.closeSharePopover = function(){
      $scope.sharePopover.hide();
    };

    //Save Route View
    $ionicModal.fromTemplateUrl('components/save-route/save-route-dialog.html', {
      scope: $scope
    }).then(function(popover){
      $scope.savePopover = popover;
    });
    $scope.openSavePopover = function(){
      $scope.savePopover.show();
    }
    $scope.closeSavePopover = function() {
      $scope.savePopover.hide();
    }


    $scope.$on('$destroy', function() {
      $scope.popover.remove();
      $scope.sharePopover.remove();
    });
  });

