// App entrance

angular.module('sharetaxi', ['ngCordova', 'ionic', 'indexedDB', 'st.map', 'st.selector', 'st.toolbar',
  'st.results', 'st.user.service', 'ngStorage', 'st.routeDetails',
  'st.sidemenu', 'st.intro', 'st.listsaved', 'st.listshared', 'st.sharedmap',
  'st.listfriends', 'st.listjoined' , 'st.routeview', 'ngToast'])
.constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
.constant('fbAppId', '1919268798299218')
.constant('backendPort', 8000)
.config(function($stateProvider, $urlRouterProvider, $indexedDBProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $indexedDBProvider
      .connection('taxiDB')
      .upgradeDatabase(1, function (event, db, tx) {
        console.log("upgrading db")
        var routeStore = db.createObjectStore(ROUTE_STORE_NAME, {keyPath: 'local_id', autoIncrement: true});
        routeStore.createIndex('creator_idx', 'creator_id', {unique: false});
        routeStore.createIndex('route_id_idx', 'route_id', {unique: false});
        var rideStore = db.createObjectStore(RIDESHARE_STORE_NAME, {keyPath: 'ride_share_id'})
        rideStore.createIndex('owner_idx', 'owner.user_id', {unique: false});
        rideStore.createIndex('route_idx', 'route.route_id', {unique: false});
      });

    $stateProvider
      .state('intro', {
        url: '/',
        templateUrl: 'components/intro/intro.html',
        controller: 'introCtrl'
      })
      .state('routeview', {
        url: '^/routemap/:rideId/:routeId',
        templateUrl: 'components/map/route-view.html',
        controller: 'routeViewCtrl'
      })
      .state('mapview', {
        //routeId here refers to local_id because the routes are not necessarily stored on the server.
        url: '^/main/:routeId',
        templateUrl: 'components/map/map-view.html',
        controller: 'mapCtrl'
      })
      .state('saved', {
        url: '^/saved',
        templateUrl: 'components/list/list-saved.html',
        controller: 'listSavedController'
      })
      .state('shared', {
        url: '^/shared',
        templateUrl: 'components/list/list-shared.html',
        controller: 'listSharedCtrl'
      })
      .state('sharedmap', {
        url: '^/sharedmap/:rideId',
        templateUrl: 'components/map/map-shared.html',
        controller: 'sharedMapCtrl'
      })
      .state('friends', {
        url: '^/friends',
        templateUrl: 'components/list/list-friends.html',
        controller: 'listFriendsCtrl'
      })
      .state('joined', {
        url: '^/joined',
        templateUrl: 'components/list/list-joined.html',
        controller: 'listJoinedCtrl'
      })
    $urlRouterProvider.otherwise('/main/');
  })
.run(function($ionicPlatform, $localStorage) {
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
.controller('mainCtrl', function(googleApiKey, $rootScope, $state, $scope,
                                 $ionicSideMenuDelegate, userService, $localStorage, $window){
  GoogleMapsLoader.KEY = googleApiKey;
  GoogleMapsLoader.LIBRARIES = ['places'];
  ionic.Platform.ready(function(){

    // will execute when device is ready, or immediately if the device is already ready.
    $ionicSideMenuDelegate.canDragContent(false);


    runApp();

  });

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.goToMainAndToggleLeft = function(){
    $scope.toggleLeft();
    if($rootScope.visitedEdit){
      $rootScope.visitedEdit = false;
      $window.location.href = "/main/";
    }else{
      $state.go('mapview');
    }
  }

  $rootScope.login = function(){
      userService.fbLogin().then(function(result){
        $rootScope.isLoggedIn = result;
        userService.loadFriends();
      });
  };
  $rootScope.logout = function(){
    userService.logout().then(function(result){
      if(result.data.success == true){
        $rootScope.isLoggedIn = false;
        $localStorage.$reset();
        $window.location.reload();
      }
    });
  };

    function checkAppCacheForUpdates(){
      if (window.applicationCache) {
        applicationCache.addEventListener('updateready', function() {
          $window.location.reload();
        });
      }
    }

    function runApp(){
      checkAppCacheForUpdates();
      if(navigator.onLine){
        userService.getServerLoginStatus().then(function(result){
          if(result.data.loggedIn == true){
            userService.getFbLoginStatus().then(function(result){
              console.log(result);
              if(result.status === 'connected'){
                $rootScope.isLoggedIn = true;
                userService.loadFriends();
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
        $state.go('saved');
      }
    }

});

