angular.module('st.results', ['st.routeDirections'])
.directive('resultSummaryFooter', function(){
  return {
    restrict: 'A',
    templateUrl: 'components/route-results/results-summary.html',
  }})
.directive('responseBtns', function(){
  return {
    restrict: 'A',
    templateUrl: 'components/share-request/response-btns.html',
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
      if($scope.directions){
        $scope.travel_time = $scope.directions.getTotalDuration();
        $scope.distance = $scope.directions.getTotalDistance();
        $scope.travel_cost = computeCost($scope.distance);

        $scope.legs = $scope.directions.getAllLegs();
      }
    }
    function computeCost(meters) {
      var cost = 3.20;
      if (meters>1000 && meters<=11000) {
        cost += Math.ceil((meters-1000)/400.0) * 0.22;
      } else if (meters>11000) {
        cost += 5.5 + Math.ceil((meters-11000)/350.0) * 0.22;
      }
      return cost.toFixed(2); // 2 d.p.
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
    $scope.$on(RESET_DIRECTIONS_RESULT, function(event){
      $scope.directions = {};
    });
    if($scope.showResult){
      updateDisplay();
    }

  });
