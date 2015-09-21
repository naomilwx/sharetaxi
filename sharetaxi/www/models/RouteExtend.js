angular.module('models.routeextend', ['models.route', 'st.service'])
  .factory('RouteExtend', function(Route){
    function RouteExtend(){
      this.route = new Route;
      this.original_route_id = -1;
    }

    RouteExtend.prototype.toBackendObject = function(){
      var routeObj = this.route.toBackendObject();
      routeObj.original_route_id = this.original_route_id;
      return routeObj;
    };

    RouteExtend.buildFromBackendObject = function(obj){
      var re = new RouteExtend();
      re.route = Route.buildFromBackendObject(obj);
      re.original_route_id = obj.original_route_id;
      return re;
    };

    return RouteExtend;
  });
