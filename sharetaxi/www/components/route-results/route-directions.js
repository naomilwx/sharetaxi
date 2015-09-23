angular.module('st.routeDirections', [])
.controller('routeDirectionsController', function($scope, $sce){

    $scope.formatDisplayAddress = function (address){
      var split = address.split(",");
      if(split.length > 0){
        return split[0];
      }else{
        return address;
      }
    }

    $scope.renderHTML = function(text){
      return $sce.trustAsHtml(text);
    };

  });
