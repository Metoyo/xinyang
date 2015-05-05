define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:RenzhengCtrl
   * @description
   * # RenzhengCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.RenzhengCtrl', [])
    .controller('RenzhengCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
