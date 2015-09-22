angular.module('st.results', ['st.routeDirections'])
  .directive('resultSummaryFooter', function(){
    return {
      restrict: 'A',
      templateUrl: 'components/route-results/results-summary.html',
    }})
.controller('resultsSummaryController', function($scope, $ionicModal){

    $ionicModal.fromTemplateUrl('components/route-results/route-directions.html', {
      scope: $scope,
    }).then(function(modal){
      $scope.dirModal = modal;
    });
    $scope.showDirections = function(){
      $scope.dirModal.show();
    };
    $scope.hideDirections = function(){
      $scope.dirModal.hide();
    };


    function updateDisplay(){
      $scope.travel_time = $scope.directions.getTotalDuration();
      $scope.distance = $scope.directions.getTotalDistance();

      $scope.legs = $scope.directions.getAllLegs();
    }
    $scope.formatDistance =  function(meters){
      var km = meters / 1000;
      return km.toFixed(1);
    }
    $scope.formatTime = function(totalSecs){
      var secs = totalSecs%60;
      var tmins = Math.floor(totalSecs / 60);
      if(secs >= 30){
        //Round up
        tmins += 1;
      }
      var mins = tmins%60;
      var hours = Math.floor(tmins/60);

      var string = "";
      if(hours > 0){
        string += hours + " hours ";
      }
      if(mins > 0){
        string += mins + " mins";
      }
      return string;
    }

    $scope.$on(RESULT_POPOVER_SHOW_EVENT, function(event, results){
      $scope.directions = results;
      updateDisplay();
    })
  });
