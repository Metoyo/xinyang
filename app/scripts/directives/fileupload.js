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
        link: function postLink(scope, element, attrs) {
          element.bind('change', function (event) {
            var files = event.target.files;
            //iterate files since 'multiple' may be specified on the element
            for (var i = 0;i<files.length;i++) {
              //emit event upward
              scope.$emit("fileSelected", { file: files[i] });
            }
          });
        }
      };
    });
});
