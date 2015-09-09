// App entrance
angular.module('sharetaxi', ['ionic', 'st.map'])
  .constant('googleApiKey', 'AIzaSyAgiS9kjfOa_eZ_h9uhIrGukIp_TyMj-_M')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('mapview',{
        url: '/map',
        templateUrl: 'components/map/map-view.html',
        controller: 'mapCtrl'
    });
    $urlRouterProvider.otherwise('/');
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
});
