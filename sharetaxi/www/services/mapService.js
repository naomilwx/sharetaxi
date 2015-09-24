angular.module('st.service', ['models.directions', 'models.place'])
.factory('directionsService', function(Directions){
    var distanceService;
    var directionsService;
    function generateDistanceService(google){
      distanceService = new google.maps.DistanceMatrixService();
    }
    function generateDirectionsService(google){
      directionsService = new google.maps.DirectionsService();
    }
    GoogleMapsLoader.load(generateDirectionsService);
    GoogleMapsLoader.load(generateDistanceService);

    function getPlaceQueryForm(place){
      var coord = place.location;
      if(coord){
        return coord;
      }else{
        return place.name;
      }
    }
    function getFurthestPair(origins, destinations, routeOption, cb){
      if(origins.length == 1 && destinations.length == 1){
        cb({start: origins[0], end: destinations[0], lastStart: origins[0]}, google.maps.DistanceMatrixStatus.OK);
        return;
      }
      var avoidErp = (routeOption == AVOID_ERP_KEY);

      distanceService.getDistanceMatrix(
        { origins: origins,
          destinations:destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidTolls: avoidErp},
        dmCallback);
      function dmCallback(response, status){
        if (status == google.maps.DistanceMatrixStatus.OK) {
          //var origins = response.originAddresses;
          //var destinations = response.destinationAddresses;

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

    function getGoogleDirections(start, end, stopovers, optimise, avoidErp, cb){

      var waypoints = stopovers.map(function(loc){
        return {location: loc, stopover: true};
      });
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
          durationInTraffic:true,
          waypoints: waypoints,
          optimizeWaypoints: optimise,
          avoidTolls: avoidErp
        }, cb);
    }

    function getDirections(origins, destinations, routeOption, cb){
      var o = origins.map(getPlaceQueryForm);
      var d = destinations.map(getPlaceQueryForm);
      var avoidErp = (routeOption == AVOID_ERP_KEY);
      function runComputation(endPoints, status){
        var results = new Directions();
        if(status != google.maps.DistanceMatrixStatus.OK){
          cb(null, status);
        }

        var sPoints;
        var count = 0;
        function handleGoogleReturn(order){
          return function(response, status){
            if(status == google.maps.DirectionsStatus.OK){
              results.insertDirectionInOrder(order, response);
              --count;
              if(count == 0){
                cb(results, status);
              }
            }else{
              cb(null, status);
            }

          }
        }

        var dPoints = d.filter(function(pt){
          return pt != endPoints.end;
        });

        sPoints = o.filter(function(pt){
          return (pt != endPoints.start) && (pt!= endPoints.lastStart);
        });

        if(o.length >= 2){
          count = 2;
          getGoogleDirections(endPoints.start, endPoints.lastStart, sPoints, true, avoidErp, handleGoogleReturn(0));
          getGoogleDirections(endPoints.lastStart, endPoints.end, dPoints, true, avoidErp, handleGoogleReturn(1));

        }else {
          count = 1;
          //1 starting point. point at endPoints.lastStart will be the starting point too
          getGoogleDirections(endPoints.start, endPoints.end, dPoints, true, avoidErp, handleGoogleReturn(0));
        }
      }
      getFurthestPair(o, d, routeOption, runComputation);
    }
    return {
      getDirections: getDirections,
    }
  })
.factory('displayService', function(){
    function loadMap(lat, long){
      var myLatLng = new google.maps.LatLng(lat, long);

      var map = loadMapAtLocation(myLatLng);
      return {
        location: myLatLng,
        map: map
      }
    }

    function loadMapAtLocation(latLng){

      var mapOptions = {
        center: latLng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
      };
      console.log(mapOptions)
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      return map;
    }

    function displayDirections(renderers, map, directions, displayMarkers){
      var dIterator = directions.getIterator();
      while(dIterator.hasNext()){
        var renderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: !displayMarkers
        });
        var dirs = dIterator.next();
        console.log("next leg");
        if(directions.isDeserialisedDirections()){
          console.log("leg display");
          renderer.setDirections(dirs.deserialisedRes);
        }else{
          renderer.setDirections(dirs);
        }
        renderers.push(renderer);
      }
    }

    function clearDirections(renderers){
      for(var i = 0; i < renderers.length; i++){
        renderers[i].setMap(null);
      }
    }

    function addMarker(place, map) {
      if(place.location){
        var marker = new google.maps.Marker({
          position: place.location,
          title: place.name,
          map: map
        });
        return marker;
      }
    }

    function removeMarker(marker) {
      marker.setMap(null);
    }

    function loadMapAtAddress(address, cb){
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        'address': address
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var map = loadMapAtLocation(results[0].geometry.location);
          cb(map);
        }
      });
    }

    return {
      loadMap: loadMap,
      loadMapAtLocation: loadMapAtLocation,
      loadMapAtAddress: loadMapAtAddress,
      displayDirections: displayDirections,
      clearDirections: clearDirections,
      addMarker: addMarker,
      removeMarker: removeMarker,
    }
  })
  .factory('placeService', function(Place){
    var geocoder;
    function loadGeocoder(google){
      geocoder = new google.maps.Geocoder;
    }
    GoogleMapsLoader.load(loadGeocoder);
    function setPlaceDetails(place, cb){
      if(!place.location){
        geocoder.geocode({address: place.name}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK) {
            var result = new Place(results[0])

            place.place_id = result.place_id;
            place.location = result.location;
            place.formatted_address = result.formatted_address;
            cb(place);
          }
        });
      }else{
        cb(place);
      }
    }

    function getPlace(latLng, cb){
      geocoder.geocode({'location': latLng}, function(results, status) {
        if(status == google.maps.GeocoderStatus.OK){
          cb(new Place(results[0]));
        }
      });
    }

    return {
      getPlace: getPlace,
      setPlaceDetails: setPlaceDetails
    }
  });
