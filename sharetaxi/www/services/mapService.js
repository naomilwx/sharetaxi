angular.module('st.service', [])
.factory('directionsService', function(){
    function generateDistanceService(google){
      this.distanceService = new google.maps.DistanceMatrixService();
    }
    function generateDirectionsService(google){
      this.directionsService = new google.maps.DirectionsService();
    }
    GoogleMapsLoader.load(generateDirectionsService);
    GoogleMapsLoader.load(generateDistanceService);
    function getPlaceQueryForm(place){
      var coord = place.geometry.location;
      if(coord){
        return coord;
      }else{
        return place.name;
      }
    }
    function getFurthestPair(origins, destinations, avoidErp){
      var o = origins.map(getPlaceQueryForm);
      var d = origins.map(getPlaceQueryForm);
      this.distanceService.getDistanceMatrix(
        {origins: o,
        destinations:d,
        avoidTolls: avoidErp}, dmCallback);
      function dmCallback(response, status){
        if (status == google.maps.DistanceMatrixStatus.OK) {
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;

          var worst = -1;
          var worst_i = 0;
          var worst_j = 0;

          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              var distance = element.distance.value;
              var duration = element.duration.value;
              var from = origins[i];
              var to = destinations[j];
            }
          }
        }
      }

    }
  })
.factory('displayService', function(){
    function generateDisplayService(google){
      this.directionsDisplay = new google.maps.DirectionsRenderer();
    }
    GoogleMapsLoader.load(generateDisplayService);
  })
