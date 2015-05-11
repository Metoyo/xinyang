define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:GuanLiCtrl
   * @description
   * # GuanLiCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.GuanLiCtrl', [])
    .controller('GuanLiCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
