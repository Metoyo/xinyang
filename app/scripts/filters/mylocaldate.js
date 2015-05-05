define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc filter
   * @name xinyangApp.filter:myLocalDate
   * @function
   * @description
   * # myLocalDate
   * Filter in the xinyangApp.
   */
  angular.module('xinyangApp.filters.MyLocalDate', [])
  	.filter('myLocalDate', function () {
      return function (input) {
      	return 'myLocalDate filter: ' + input;
      };
  	});
});
