/**
 * Created by naomileow on 24/9/15.
 */
angular.module('st.routemap', ['st.storage', 'vm.map', 'models.route', 'st.service'])
  .controller('routeMapCtrl', function($scope, $stateParams, $ionicLoading, storageService, MapVM, Route, displayService){
    $scope.loadingMessage = 'Acquiring route data...';
    var scopeRef = $scope;
    $scope.route = new Route();
    $scope.resetRoute = function(){
      $scope.route = $scope.oldRoute;
    }
    $ionicLoading.show({
      templateUrl: 'components/spinner/loading-spinner.html',
      scope: $scope
    });
    function loadRoute(){
      var id = parseInt($stateParams.routeId);
      storageService.getRouteByLocalId(id, function(route){
        $scope.route = route;

        displayService.loadMapAtAddress(route.directions.getStartAddress(), function(map){
          MapVM.setMap(map);
        });

        MapVM.displayDirections(route.directions);
        $ionicLoading.hide();
        $scope.oldRoute = Route.buildFromCachedObject(JSON.parse(JSON.stringify((route))));
      });
    }
    $scope.resetDisplayedDirections = function() {
      //TODO:
      $scope.showResult = false;
    }
    $scope.editMode = true;
    loadRoute();
  });
