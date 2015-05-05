define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:bnSlideShow
   * @description
   * # bnSlideShow
   */
  angular.module('xinyangApp.directives.BnSlideShow', [])
    .directive('bnSlideShow', function () {
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the bnSlideShow directive');
        }
      };
    });
});
