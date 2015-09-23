// App entrance

angular.module('sharetaxi', ['ionic', 'indexedDB', 'st.map', 'st.selector', 'st.toolbar', 'st.results', 'ngOpenFB', 'st.user.service', 'ngStorage', 'st.routeDetails', 'st.sidemenu', 'st.intro'])
.constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
.constant('fbAppId', '1919268798299218')
.constant('backendPort', 8000)
.config(function($stateProvider, $urlRouterProvider, $indexedDBProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $indexedDBProvider
      .connection('sharetaxidb')
      .upgradeDatabase(1, function (event, db, tx) {
        console.log("upgrading db")
        var routeStore = db.createObjectStore(ROUTE_STORE_NAME, {keyPath: 'local_id', autoIncrement: true});
        routeStore.createIndex('creator_idx', 'creator_id', {unique: false});
        routeStore.createIndex('route_id_idx', 'route_id', {unique: true});
        var rideStore = db.createObjectStore(RIDESHARE_STORE_NAME, {keyPath: 'ride_share_id'})
        rideStore.createIndex('owner_idx', 'owner.user_id', {unique: false});
        rideStore.createIndex('route_idx', 'route.route_id', {unique: true});
      });

   console.log($indexedDBProvider)
    $stateProvider
      .state('intro', {
        url: '/',
        templateUrl: 'components/intro/intro.html',
        controller: 'introCtrl'
      })
      .state('mapview', {
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
      .state('test', {
        url: '/test',
        templateUrl: 'components/share-request/route-details.html',
        controller: 'routeDetails'
      })
    $urlRouterProvider.otherwise('/');
  })
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
.controller('mainCtrl', function(googleApiKey, $rootScope, $scope, $ionicSideMenuDelegate, userService, $localStorage, $timeout){
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
        $rootScope.isLoggedIn = result;
      });
  };
  $scope.logout = function(){
    userService.logout().then(function(result){
      if(result.data.success == true){
        $rootScope.isLoggedIn = false;
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
            $rootScope.isLoggedIn = true;
          }else{
            $rootScope.isLoggedIn = false;
          }
        });
      }else{
        console.log(result.data);
        $rootScope.isLoggedIn = false;
        $localStorage.$reset();
      }
    });
  }else{
    if(userService.getUser().user_id == -1){
      $rootScope.isLoggedIn = false;
    }else{
      $rootScope.isLoggedIn = true;
    }
  }

});

