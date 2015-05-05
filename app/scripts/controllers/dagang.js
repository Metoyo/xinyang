define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:DagangCtrl
   * @description
   * # DagangCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.DagangCtrl', [])
    .controller('DagangCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
