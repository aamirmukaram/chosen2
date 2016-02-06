(function () {
  'use strict';

  angular
    .module('chosen2')
    .controller('AuthController', AuthController);

  /** @ngInject */
  function AuthController(AuthFactory, $state) {
    var vm = this;
    vm.email = "";
    vm.password = "";
    vm.userVerified = true;
    vm.login = function () {
      vm.userVerified = AuthFactory.verifyUser(vm.email, vm.password);
      AuthFactory.setUserVerified(vm.userVerified);
      if (vm.userVerified) {
        $state.go('assessment');
      }
    }
  }
})();