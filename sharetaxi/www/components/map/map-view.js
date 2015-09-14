angular.module('st.map',['ngCordova'])
.controller('mapCtrl', function($scope, $cordovaGeolocation, $ionicLoading){
    ionic.Platform.ready(onDeviceReady);
    $scope.loadingMessage = 'Acquiring location data...';
    function onDeviceReady() {
      $ionicLoading.show({
        templateUrl: 'components/spinner/loading-spinner.html',
        scope: $scope
      });

      var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var lat  = position.coords.latitude;
        var long = position.coords.longitude;
        function loadMap(google){
          var myLatLng = new google.maps.LatLng(lat, long);

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

      }, function(err) {
        $ionicLoading.hide();
        console.log(err);
      });
    };
  });
