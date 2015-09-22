/**
 * Created by naomileow on 18/9/15.
 */
angular.module('st.user.service', ['ngOpenFB', 'models.user', 'ngStorage'])
.factory('userService', function($http, $location, $localStorage, ngFB, backendPort, User){
    var userData = $localStorage.user? $localStorage.user: new User();

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

    function getUserDataFromFacebook(cb){
      return ngFB.api({path:'/me'}).then(function (response) {
        userData.name = response.name;
        userData.userID = response.id;
      });
    }
    return {
      fbLogin: function(){
        return ngFB.login({scope: 'email, user_friends'}).then(
          function(response){
            if (response.status === 'connected') {
              return doBackendLogin(response);
            } else {
              console.log('Facebook login failed');//TODO:
              return false;
            }
          }
        )
      },
      fbLogout: function(){
        return ngFB.logout().then(
          function(response){
            logoutFromBackend();
          }
        );
      },
      logout: logoutFromBackend,
      getFbLoginStatus: function(){
        return ngFB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
              doBackendLogin(response);
            }
        });
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
      }
    }

  });
