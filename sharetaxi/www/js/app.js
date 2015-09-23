// App entrance
angular.module('sharetaxi', ['ionic', 'st.map', 'st.selector', 'st.toolbar', 'st.results', 'ngOpenFB', 'st.user.service', 'ngStorage', 'st.routeDetails', 'st.sidemenu', 'st.intro'])
.constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
.constant('fbAppId', '1919268798299218')
.constant('backendPort', 8000)
.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider){
  $locationProvider.html5Mode(true);
  $httpProvider.defaults.headers.withCredentials = true;
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';


  $stateProvider
    .state('intro',{
      url: '/',
      templateUrl: 'components/intro/intro.html',
      controller: 'introCtrl'
    })
    .state('mapview',{
      url: '^/main',
      templateUrl: 'components/map/map-view.html',
      controller: 'mapCtrl'
    })
    .state('routeview', {
      url: '/route/:routeId'
    })
    .state('saved', {
      url: '^/saved',
      templateUrl: 'components/list/list-saved.html'
    })
    .state('shared', {
      url: '^/shared',
      templateUrl: 'components/list/list-shared.html'
    })
    .state('friends', {
      url: '^/friends',
      templateUrl: 'components/list/list-friends.html'
    })
    .state('joined', {
      url: '^/joined',
      templateUrl: 'components/list/list-joined.html'
    })
    .state('test',{
      url:'/test',
      templateUrl: 'components/share-request/route-details.html',
      controller: 'routeDetails'
    })
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
})
.controller('mainCtrl', ['googleApiKey', '$scope', '$ionicSideMenuDelegate', 'userService', '$localStorage', '$ionicLoading', '$timeout',
              function(googleApiKey, $scope, $ionicSideMenuDelegate, userService, $localStorage, $timeout){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];
  
  ionic.Platform.ready(function(){
    // will execute when device is ready, or immediately if the device is already ready.
    $ionicSideMenuDelegate.canDragContent(false);
  });

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.login = function(){
      userService.fbLogin().then(function(result){
        $scope.isLoggedIn = result;
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
        $localStorage.$reset();
      }
    });
  }else{
    if(userService.getUser().user_id == -1){
      $scope.isLoggedIn = false;
    }else{
      $scope.isLoggedIn = true;
    }
  }

}]);

