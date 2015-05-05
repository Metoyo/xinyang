define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:nanDuStar
   * @description
   * # nanDuStar
   */
  angular.module('xinyangApp.directives.NanDuStar', [])
    .directive('nanDuStar', function () {
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the nanDuStar directive');
        }
      };
    });
});
