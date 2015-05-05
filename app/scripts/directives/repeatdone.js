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
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the repeatDone directive');
        }
      };
    });
});
