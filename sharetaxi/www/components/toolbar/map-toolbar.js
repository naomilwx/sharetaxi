angular.module('st.toolbar', ['st.selector', 'st.saveroute','models.route', 'vm.map'])
.directive('shareTaxiToolbar', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/toolbar/map-toolbar.html',
      controller: "toolbarController"
    }
  })
.controller('toolbarController', function($scope, $rootScope, $ionicModal, Route, $ionicPopup, MapVM, storageService){
    console.log("toolbar controller");
    $scope.refresh = function(){
      $scope.resetRoute();
      MapVM.clearView();
      $scope.resetDisplayedDirections();
    }

    $scope.hasValidLocations = function(){
      return $scope.route.hasOrigins() && $scope.route.hasDestinations();
    };

    $scope.canSaveRoute = function(){
      return !$scope.route.directions.isEmpty() && $scope.hasValidLocations();
    };

    //User must be logged in in order to use the share route function
    $scope.openSharePopoverOrLogin = function(){
      if($rootScope.isLoggedIn){
        $scope.openSharePopover();
      }else{
        $scope.showLoginDialog();
      }
    }

    $scope.showLoginDialog = function() {
      var popup = $ionicPopup.confirm({
        title: 'Login to share your route',
      });
      popup.then(function(res) {
        if(res) {
          $rootScope.login();
        } else {
        }
      });
    };

    //Plan Route View
    $ionicModal.fromTemplateUrl('components/location-selector/plan-route-form.html', {
      scope: $scope
    }).then(function(popover){
      $scope.popover = popover;
    });
    $scope.openPopover = function(){
      //storageService.getRouteByLocalId(1,function(result){console.log(result)})
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
      console.log("destroyed modals")
      $scope.popover.remove();
      $scope.sharePopover.remove();
    });
  });

