// App entrance
angular.module('sharetaxi', ['ionic', 'st.map', 'st.selector', 'st.toolbar'])
  .constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('mapview',{
        url: '/map',
        templateUrl: 'components/map/map-view.html',
        controller: 'mapCtrl'
      })
      .state('select',{
        url: '/select',
        templateUrl: 'components/location-selector/share-selector.html'
        //controller: 'locationSelector'
      });
    $urlRouterProvider.otherwise('/map');
  }])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).controller('mainCtrl', ['googleApiKey', '$scope', '$ionicSideMenuDelegate', 
              function(googleApiKey, $scope, $ionicSideMenuDelegate){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
}]);