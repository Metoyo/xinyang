define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:ZujuanCtrl
   * @description
   * # ZujuanCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.ZujuanCtrl', [])
    .controller('ZujuanCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
