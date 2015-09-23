/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.storage', ['indexedDB', 'ngStorage', 'models.route'])
.factory('storageService', function($indexedDB, $localStorage, Route){
    function saveRoute(route, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        if($localStorage.user){
          route.creator_id = $localStorage.user.user_id;
        }else{
          route.creator_id = -1;
        }
        store.insert(route).then(function(result){
          //Return local_id of inserted object
          cb(result[0]);
        })
      });
    }

    function getAllRoutes(cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.getAll().then(function(result){
          var routes = result.map(Route.buildFromCachedObject);
          cb(routes);
        });
      });
    }

    function getAllRoutesForUser(cb) {
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        var query = store.query();
        query.$index('creator_idx');
        query.$asc();
        if($localStorage.user){
          query.$eq($localStorage.user.user_id);
        }else{
          //Just return all data for users who have not logged in
          query.$eq(-1);
        }

        store.findWhere(query).then(function(result){
          var routes = result.map(Route.buildFromCachedObject);
          cb(routes);
        });
      });
    }
    function updateRoute(route, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.upsert(route).then(function(result){
          cb(result[0]);
        });
      });
    }

    function getRouteById(routeId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.findBy("route_id_idx", routeId).then(function(result){
          cb(Route.buildFromCachedObject(result));
        });
      });
    }

    function getAllLocalRoutes(cb) {
      //Find routes which are not saved to the server
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        var local = store.query();
        local.$index('route_id_idx');
        local.$eq(-1);
        store.findWhere(local).then(function(result){
          var userId;
          if($localStorage.user){
            userId = $localStorage.user.user_id;
          }else{
            //Just return all data for users who have not logged in
            userId = -1;
          }
          cb(
            result.filter(function(item){
            return item.creator_id == userId;
            }).map(Route.buildFromCachedObject)
          );
        });
      });
    }

    function getRouteByLocalId(localId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.find(localId).then(function(result){
          cb(Route.buildFromCachedObject(result));
        });
      });
    }

    function deleteRoute(localId){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.delete(localId);
      });
    }

    function saveRideShare(rideShare, cb){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        //rideShare = JSON.parse(JSON.stringify(rideShare));
        store.insert(rideShare).then(function(result){
          cb(result[0]);
        });
      });
    }

    function updateRideShare(rideShare, cb){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        //rideShare = JSON.parse(JSON.stringify(rideShare));
        store.upsert(rideShare).then(function(result){
          cb(result[0]);
        });
      });
    }

    function getRideShareById(id, cb){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.find(id).then(function(result){
          cb(result);
        });
      });
    }

    function getRideShareForRoute(route, cb) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.findBy('route_idx', route.route_id).then(function(result){
          cb(result);
        });
      });
    }

    function getRideShareByOwner(owner, cb) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.findBy('owner_idx', owner.user_id).then(function(result){
          cb(result);
        });
      })
    }

    function deleteRideShare(id, cb) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.delete(id).then(function(result){
          cb(result);
        });
      });
    }

    return {
    saveRoute: saveRoute,
    updateRoute: updateRoute,
    getRouteById: getRouteById,
    getRouteByLocalId: getRouteByLocalId,
      getAllLocalRoutes:getAllLocalRoutes,
      getAllRoutesForUser: getAllRoutesForUser,
      getAllRoutes:getAllRoutes,
      deleteRoute: deleteRoute,
      saveRideShare: saveRideShare,
      updateRideShare: updateRideShare,
      getRideShareById: getRideShareById,
      getRideShareForRoute: getRideShareForRoute,
      getRideShareByOwner: getRideShareByOwner,
      deleteRideShare: deleteRideShare
  }
  });
