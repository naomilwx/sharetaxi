/**
 * Created by naomileow on 22/9/15.
 */
angular.module('vm.map', ['st.service'])
.factory('MapVM', function($q, displayService, placeService, Place){
    //Stores the map view, location markers and route renderers
    var view = {
      directionRenders: [],
      mapMarkers: {}
    }

    function loadMap(lat, long){
      var result = displayService.loadMap(lat, long);
      view.map = result.map;
      setPosition(result.location);
    }

    function loadMapForElement(elm, lat, long){
      var result = displayService.loadMapForElement(elm, lat, long);
      view.map = result.map;
    }

    function loadMapAtLocation(loc){
      var map = displayService.loadMapAtLocation(loc);
      view.map = map;
    }

    function loadMapAtAddress(addr, cb) {
      displayService.loadMapAtAddress(addr, function(map){
        view.map = map;
        cb();
      });
    }

    function setMap(map){
      view.map = map;
    }

    function getMap(){
      return view.map;
    }

    function clearView(){
      clearDirections();
      clearMarkers();
    }

    function setPosition(myLatLng){
      view.position = myLatLng;
      placeService.getPlace(myLatLng, function(place){
        view.currentPlace = place;
      })
    }

    function getPosition(){
      return view.position;
    }

    function getCurrentPlace() {
      return view.currentPlace;
    }

    function displayDirections(directions, showMarkers){
      //TODO: refactor this process
      displayService.displayDirections(view.directionRenders, view.map, directions, showMarkers);
    }

    function displayOrigins(origins) {
      displayMarkersForPlaces(origins, 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }

    function displayDestinations(destinations) {
      displayMarkersForPlaces(destinations, 'default');
    }

    function displayMarkersForPlaces(places, icon) {
      for(var idx in places){
        var place = places[idx];
        var marker = addMarker(place);
        if(marker && icon !== 'default') {
          marker.setIcon(icon);
        }
      }
    }

    function clearDirections(){
      displayService.clearDirections(view.directionRenders);
      view.directionRenders = [];
    }

    function addPositionMarker(){
      var defer = $q.defer();
      var place = view.currentPlace;
      if(view.positionMarker){
        defer.resolve(null);
      }
      if(!place){
        var pos = view.position;
        placeService.getPlace(pos, function(place){
          view.currentPlace = place;
          displayPositionMarker(place);
          defer.resolve(view.positionMarker);
        })
      }else{
        displayPositionMarker(place);
        defer.resolve(view.positionMarker);
      }
      return defer.promise;
    }

    function displayPositionMarker(place){
      view.positionMarker = displayService.addMarker(place, view.map);
      view.positionMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }

    function removePositionMarker(){
      var marker = view.positionMarker;
      if(marker){
        displayService.removeMarker(marker);
      }
    }
    function addMarker(place) {
      var id = place.place_id;
      var markers = view.mapMarkers;
      if(markers[id] === undefined){
        var marker = displayService.addMarker(place, view.map);
        if(marker){
          markers[id] = marker;
        }
        return marker;
      }
    }

    function removeMarker(place) {
      var marker = view.mapMarkers[place.place_id];
      if(marker){
        displayService.removeMarker(marker);
        delete view.mapMarkers[place.place_id];
      }
    }

    function clearMarkers(){
      for(var id in view.mapMarkers) {
        var marker = view.mapMarkers[id];
        displayService.removeMarker(marker);
        delete view.mapMarkers[id];
      }
    }

    return {
      //setMap: setMap,
      getMap: getMap,
      loadMap: loadMap,
      loadMapAtLocation: loadMapAtLocation,
      loadMapAtAddress: loadMapAtAddress,
      loadMapForElement: loadMapForElement,
      setPosition: setPosition,
      getPosition: getPosition,
      getCurrentPlace: getCurrentPlace,
      addPositionMarker: addPositionMarker,
      removePositionMarker: removePositionMarker,
      clearDirections: clearDirections,
      displayDirections: displayDirections,
      addMarker: addMarker,
      removeMarker: removeMarker,
      clearMarkers: clearMarkers,
      clearView: clearView,
      displayOrigins: displayOrigins,
      displayDestinations: displayDestinations
    }
  });
