define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:repeatDone
   * @description
   * # repeatDone
   */
  angular.module('xinyangApp.directives.RepeatDone', [])
    .directive('repeatDone', function () {
      return function(scope, element, attrs) {
        if (scope.$last){
          setTimeout(function(){
            scope.$emit('onRepeatLast', element, attrs);
          }, 1);
        }
      };
    });
});
