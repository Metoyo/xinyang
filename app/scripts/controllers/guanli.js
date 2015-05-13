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
    .controller('GuanLiCtrl', ['$rootScope', '$scope', 'DataService',
      function ($rootScope, $scope, DataService) {
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
          addYuanGong: false,
          addNewKxh: '', //添加课序号
          modifyKxh: '',  //修改课序号
          singleWorkName: '', //添加单个员工姓名
          singleWorkID: '', //添加单个员工身份证
          addNewBm: '', //添加新部门
          modifyBm: '' //修改部门
        };
        $scope.showKeXuHaoManage = false;
        $scope.kxhInputShow = false;
        $scope.kxhEditBoxShow = ''; //弹出层显示那一部分内容
        $scope.kxhSelectData = ''; //课序号管理，存放需要传入的数据

        /**
         * 考生内容切换
         */
        $scope.guanLiTabSlide = function (tab) {
          $scope.guanliParams.tabActive = '';
          if (tab == 'people') {
            $scope.guanliParams.tabActive = 'people';
            $scope.guanLiTpl = 'views/guanli/renyuan.html';
          }
          if (tab == 'kexuhao') {
            $scope.guanliParams.tabActive = 'kexuhao';
            $scope.guanLiTpl = 'views/guanli/kexuhao.html';
            $scope.keXuHaoData = [
              {kxhId: 1000, kxhName: '课序号一'},
              {kxhId: 1001, kxhName: '课序号二'}
            ];
          }
          if (tab == 'bumen') {
            $scope.guanliParams.tabActive = 'bumen';
            $scope.guanLiTpl = 'views/guanli/bumen.html';
            $scope.buMenData = [
              {bmId: 1000, bmName: '部门名称一'},
              {bmId: 1001, bmName: '部门名称二'}
            ];
          }
        };
        $scope.guanLiTabSlide('bumen');

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
         * 显示弹出层
         */
        $scope.showKeXuHaoPop = function(item, data){
          $scope.showKeXuHaoManage = true;
          $scope.kxhEditBoxShow = item;
          if(item == 'modifyKeXuHao'){
            $scope.guanliParams.modifyKxh = data.kxhName;
          }
          if(item == 'modifyBm'){
            $scope.guanliParams.modifyBm = data.bmName;
          }
          $scope.kxhSelectData = data;
        };

        /**
         * 保存课序号修改
         */
        $scope.saveKeXuHaoModify = function(){
          var saveType = $scope.kxhEditBoxShow;
          if(saveType == 'addKeXuHao'){ //新增课序号
            if($scope.guanliParams.addNewKxh){
              $http.post(url, shuju).success(function(data){
                if(data.result){
                  $scope.kxhEditBoxShow = ''; //弹出层显示那一部分内容重置
                  $scope.guanliParams.addNewKxh = ''; //课序号重置
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '新课序号为空！');
            }
          }
          if(saveType == 'modifyKeXuHao'){ //修改课序号
            if($scope.guanliParams.modifyKxh){
              alert($scope.guanliParams.modifyKxh);
            }
          }
          if(saveType == 'addSingleWork'){ //添加单个员工
            if($scope.guanliParams.singleWorkName){
              if($scope.guanliParams.singleWorkID){

              }
              else{
                DataService.alertInfFun('pmt', '缺少身份证！');
              }
            }
            else{
              DataService.alertInfFun('pmt', '缺少姓名！');
            }
          }
          if(saveType == 'addBatchWorks'){ //批量添加员工

          }
        };

        /**
         * 删除课序号
         */
        $scope.deleteKeXuHao = function(kxh){
          if(kxh){
            alert(kxh);
          }
        };

        /**
         * 关闭课序号的弹出层
         */
        $scope.closeKeXuHaoManage = function(){
          $scope.showKeXuHaoManage = false;
          $scope.kxhEditBoxShow = ''; //弹出层显示那一部分重置
          $scope.guanliParams.addNewKxh = ''; //课序号重置
        };

        /**
         * 保存部门修改
         */
        $scope.saveBuMenModify = function(){
          var saveType = $scope.kxhEditBoxShow;
          if(saveType == 'addBuMen'){ //新增课序号
            if($scope.guanliParams.addNewBm){
              $http.post(url, shuju).success(function(data){
                if(data.result){
                  $scope.kxhEditBoxShow = ''; //弹出层显示那一部分内容重置
                  $scope.guanliParams.addNewBm = ''; //部门重置
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '新加部门名称为空！');
            }
          }
          if(saveType == 'modifyBm'){ //修改部门
            if($scope.guanliParams.modifyBm){
              alert($scope.guanliParams.modifyBm);
            }
          }
          if(saveType == 'addSingleWork'){ //添加单个员工
            if($scope.guanliParams.singleWorkName){
              if($scope.guanliParams.singleWorkID){

              }
              else{
                DataService.alertInfFun('pmt', '缺少身份证！');
              }
            }
            else{
              DataService.alertInfFun('pmt', '缺少姓名！');
            }
          }
          if(saveType == 'addBatchWorks'){ //批量添加员工

          }
        };


      }]);
});
