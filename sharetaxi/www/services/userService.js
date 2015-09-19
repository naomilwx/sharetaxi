/**
 * Created by naomileow on 18/9/15.
 */
angular.module('st.user.service', ['ngOpenFB'])
.factory('userService', function($http, $location, ngFB, backendPort){
    var userData = {
      accessToken: '',
      name: '',
      userID: ''
    };

    function doBackendLogin(response){
      userData.accessToken = response.authResponse.accessToken;
      getUserDataFromFacebook().then(loginToBackend);
    }

    function loginToBackend(){
      //post to /facebook/token
      var loginUrl = "http://" + $location.host() + ":" + backendPort + "/facebook/token";
      $http({
        method: 'POST',
        url: loginUrl,
        withCredentials: true,
        data: {
              token: userData.accessToken
              }
      }).then(function(response){
        console.log(response);
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
              doBackendLogin(response);
              return true;
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
      getUserId: function(){
        return userData.userID;
      },
      getName: function(){
        return userData.name;
      },
      getAccessToken: function(){
        return userData.accessToken;
      }
    }

  });
