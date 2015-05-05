define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:fileUpload
   * @description
   * # fileUpload
   */
  angular.module('xinyangApp.directives.FileUpload', [])
    .directive('fileUpload', function () {
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the fileUpload directive');
        }
      };
    });
});
