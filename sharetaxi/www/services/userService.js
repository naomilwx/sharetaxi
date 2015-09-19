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

    function loginToBackend(){
      //post to /facebook/token
      var loginUrl = "http://" + $location.host() + ":" + backendPort + "/facebook/token";
      $http({
        method: 'POST',
        url: loginUrl,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: {
              token: userData.accessToken
              }
      }).then(function(response){
        console.log(response);
      });
    }

    function logoutFromBackend(){
      //TODO
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
              userData.accessToken = response.authResponse.accessToken;
              getUserDataFromFacebook().then(loginToBackend);
            } else {
              console.log('Facebook login failed');//TODO:
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
