/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.storage', ['indexedDB', 'ngStorage'])
.factory('storageService', function($indexedDB, $localStorage){
    function saveRoute(route, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        //route = JSON.parse(JSON.stringify(route));
        store.insert(route).then(function(result){
          //Return local_id of inserted object
          cb(result[0]);
        })
      });
    }

    function getAllRoutes(cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.getAll().then(function(result){
          cb(result);
        });
      });
    }

    function getAllRoutesForUser(cb) {
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        var query = store.query();
        console.log(query);
        console.log("debugging");
        query.$index('creator_idx');
        query.$asc();
        if($localStorage.user){
          query.$eq($localStorage.user.user_id);
        }else{
          //Just return all data for users who have not logged in
          query.$eq(-1);
        }

        store.findWhere(query).then(function(result){
          cb(result);
        });
      });
    }
    function updateRoute(route, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        //route = JSON.parse(JSON.stringify(route));
        store.upsert(route).then(function(result){
          cb(result[0]);
        });
      });
    }

    function getRouteById(routeId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.findBy("route_id_idx", routeId).then(function(result){
          cb(result);
        });
      });
    }

    function getRouteByLocalId(localId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.find(localId).then(function(result){
          cb(result);
        });
      });
    }

    function deleteRoute(localId, cb){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        store.delete(localId).then(function(result){
          cb(result);
        });
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
