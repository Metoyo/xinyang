define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:UserCtrl
   * @description
   * # UserCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.UserCtrl', [])
    .controller('UserCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
