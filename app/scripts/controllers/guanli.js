define(['angular', 'config', 'jquery'], function (angular, config, $) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:GuanLiCtrl
   * @description
   * # GuanLiCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.GuanLiCtrl', [])
    .controller('GuanLiCtrl', ['$rootScope', '$scope',
      function ($rootScope, $scope) {
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
        //var baseBmAPIUrl = config.apiurl_bm; //报名的api
        var token = config.token;


        $scope.guanliParams = { //学生controller参数
          tabActive: '',
          yuanGongIn: false,
          addYuanGong: false
        };
        $scope.showKeXuHaoManage = false;
        $scope.kxhInputShow = false;

        /**
         * 考生内容切换
         */
        $scope.guanLiTabSlide = function (tab) {
          $scope.guanliParams.tabActive = '';
          if (tab == 'people') {
            $scope.guanliParams.tabActive = 'people';
            $scope.guanLiTpl = 'views/guanli/renyuan.html'
          }
          if (tab == 'kexuhao') {
            $scope.guanliParams.tabActive = 'kexuhao';
            $scope.guanLiTpl = 'views/guanli/kexuhao.html'
          }
          if (tab == 'bumen') {
            $scope.guanliParams.tabActive = 'bumen';
            $scope.guanLiTpl = 'views/guanli/bumen.html'
          }
        };
        $scope.guanLiTabSlide('kexuhao');

        /**
         * 通过身份证查询员工
         */
        $scope.chaXunYuanGong = function(){
          $scope.guanliParams.yuanGongIn = true;
          $scope.guanliParams.addYuanGong = false;
        };

        /**
         * 新增员工
         */
        $scope.addNewYuanGong = function(){
          $scope.guanliParams.addYuanGong = true;
          $scope.guanliParams.yuanGongIn = false;
          $scope.showKeXuHaoManage = true;
        };

        /**
         * 删除员工
         */
        $scope.deleteYuanGong = function(){
          if(confirm('确定要删除次员工吗？')){
            $scope.guanliParams.yuanGongIn = false;
          }
        };

        /**
         * 重置员工密码
         */
        $scope.resetYuanGongPassword = function(){

        };

        /**
         * 新增课序号
         */
        $scope.addNewKeXuHao = function(){
          $scope.showKeXuHaoManage = true;
        };

        /**
         * 修改课序号
         */
        $scope.modifyKeXuHao = function(){
          $scope.showKeXuHaoManage = true;
        };

        /**
         * 保存课序号修改
         */
        $scope.saveModifyKeXuHao = function(state, idx){
          if(state == 'save'){
            $scope.kxhInputShow = false;
          }
          if(state == 'cancel'){
            $scope.kxhInputShow = false;
          }
        };

        /**
         * 删除课序号
         */
        $scope.deleteKeXuHao = function(){

        };
        /**
         * 删除课序号
         */
        $scope.deleteKeXuHao = function(){

        };

        /**
         * 删除课序号
         */
        $scope.deleteKeXuHao = function(){

        };

        /**
         * 批量增加新员工
         */
        $scope.batchAddNewYuanGong = function(){
          $scope.showKeXuHaoManage = true;
        };

        /**
         * 关闭课序号的弹出层
         */
        $scope.closeKeXuHaoManage = function(){
          $scope.showKeXuHaoManage = false;
        };

      }]);
});
