define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:passwordVerify
   * @description
   * # passwordVerify
   */
  angular.module('xinyangApp.directives.PasswordVerify', [])
    .directive('passwordVerify', function () {
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the passwordVerify directive');
        }
      };
    });
});
