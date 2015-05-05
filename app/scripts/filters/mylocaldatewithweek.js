define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc filter
   * @name xinyangApp.filter:myLocalDateWithWeek
   * @function
   * @description
   * # myLocalDateWithWeek
   * Filter in the xinyangApp.
   */
  angular.module('xinyangApp.filters.MyLocalDateWithWeek', [])
  	.filter('myLocalDateWithWeek', function () {
      return function (input) {
      	return 'myLocalDateWithWeek filter: ' + input;
      };
  	});
});
