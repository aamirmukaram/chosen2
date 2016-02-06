(function () {
  'use strict';

  angular
    .module('chosen2')
    .factory('AuthFactory', AuthFactory);

  /** @ngInject */
  function AuthFactory($http) {
    var users = [];
    var currentUser = null;
    var userVerified = false;
    var getUserVerified = function () {
      return userVerified;
    }
    var setUserVerified = function (value) {
      userVerified = value;
    }
    var userRole = null;
    var getUsers = function () {
      $http.get('assets/data/users.json').
        success(function (Data, status, headers, config) {
          users = Data.users;
        }).
        error(function (data, status, headers, config) {
          // log error
        });
    };
    getUsers();
    var verifyUser = function (email, password) {
      for (var x = 0; x < users.length; x++) {
        if (users[x].email == email && users[x].password == password) {
          userVerified = true;
          currentUser = users[x];
        }
      }
      return userVerified;
    };
    return {
      "verifyUser": verifyUser,
      "getUserVerified": getUserVerified,
      "setUserVerified": setUserVerified
    }
  }
})();