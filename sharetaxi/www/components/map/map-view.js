angular.module('st.map',['ngCordova'])
.controller('mapCtrl', function($scope, $cordovaGeolocation, $ionicLoading, $ionicPopover){
    ionic.Platform.ready(onDeviceReady);
    $scope.loadingMessage = 'Acquiring location data...';
    function onDeviceReady() {
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

      $ionicPopover.fromTemplateUrl('components/route-results/results-summary.html', {
        scope: $scope
      }).then(function(popover){
        $scope.resultsPopover = popover;
      });
      $scope.openResultPopover = function(){
        console.log($scope.resultsPopover);
        $scope.resultsPopover.show(document.getElementById("map"));
      };
      $scope.closeResultPopover = function(){
        $scope.resultsPopover.hide();
      };

      $scope.$on(SHOW_DIRECTIONS_RESULT, function(event, result){
        $scope.directions = result;
        $scope.openResultPopover();
      });

      $scope.$on(HIDE_DIRECTIONS_RESULT, function(event, result){
        $scope.closeResultPopover();
      });


      var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };

      function loadGoogleMap(position){
        var lat;
        var long;
        if(position == null){
          lat = 1.3000;
          long = 103.8000;
        }else{
          lat  = position.coords.latitude;
          long = position.coords.longitude;
        }


        function loadMap(google){
          var myLatLng = new google.maps.LatLng(lat, long);
          console.log(myLatLng)
          var mapOptions = {
            center: myLatLng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false
          };

          var map = new google.maps.Map(document.getElementById("map"), mapOptions);
          //var marker = new google.maps.Marker({
          //  position: myLatLng,
          //  map: map,
          //});

          $scope.map = map;
          //$scope.marker = marker;
          $scope.latLng = myLatLng;
          //$scope.geocoder = new google.maps.Geocoder;
          //$scope.geocoder.geocode({'location': myLatLng}, function(results, status) {
          //  if (status === google.maps.GeocoderStatus.OK) {
          //    $scope.country = results[4].formatted_address;
          //  }
          //});
          $ionicLoading.hide();
        }
        GoogleMapsLoader.load(loadMap);
      }
      $cordovaGeolocation.getCurrentPosition(posOptions).then(loadGoogleMap, function(err) {
        loadGoogleMap(null);
        console.log(err);
      });
    };
  });
