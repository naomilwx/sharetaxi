angular.module('models.sharerequest', ['models.route', 'models.directions','st.service'])
  .factory('ShareRequest', function(Route, Directions){
    function ShareRequest(){
      this.share_request_id = -1;
      this.route = new Route();
      this.merged_directions = new Directions();
      this.ride_share_id = -1;
    }

    ShareRequest.createRequestObject = function(rideShare, route){
      var req = new ShareRequest();
      req.route = route;
      req.ride_share_id = rideShare.ride_share_id;
      return req;
    }

    ShareRequest.prototype.toBackendObject = function(){
      var routeObj = this.route.toBackendObject();
      routeObj.ride_id = this.ride_share_id;
      return routeObj;
    };

    ShareRequest.prototype.buildFromCachedObject = function() {
      //TODO: implement local caching
    }

    ShareRequest.buildFromBackendObject = function(obj){
      var re = new ShareRequest();
      if(obj.share_request_id){
        re.share_request_id = obj.share_request_id;
      }
      re.route = Route.buildFromBackendObject(obj);
      re.ride_share_id = obj.ride_id;
      return re;
    };

    return ShareRequest;
  });

