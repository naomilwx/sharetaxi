// App entrance
angular.module('sharetaxi', ['ionic', 'st.map', 'st.selector', 'st.toolbar', 'st.results', 'ngOpenFB', 'st.user.service', 'ngStorage'])
  .constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
  .constant('fbAppId', '1919268798299218')
  .constant('backendPort', 8000)
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';


    $stateProvider
      .state('mapview',{
        url: '/',
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
    $urlRouterProvider.otherwise('/');
  }])
  .run(function($ionicPlatform, $localStorage, ngFB, fbAppId) {
    ngFB.init({appId: fbAppId, tokenStore: $localStorage});
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
}).controller('mainCtrl', ['googleApiKey', '$scope', '$ionicSideMenuDelegate', 'userService', '$localStorage',
              function(googleApiKey, $scope, $ionicSideMenuDelegate, userService, $localStorage){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.login = function(){
      userService.fbLogin().then(function(result){
        if(result === true){
          $scope.isLoggedIn = true;
        }
      });
  };
  $scope.logout = function(){
    userService.logout().then(function(result){
      if(result.data.success == true){
        $scope.isLoggedIn = false;
        $localStorage.$reset();
      }
    });
  };

  if(navigator.onLine){
    userService.getServerLoginStatus().then(function(result){
      if(result.data.loggedIn == true){
        userService.getFbLoginStatus().then(function(result){
          console.log(result);
          if(result.status === 'connected'){
            $scope.isLoggedIn = true;
          }else{
            $scope.isLoggedIn = false;
          }
        });
      }else{
        console.log(result.data);
        $scope.isLoggedIn = false;
      }
    });
  }


}]);

