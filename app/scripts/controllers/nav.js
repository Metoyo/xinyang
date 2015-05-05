define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:NavCtrl
   * @description
   * # NavCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.NavCtrl', [])
    .controller('NavCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
