define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:LingyuCtrl
   * @description
   * # LingyuCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.LingyuCtrl', [])
    .controller('LingyuCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
