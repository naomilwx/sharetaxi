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
  });
