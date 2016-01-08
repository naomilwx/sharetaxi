angular.module('models.directions', [])
  .factory('Directions', function(){
    function Directions(){
      this.data = {};
    }

    Directions.prototype.isEmpty = function(){
      return Object.keys(this.data).length == 0;
    }

    Directions.prototype.getAllIndexes = function(){
      return Object.keys(this.data);
    }

    Directions.reconstructBounds = function(bounds){
      var sw = bounds.Ga;
      var ne = bounds.Ka;
      var s = new google.maps.LatLng(sw.H, sw.j);
      var n = new google.maps.LatLng(ne.H, ne.j);
      return new google.maps.LatLngBounds(s, n);
    }

    Directions.reconstructPath = function(path){
      for(var i = 0; i<path.length; i++){
        path[i] = Directions.reconstructPoint(path[i]);
      }
      return path;
    }

    Directions.reconstructPoint = function(pt){
      return new google.maps.LatLng(pt.H, pt.L);
    }
    Directions.reconstructDirectionsFromJson = function(json){
      json.routes[0].bounds = Directions.reconstructBounds(json.routes[0].bounds);
      var legs = json.routes[0].legs;
      for(var i = 0; i < legs.length; i++){
        var steps = legs[i].steps;
        json.routes[0].legs[i].end_location = new google.maps.LatLng(legs[i].end_location.H, legs[i].end_location.L);
        json.routes[0].legs[i].start_location = new google.maps.LatLng(legs[i].end_location.H, legs[i].end_location.L);
        for(var j = 0; j < steps.length; j++){
          json.routes[0].legs[i].steps[j].end_location = Directions.reconstructPoint(steps[j].end_location);
          json.routes[0].legs[i].steps[j].end_point = Directions.reconstructPoint(steps[j].end_point);
          json.routes[0].legs[i].steps[j].start_location = Directions.reconstructPoint(steps[j].start_location);
          json.routes[0].legs[i].steps[j].start_point = Directions.reconstructPoint(steps[j].start_point);
        }
      }
      Directions.reconstructPath(json.routes[0].overview_path);
      json.request.destination = Directions.reconstructPoint(json.request.destination);
      json.request.origin = Directions.reconstructPoint(json.request.origin);
      return json;
    }

    Directions.prototype.getIterator = function(){
      var keys = Object.keys(this.data);
      var length = keys.length;
      var index = 0;
      var directions = this.data;
      return {
        next: function() {
          if (!this.hasNext()) {
            return null;
          }
          var dir = directions[index];
          index++;
          return dir;
        },
        hasNext: function() {
          return index < length;
        },
        current: function() {
          return directions[index];
        }
      }
    }

    Directions.prototype.insertDirectionInOrder = function (idx, dir) {
      this.data[idx] = dir;
    }

    Directions.prototype.getDirectionForOrder = function(idx) {
      return this.data[idx];
    }

    Directions.prototype.getTotalDistance = function() {
      var total = 0;
      for(var i in this.data){
        var route = this.getDirectionForOrder(i).routes[0].legs;
        for(var l in route){
          total += route[l].distance.value;
        }
      }
      return total;
    }

    Directions.prototype.getTotalDuration = function() {
      var total = 0;
      for(var i in this.data){
        var route = this.getDirectionForOrder(i).routes[0].legs;
        for(var l in route){
          total += route[l].duration.value;
        }
      }
      return total;
    }

    Directions.prototype.getAllLegs = function() {
      var allLegs = []
      for(var i in this.data){
        var route = this.getDirectionForOrder(i).routes[0].legs;
        allLegs.push.apply(allLegs, route);
      }
      return allLegs;
    }

    Directions.buildFromBackendObject = function(obj){
      var dirs = new Directions();
      if(obj){
        for(var idx in obj){
          var dir =  obj[idx];
          dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
          dirs.insertDirectionInOrder(idx, dir);
        }
        dirs.deserialised = true;
      }

      return dirs;
    }

    Directions.prototype.isDeserialisedDirections = function() {
      if(this.deserialised){
        return true;
      }else{
        return false;
      }
    }

    Directions.prototype.goOnline = function() {
      GoogleMapsLoader.load(function(google){
        if(this.needSerialising){
          var data = this.data;
          for(var idx in data){
            var dir = data[idx];
            dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
            this.insertDirectionInOrder(idx, dir);
          }
          this.needSerialising = false;
        }
      });
    }

    Directions.buildFromCachedObject = function(obj){
      var dirs = new Directions();
      var data = obj.data;
      if(navigator.onLine) {
        for(var idx in obj.data){
          var dir = data[idx];
          dir.deserialisedRes = deserializeDirectionsResult(serializeDirectionsResult(dir.request, dir));
          dirs.insertDirectionInOrder(idx, dir);
        }
      } else {
        dirs.needSerialising = true;
        for(var idx in data){
          dirs.insertDirectionInOrder(idx, data[idx]);
        }
      }
      dirs.deserialised = true;
      return dirs;
    }

    Directions.prototype.toBackendObject = function() {
      return this.data;
    }

    Directions.prototype.getStartAddress = function() {
      var legs = this.getAllLegs();
      if(legs.length > 0){
        var sleg = legs[0];
        return sleg.start_address;
      }
    }

    Directions.prototype.getEndAddress = function() {
      var legs = this.getAllLegs();
      var endIdx = legs.length - 1;
      if(endIdx >= 0){
        return legs[endIdx].end_address;
      }
    }

    Directions.prototype.getStopsInOrder = function() {
      var legs = this.getAllLegs();
      var stops = [];
      var num = legs.length;
      for(var i=0; i < num - 1; i++){
        stops.push(legs[i].start_address);
      }
      stops.push(legs[num - 1].start_address);
      stops.push(legs[num - 1].end_address);
      return stops;
    }

    //Takes Google Maps API v3 directionsRequest and directionsResult objects as input.
//Returns serialized directionsResult string.
    function serializeDirectionsResult (directionsRequest, directionsResult) {
      var copyright = directionsResult.routes[0].copyrights;
      var travelMode = directionsRequest.travelMode;
      var legs = directionsResult.routes[0].legs;
      var steps = [];
      for(var idx = 0; idx < legs.length; idx++){
        var startLat = directionsResult.routes[0].legs[idx].start_location.H;
        var startLng = directionsResult.routes[0].legs[idx].start_location.L;
        var endLat = directionsResult.routes[0].legs[idx].end_location.H;
        var endLng = directionsResult.routes[0].legs[idx].end_location.L;
        for (var i = 0; i < directionsResult.routes[0].legs[idx].steps.length; i++){
          var pathLatLngs = [];
          for (var c = 0; c < directionsResult.routes[0].legs[idx].steps[i].path.length; c++){
            var lat = directionsResult.routes[0].legs[idx].steps[i].path[c].H;
            var lng = directionsResult.routes[0].legs[idx].steps[i].path[c].L;
            pathLatLngs.push( { "lat":lat , "lng":lng }  );
          }
          steps.push( pathLatLngs );
        }
      }
      var serialSteps = JSON.stringify(steps);
      //Return custom serialized directions result object.
      return copyright + "`" + travelMode + "`" + startLat + "`" + startLng + "`" + endLat + "`" + endLng + "`" + serialSteps;
    }

    //Takes serialized directionResult object string as input.
    //Returns directionResult object.
    function deserializeDirectionsResult (serializedResult) {
      var serialArray = serializedResult.split("`");
      const travMode = serialArray[1];
      var directionsRequest = {
        travelMode: travMode,
        origin: new google.maps.LatLng(serialArray[2], serialArray[3]),
        destination: new google.maps.LatLng(serialArray[4], serialArray[5]),
      };
      var directionsResult = {};
      directionsResult.request = directionsRequest;
      directionsResult.routes = [];
      directionsResult.routes[0] = {};
      directionsResult.routes[0].copyrights = serialArray[0];
      directionsResult.routes[0].legs = [];
      directionsResult.routes[0].legs[0] = {};
      directionsResult.routes[0].legs[0].start_location = directionsRequest.origin;
      directionsResult.routes[0].legs[0].end_location = directionsRequest.destination;
      directionsResult.routes[0].legs[0].steps = [];
      var deserializedSteps = JSON.parse(serialArray[6]);
      for (var i = 0; i < deserializedSteps.length; i++){
        var dirStep = {};
        dirStep.path = [];
        for (var c = 0; c < deserializedSteps[i].length; c++){
          var lat = deserializedSteps[i][c].lat;
          var lng = deserializedSteps[i][c].lng;
          var theLatLng = new google.maps.LatLng(lat, lng);
          dirStep.path.push( theLatLng );
        }
        dirStep.travel_mode = travMode;
        directionsResult.routes[0].legs[0].steps.push( dirStep );
      }
      return directionsResult;
    }

    return Directions;
  });
