angular.module('st.selector')
.directive('routeDetailsForm', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/location-selector/route-details-form.html',
      controller: "routeDetailsController"
    }
  })
.controller('routeDetailsController', function($scope){
    $scope.disabledDate = function(date, mode) {
      return date < (new Date()).setHours(0,0,0,0);
    };

    $scope.timeOptions = {
      readonlyInput: false,
      showMeridian: false
    };

    $scope.dateStatus = {
      opened: false
    };

    $scope.timeStatus = {
      opened: false
    };

    $scope.openDatePopup = function($event, popup) {
      popup.opened = true;
    };
  });
