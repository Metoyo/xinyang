define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:RegisterCtrl
   * @description
   * # RegisterCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.RegisterCtrl', [])
    .controller('RegisterCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
