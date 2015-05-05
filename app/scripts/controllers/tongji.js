define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:TongjiCtrl
   * @description
   * # TongjiCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.TongjiCtrl', [])
    .controller('TongjiCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
