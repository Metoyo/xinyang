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
      return function (dateStr) {
        var mydate, difMinutes, difMilliseconds;
        if(dateStr){
          mydate = new Date(dateStr);
          difMinutes = mydate.getTimezoneOffset(); //与本地相差的分钟数
          difMilliseconds = mydate.valueOf() + difMinutes * 60 * 1000; //与本地相差的毫秒数
        }
        else{
          difMilliseconds = '';
        }
        return difMilliseconds;
      };
  	});
});
