define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc filter
   * @name xinyangApp.filter:outTiGan
   * @function
   * @description
   * # outTiGan
   * Filter in the xinyangApp.
   */
  angular.module('xinyangApp.filters.OutTiGan', [])
  	.filter('outTiGan', function () {
      return function (input) {
      	return 'outTiGan filter: ' + input;
      };
  	});
});
