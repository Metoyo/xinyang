define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:MingtiCtrl
   * @description
   * # MingtiCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.MingtiCtrl', [])
    .controller('MingtiCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
