/**
 * Created by naomileow on 18/9/15.
 */
angular.module('st.user.service', ['ngCordova', 'models.user', 'ngStorage'])
.factory('userService', function($q, $http, $location, $localStorage, $cordovaFacebook, backendPort, User){
    var userData = $localStorage.user? $localStorage.user: new User();
    var friends = {};

    function doBackendLogin(response){
      userData.access_token = response.authResponse.accessToken;
      return loginToBackend();
    }

    function loginToBackend(){
      //post to /facebook/token
      var loginUrl = "http://" + $location.host() + ":" + backendPort + "/facebook/token";
      return $http({
        method: 'POST',
        url: loginUrl,
        withCredentials: true,
        data: {
              token: userData.access_token
              }
      }).then(function(response){
        if(response.data.success == true){
          var user = response.data.user;
          userData.name = user.name;
          userData.facebook_id = user.facebook_id;
          userData.user_id = user.user_id;
          $localStorage.user = userData;
          return true;
        }else{
          return false;
        }
      });
    }

    function logoutFromBackend(){
      var logoutUrl = "http://" + $location.host() + ":" + backendPort + "/logout";
      return $http({
        method: 'POST',
        url: logoutUrl,
        withCredentials: true,

      });
    }

    function loadFriends(){
      var url = "http://" + $location.host() + ":" + backendPort +"/user/friends";
      return $http({
        method: 'GET',
        url: url,
        withCredentials: true
      }).then(function(response){
        var res = response.data;
        for(var i = 0; i < res.length; i++){
          var friend = User.buildFromBackendObject(res[i]);
          friends[friend.user_id] = friend;
        }
      });
    }

    function getUserWithId(user_id){
      if($localStorage.user.user_id == user_id){
        return $localStorage.user;
      }else {
        // console.log(friends);
        return friends[user_id];
      }
    }

    function getFriendDetails(user_id){
      //TODO: handle case where friend is not in local data
      return friends[user_id];
    }

    // function getUserDataFromFacebook(cb){
    //   return facebookAPI.api({path:'/me'}).then(function (response) {
    //     userData.name = response.name;
    //     userData.userID = response.id;
    //   });
    // }
    return {
      loadFriends: loadFriends,
      getFriendDetails: getFriendDetails,
      fbLogin: function(){
        var defer = $q.defer();
        // console.log(window.location);
        facebookAPI.login(['email', 'user_friends'], window.location.origin,
          function(response){
            defer.resolve(doBackendLogin(response));
          },
          function(err){
            console.log('Facebook login failed');//TODO:
            defer.resolve(false);
          }
        )
        return defer.promise;
      },
      fbLogout: function(){
        var defer = $q.defer();
        facebookAPI.logout(
          function(response){
            defer.resolve(true);
          },
          function(error){
            defer.resolve(false);
          }
        );
        return defer.promise;
      },
      logout: logoutFromBackend,
      getFbLoginStatus: function(){
        var defer = $q.defer(); 
        facebookAPI.getLoginStatus(
          function (response) {
            // console.log("facebook login response");
            if (response.status === 'connected') {
              doBackendLogin(response);
            }
            defer.resolve(response);
          }
        ,
          function (error){
            console.log(error);
          }
        );
        return defer.promise;
      },
      getServerLoginStatus: function(){
        var url = "http://" + $location.host() + ":" + backendPort + "/getLoginStatus";
        return $http({
          method: 'GET',
          url: url,
          withCredentials: true
        });
      },
      getUser: function(){
        return userData;
      },
      getAccessToken: function(){
        return userData.access_token;
      },
      getUserWithId: getUserWithId
    }

  });
