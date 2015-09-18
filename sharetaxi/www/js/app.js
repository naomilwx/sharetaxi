// App entrance
angular.module('sharetaxi', ['ionic', 'st.map', 'st.selector', 'st.toolbar', 'st.results', 'ngOpenFB', 'st.user.service'])
  .constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
  .constant('fbAppId', '1919268798299218')
  .constant('backendPort', 8000)
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider){
    $httpProvider.defaults.headers.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.defaults.useXDomain = true;


    $stateProvider
      .state('mapview',{
        url: '/map',
        templateUrl: 'components/map/map-view.html',
        controller: 'mapCtrl'
      })
      .state('routeview', {
        url: '/route/:routeId'
      })
      //.state('test', {
      //  url: '/test',
      //  templateUrl: "components/route-results/results-summary.html",
      //  controller: "resultsSummaryController"
      //})
    $urlRouterProvider.otherwise('/map');
  }])
  .run(function($ionicPlatform, ngFB, fbAppId) {
    ngFB.init({appId: fbAppId});
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
}).controller('mainCtrl', ['googleApiKey', '$scope', '$ionicSideMenuDelegate', 'userService',
              function(googleApiKey, $scope, $ionicSideMenuDelegate, userService){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.login = userService.fbLogin;
}]);
