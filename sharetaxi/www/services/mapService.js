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
    function getFurthestPair(origins, destinations, routeOption, cb){
      var o = origins.map(getPlaceQueryForm);
      var d = destinations.map(getPlaceQueryForm);
      var avoidErp = (routeOption == AVOID_ERP_KEY);

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
              var metric = element.duration.value;
              if(routeOption == SHORTEST_ROUTE_KEY){
                var metric = element.distance.value;
              }

              if(metric > worst){
                worst = metric;
                worst_i = i;
                worst_j = j;
              }
            }
          }

          var start = origins[worst_i];
          var end = origins[worst_j];
          cb({start: start, end: end}, status);
        }else{
          cb(response, status);
        }
      }
    }

    function getDirections(origins, pitstops, destinations, routeOption, cb){

    }
  })
.factory('displayService', function(){
    function generateDisplayService(google){
      this.directionsDisplay = new google.maps.DirectionsRenderer();
    }
    GoogleMapsLoader.load(generateDisplayService);
  })
