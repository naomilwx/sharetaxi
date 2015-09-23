angular.module('models.user', [])
  .factory('User', function($http){
    function User(){
      this.name = "";
      this.facebook_id = "";
      this.user_id = -1;
    }

    User.buildFromCachedObject = function(obj){
      var user = new User();
      user.name = obj.name;
      user.facebook_id = obj.facebook_id;
      user.user_id = obj.user_id;
      return user;
    }

    User.prototype.toBackendObject = function(){
      return {
        name: this.name,
        facebook_id: this.facebook_id,
        user_id: this.user_id
      }
    };

    User.buildFromBackendObject = function(obj) {
      var user = new User();
      angular.extend(this, obj);
      return user;
    };

    return User;
  });
