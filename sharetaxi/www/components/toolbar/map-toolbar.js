POPOVER_SHOW_EVENT = "showpopover";
angular.module('st.toolbar', ['st.selector'])
.directive('shareTaxiToolbar', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/toolbar/map-toolbar.html',
      controller: "toolbarController"
    }
  })
.controller('toolbarController', function($scope, $ionicPopover, $ionicModal){
    $ionicPopover.fromTemplateUrl('components/toolbar/dropdown.html', {
      scope: $scope
    }).then(function(dropdown) {
      $scope.dropdown = dropdown;
    });


    $scope.openDropdown = function($event) {
      console.log($event);
      $scope.dropdown.show($event);
    };
    $scope.closeDropdown = function() {
      $scope.dropdown.hide();
    };

    $ionicModal.fromTemplateUrl('components/location-selector/selector.html', {
      scope: $scope
    }).then(function(popover){
      $scope.popover = popover;
    });
    $scope.openPopover = function($event){
      $scope.popover.show();
      $scope.$broadcast(POPOVER_SHOW_EVENT);
    };
    $scope.closePopover = function(){
      $scope.popover.hide();
    };
    $scope.$on('$destroy', function() {
      $scope.dropdown.remove();
      $scope.popover.remove();
    });
  })
;
