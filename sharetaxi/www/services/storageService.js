/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.storage', ['indexedDB', 'ngStorage'])
.factory('storageService', function($indexedDB, $localStorage){
    function saveRoute(route){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        return store.insert(route);
      });
    }

    function getAllRoutesForUser() {
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        var query = store.query();
        query.index('creator_idx');
        query.asc();
        if($localStorage.user){
          query.eq($localStorage.user.user_id);
        }

        store.findWhere(query)
      });
    }
    function updateRoute(route){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        return store.upsert(route);
      });
    }

    function getRouteById(routeId){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        return store.findBy("route_id_idx", routeId);
      });
    }

    function getRouteByLocalId(localId){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        return store.find(localId);
      });
    }

    function deleteRoute(localId){
      return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
        return store.delete(localId);
      });
    }

    function saveRideShare(rideShare){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        store.insert(rideShare);
      });
    }

    function updateRideShare(rideShare){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        return store.upsert(rideShare);
      });
    }

    function getRideShareById(id){
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        return store.find(id);
      });
    }

    function getRideShareForRoute(route) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        return store.findBy('route_idx', route.route_id);
      });
    }

    function getRideShareByOwner(owner) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        return store.findBy('owner_idx', owner.user_id);
      })
    }

    function deleteRideShare(id) {
      return $indexedDB.openStore(RIDESHARE_STORE_NAME, function(store) {
        return store.delete(id);
      });
    }

    return {
    saveRoute: saveRoute,
    updateRoute: updateRoute,
    getRouteById: getRouteById,
    getRouteByLocalId: getRouteByLocalId,
      getAllRoutesForUser: getAllRoutesForUser,
      deleteRoute: deleteRoute,
      saveRideShare: saveRideShare,
      updateRideShare: updateRideShare,
      getRideShareById: getRideShareById,
      getRideShareForRoute: getRideShareForRoute,
      getRideShareByOwner: getRideShareByOwner,
      deleteRideShare: deleteRideShare
  }
  });
