define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:KaowuCtrl
   * @description
   * # KaowuCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.KaowuCtrl', [])
    .controller('KaowuCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
