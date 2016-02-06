(function() {
  'use strict';

  angular
    .module('chosen2')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('assessment', {
        url: '/assessment',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main',
        resolve: {

        }
      })
      .state('auth', {
        url: '/',
        templateUrl: 'app/components/auth/auth.html',
        controller: 'AuthController',
        controllerAs: 'auth',
        resolve: {
        }
      });

    $urlRouterProvider.otherwise('/');
  }

})();
