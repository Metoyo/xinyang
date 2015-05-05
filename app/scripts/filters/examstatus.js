define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc filter
   * @name xinyangApp.filter:examStatus
   * @function
   * @description
   * # examStatus
   * Filter in the xinyangApp.
   */
  angular.module('xinyangApp.filters.ExamStatus', [])
  	.filter('examStatus', function () {
      return function (input) {
      	return 'examStatus filter: ' + input;
      };
  	});
});
