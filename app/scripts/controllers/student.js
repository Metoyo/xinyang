define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:StudentCtrl
   * @description
   * # StudentCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.StudentCtrl', [])
    .controller('StudentCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
