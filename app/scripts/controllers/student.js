define(['angular', 'config', 'underscore'], function (angular, config, _) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:StudentCtrl
   * @description
   * # StudentCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.StudentCtrl', [])
    .controller('StudentCtrl', ['$rootScope', '$scope', '$location', '$http', 'DataService',
      function ($rootScope, $scope, $location, $http, DataService) {
        /**
         * 定义变量
         */
        $rootScope.isRenZheng = false; //判读页面是不是认证
        /**
         * 声明变量
         */
        var userInfo = $rootScope.session.userInfo;
        var defaultJg = userInfo.JIGOU;
        var xuehao = userInfo.xuehao;
        var baseBmAPIUrl = config.apiurl_bm; //报名的api
        var token = config.token;


        $scope.stuParams = { //学生controller参数
          stuTabActive: ''
        };

        /**
         * 考生内容切换
         */
        $scope.stuTabSlide = function(tab){
          $scope.stuParams.stuTabActive = '';
          if(tab == 'practice'){
            $scope.stuParams.stuTabActive = 'practice';
            $scope.stuTpl = 'views/student/practice.html'
          }
          if(tab == 'exam'){
            $scope.stuParams.stuTabActive = 'exam';
            $scope.stuTpl = 'views/student/exam.html'
          }
          if(tab == 'score'){
            $scope.stuParams.stuTabActive = 'score';
            $scope.stuTpl = 'views/student/score.html'
          }
        };
        $scope.stuTabSlide('score');

    }]);
});
