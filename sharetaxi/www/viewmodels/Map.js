/**
 * Created by naomileow on 22/9/15.
 */
angular.module('vm.map', ['st.service'])
.factory('MapVM', function(displayService, placeService, Place){
    //Stores the map view, location markers and route renderers
    var view = {
      directionRenders: [],
      mapMarkers: {}
    }

    function loadMap(lat, long){
      var result = displayService.loadMap(lat, long);
      view.map = result.map;
      setPosition(result.location);
      console.log(result.location);
    }

    function loadMapAtLocation(loc){
      var map = displayService.loadMapAtLocation(loc);
      view.map = map;
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

    function displayDirections(directions){
      //TODO: refactor this process
      displayService.displayDirections(view.directionRenders, view.map, directions);
    }

    function clearDirections(){
      displayService.clearDirections(view.directionRenders);
      view.directionRenders = [];
    }

    function addPositionMarker(){
      var place = view.currentPlace;
      if(view.positionMarker){
        return;
      }
      if(!place){
        var pos = view.position;
        placeService.getPlace(pos, function(place){
          view.currentPlace = place;
          displayPositionMarker(place);
        })
      }else{
        displayPositionMarker(place);
      }

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
      }
    }

    return {
      //setMap: setMap,
      getMap: getMap,
      loadMap: loadMap,
      loadMapAtLocation: loadMapAtLocation,
      setPosition: setPosition,
      getPosition: getPosition,
      addPositionMarker: addPositionMarker,
      removePositionMarker: removePositionMarker,
      clearDirections: clearDirections,
      displayDirections: displayDirections,
      addMarker: addMarker,
      removeMarker: removeMarker,
      clearMarkers: clearMarkers,
      clearView: clearView
    }
  });
