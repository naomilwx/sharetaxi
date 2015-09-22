angular.module('st.toolbar', ['st.selector', 'st.saveroute', 'models.route'])
.directive('shareTaxiToolbar', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/toolbar/map-toolbar.html',
      controller: "toolbarController"
    }
  })
.controller('toolbarController', function($rootScope, $scope, $ionicModal, Route){
    $scope.route = new Route();
    if($rootScope.user){
      route.creator_id = $rootScope.user.user_id;
    }

    $scope.hasValidLocations = function(){
      return $scope.route.hasOrigins() && $scope.route.hasDestinations();
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
      console.log($scope)
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

