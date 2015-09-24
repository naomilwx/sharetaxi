angular.module('st.sharedmap',['ngCordova', 'vm.map'])
.controller('sharedMapCtrl', function($scope, $cordovaGeolocation, $ionicLoading, MapVM, $state, $stateParams, $ionicScrollDelegate){
  $scope.returnToList = function() {
    console.log("in map view:");
    console.log($stateParams.currRoute); // Doesn't seem to be working. Use routeId?
    $state.go('shared');
  }
  $scope.sharedRouteName = "Going to School";

  $scope.origOption = { sharer: "Justin Yeo",
                      start_points: ["NUS", "Vivocity"],
                      end_points: ["Tampines Mall", "Pasir Ris Park"],
                      deadline: "8:30pm" };

  $scope.routeOptions = [{ sharer: "Someone Neo",
                        start_points: ["NUS", "Vivocity"],
                        end_points: ["Tampines Mall", "Pasir Ris Park"],
                        deadline: "8:30pm" },
                        { sharer: "Naomi Leow",
                        start_points: ["Ang Mo Kio"],
                        end_points: ["NTU"],
                        deadline: "8pm" },
                        { sharer: "Ding Xiangfei",
                        start_points: ["Ang Mo Kio"],
                        end_points: ["NTU"],
                        deadline: "8pm" }];
  
  $scope.activeOpt = $scope.origOption;

  var firstClick = true;
  $scope.tabPressed = function(opt) {
    // Set active button
    $scope.activeOpt = opt;
    if(firstClick && $scope.activeOpt !== $scope.origOption) {
      $ionicScrollDelegate.$getByHandle('tabs-scroll').scrollBy(50, 0, true);
      firstClick = false;
    }
  }

  // $scope.showResult = false;
  // ionic.Platform.ready(onDeviceReady);
  // $scope.loadingMessage = 'Acquiring location data...';
  // function onDeviceReady() {
  //   $ionicLoading.show({
  //     templateUrl: 'components/spinner/loading-spinner.html',
  //     scope: $scope
  //   });

  //   $scope.$on(SHOW_DIRECTIONS_RESULT, function(event, result){
  //     $scope.directions = result;
  //     $scope.showDirectionsResult();
  //     $scope.$broadcast(RESULT_POPOVER_SHOW_EVENT, $scope.directions);
  //   });

  //   $scope.hideDirectionsResult = function(){
  //     $scope.showResult = false;
  //     $scope.$apply();
  //   }

  //   $scope.showDirectionsResult = function(){
  //     $scope.showResult= true;
  //     $scope.$apply();
  //   }


  //   var posOptions = {
  //     enableHighAccuracy: true,
  //     timeout: 20000,
  //     maximumAge: 0
  //   };

  //   function loadGoogleMap(position){
  //     var lat;
  //     var long;
  //     if(position == null){
  //       lat = 1.3000;
  //       long = 103.8000;
  //     }else{
  //       lat  = position.coords.latitude;
  //       long = position.coords.longitude;
  //     }


  //     function loadMap(google){
  //       var myLatLng = new google.maps.LatLng(lat, long);
  //       MapVM.setPosition(myLatLng);
  //       console.log(myLatLng)
  //       var mapOptions = {
  //         center: myLatLng,
  //         zoom: 16,
  //         mapTypeId: google.maps.MapTypeId.ROADMAP,
  //         panControl: false,
  //         zoomControl: false,
  //         mapTypeControl: false,
  //         streetViewControl: false
  //       };

  //       var map = new google.maps.Map(document.getElementById("map"), mapOptions);
  //       MapVM.setMap(map);
  //       MapVM.addPositionMarker();
  //       //$scope.geocoder = new google.maps.Geocoder;
  //       //$scope.geocoder.geocode({'location': myLatLng}, function(results, status) {
  //       //  if (status === google.maps.GeocoderStatus.OK) {
  //       //    $scope.country = results[4].formatted_address;
  //       //  }
  //       //});
  //       $ionicLoading.hide();
  //     }
  //     if(navigator.onLine){
  //       GoogleMapsLoader.load(loadMap);
  //     }else{
  //       $ionicLoading.hide();
  //     }

  //   }

  //   $cordovaGeolocation.getCurrentPosition(posOptions).then(loadGoogleMap, function(err) {
  //     loadGoogleMap(null);
  //     console.log(err);
  //   });
  // };
});
