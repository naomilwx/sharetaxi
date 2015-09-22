/**
 * Created by naomileow on 22/9/15.
 */
angular.module('st.storage', ['indexedDB'])
.factory('storageService', function($indexedDB){
  function saveRoute(route){
    return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
      store.insert(route);
    });
  }

  function updateRoute(route){
    return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
      store.upsert(route);
    });
  }

  function getRouteById(routeId){
    return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
      store.findBy("route_id_idx", routeId);
    });
  }

  function getRouteByLocalId(localId){
    return $indexedDB.openStore(ROUTE_STORE_NAME, function(store) {
      store.find({"local_id":localId}); //TODO: check this
    });
  }

  return {
    saveRoute: saveRoute,
    updateRoute: updateRoute,
    getRouteById: getRouteById,
    getRouteByLocalId: getRouteByLocalId
  }
  });
