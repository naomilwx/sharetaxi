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

      var avoidErp = (routeOption == AVOID_ERP_KEY);

      this.distanceService.getDistanceMatrix(
        {origins: origins,
        destinations:destinations,
        avoidTolls: avoidErp}, dmCallback);
      function dmCallback(response, status){
        if (status == google.maps.DistanceMatrixStatus.OK) {
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;

          var dist = 0;

          var worst = -1;
          var worst_i = 0;
          var worst_j = 0;

          var nearest = Number.MAX_VALUE;
          var n = 0;
          for (var i = 0; i < origins.length; i++) {
            dist = 0;
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              var metric = element.duration.value;
              if(routeOption == SHORTEST_ROUTE_KEY){
                var metric = element.distance.value;
              }
              dist += metric;
              if(metric > worst){
                worst = metric;
                worst_i = i;
                worst_j = j;
              }
            }
            if(dist < nearest){
              nearest = dist;
              n = i;
            }
          }

          var start = origins[worst_i];
          var lastStart = origins[n];
          var end = destinations[worst_j];
          cb({start: start, end: end, lastStart: lastStart}, status);
        }else{
          cb(response, status);
        }
      }
    }

    function getDirections(origins, fixedPts, destinations, routeOption, cb){
      var o = origins.map(getPlaceQueryForm);
      var f = fixedPts.map(getPlaceQueryForm);
      var d = destinations.map(getPlaceQueryForm);
      var results = {};
      var avoidErp = (routeOption == AVOID_ERP_KEY);

      function getGoogleDirections(start, end, waypoints, optimise, cb){
        this.directionsService.route(
          {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints: waypoints,
          optimizeWaypoints: optimise,
          avoidTolls: avoidErp
        }, cb);
      }

      function runComputation(endPoints, status){
        if(status != google.maps.DistanceMatrixStatus.OK){
          cb(null, status);
        }
        var dPoints = d.filter(function(pt){
          return pt != endPoints.end;
        });
        var sPoints;
        var count = 2;
        function handleGoogleReturn(order){
          return function(response, status){
            if(status == google.maps.DirectionsStatus.OK){
              results[order] = response.routes;
              --count;
              if(count == 0){
                cb(results, status);
              }
            }else{
              cb(null, status);
            }

          }
        }

        if(f.length > 0){
          sPoints = o.filter(function(pt){
            return pt != endPoints.start;
          });
          var num = f.length;
          var firstFixed = f[0];
          var fixedEnd = f[num - 1];
          var fixedWP = f.splice(1, num - 2);
          getGoogleDirections(endPoints.start, firstFixed, sPoints, true, handleGoogleReturn(0));
          var lastNum = 1;
          if(fixedWp.length > 0){
            ++count;
            getGoogleDirections(firstFixed, fixedWP, fixedEnd, false, handleGoogleReturn(1));
            lastNum = 2;
          }
          getGoogleDirections(fixedEnd, endPoints.end, dPoints, true, handleGoogleReturn(lastNum));
        }else{
          sPoints = o.filter(function(pt){
            return (pt != endPoints.start) && (pt!= endPoints.lastStart);
          });
          getGoogleDirections(endPoints.start, endPoints.lastStart, sPoints, true, handleGoogleReturn(0));
          getGoogleDirections(endPoints.lastStart, endPoints.end, dPoints, true, handleGoogleReturn(1));
        }
      }

      getFurthestPair(o, d, routeOption, runComputation);
    }
    return {
      getDirections: getDirections
    }
  })
.factory('displayService', function(){
    function generateDisplayService(google){
      this.directionsDisplay = new google.maps.DirectionsRenderer();
    }
    GoogleMapsLoader.load(generateDisplayService);
    return {
      directionsRenderer: this.directionsDisplay
    }
  });
