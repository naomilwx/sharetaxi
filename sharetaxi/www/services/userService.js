/**
 * Created by naomileow on 18/9/15.
 */
angular.module('st.user.service', ['ngOpenFB'])
.factory('userService', function($http, ngFB){
    var userData = {
      accessToken: '',
      name: '',
      userID: ''
    };

    function loginToBackend(response){

    }

    function logoutFromBackend(){

    }

    function getUserDataFromFacebook(cb){
      ngFB.api({path:'/me'}).then(function (response) {
        userData.name = response.name;
        userData.userID = response.id;
        cb(response);
      })
    }
    return {
      fbLogin: function(){
        ngFB.login({scope: 'email, user_friends'}).then(
          function(response){
            console.log(response);
            if (response.status === 'connected') {
              userData.accessToken = response.authResponse.accessToken;
              getUserDataFromFacebook(loginToBackend);
            } else {
              console.log('Facebook login failed');//TODO:
            }
          }
        )
      },
      fbLogout: function(){
        ngFB.logout().then(
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
