angular.module('models.sharerequest', ['models.route', 'st.service'])
  .factory('ShareRequest', function(Route){
    function ShareRequest(){
      this.share_request_id = -1;
      this.route = new Route();
      this.ride_id = -1;
    }

    ShareRequest.prototype.toBackendObject = function(){
      var routeObj = this.route.toBackendObject();
      routeObj.ride_id = this.ride_id;
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
      re.ride_id = obj.ride_id;
      return re;
    };

    return ShareRequest;
  });

