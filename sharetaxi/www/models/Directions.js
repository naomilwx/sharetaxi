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
      dirs.data = obj;
      return dirs;
    }

    Directions.prototype.toBackendObject = function() {
      return this.data;
    }

    return Directions;
  });
