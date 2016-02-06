(function() {
  'use strict';

  angular
    .module('chosen2')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
