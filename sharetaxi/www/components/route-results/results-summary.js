angular.module('st.results', ['st.routeDirections'])
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


    //$scope.$on('popover.shown', function(event, args){
    //  console.log(event);
    //  console.log(args.scope.$id);
    //  console.log($scope.$id);
    //});

    function getTotalDistance(directions){
      var total = 0;
      for(var i in directions){
        var route = directions[i].routes[0].legs;
        for(var l in route){
          total += route[l].distance.value;
        }
      }
      return total;
    }

    function getTotalDuration(directions){
      console.log(directions);
      var total = 0;
      for(var i in directions){
        var route = directions[i].routes[0].legs;
        console.log(route)
        for(var l in route){
          console.log(route[l].duration.value)
          total += route[l].duration.value;
        }
      }

      return total;
    }

    function combineLegs(directions){
      var allLegs = []
      for(var i in directions){
        var route = directions[i].routes[0].legs;
        allLegs.push.apply(allLegs, route);
      }
      return allLegs;
    }

    function updateDisplay(){
      $scope.travel_time = getTotalDuration($scope.directions);
      $scope.travel_time_formatted = formatTime($scope.travel_time);
      $scope.legs = combineLegs($scope.directions);
    }

    function formatTime(totalSecs){
      var secs = totalSecs%60;
      var tmins = Math.floor(totalSecs / 60);
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
