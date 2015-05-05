define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:hoverSlide
   * @description
   * # hoverSlide
   */
  angular.module('xinyangApp.directives.HoverSlide', [])
    .directive('hoverSlide', function () {
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the hoverSlide directive');
        }
      };
    });
});
