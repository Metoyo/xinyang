define(['angular', 'jquery'], function (angular, $) {
  'use strict';

  /**
   * @ngdoc directive
   * @name xinyangApp.directive:hoverSlide
   * @description
   * # hoverSlide
   */
  angular.module('xinyangApp.directives.HoverSlide', [])
    .directive('hoverSlide', function ($timeout) {
      return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
          var slideTarget = '.' + attrs.hoverSlideTarget,
            slideGetval = '.' + attrs.hoverSlideGetval,
            slideSetval = '.' + attrs.hoverSlideSetval,
            timeOut;
          element.hover(
            function () {
              var  cont = element.find(slideGetval).val();
              timeOut = $timeout(function(){
                $(slideSetval).html(cont);
                $(slideTarget).show();
              }, 500);
            },
            function () {
              $timeout.cancel(timeOut);
              $(slideTarget).hide();
              $(slideSetval).html('');
            }
          );
        }
      };
    });
});
