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
    .controller('GuanLiCtrl', ['$rootScope', '$scope', 'DataService', '$http',
      function ($rootScope, $scope, DataService, $http) {
        /**
         * 定义变量
         */
        $rootScope.isRenZheng = false; //判读页面是不是认证
        /**
         * 声明变量
         */
        var userInfo = $rootScope.session.userInfo;
        var baseRzAPIUrl = config.apiurl_rz; //renzheng的api;
        var token = config.token;
        var caozuoyuan = userInfo.UID;//登录的用户的UID
        var qryJiGouUrl = baseRzAPIUrl + 'jiGou?token=' + token; //查询机构
        var modifyJiGouUrl = baseRzAPIUrl + 'modify_jigou'; //修改机构的url
        var numPerPage = 10; //每页多少条

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
        $scope.glEditBoxShow = ''; //弹出层显示那一部分内容
        $scope.glSelectData = ''; //存放需要传入的数据
        $scope.buMenPages = []; //部门分页
        $scope.worksPages = []; //员工分页
        $scope.originBuMenData = ''; //存放部门的原始数据

        /**
         * 由机构类别查询机构
         */
        var getJgList = function(){
          $scope.originBuMenData = '';
          $scope.loadingImgShow = true;
          var dataLength = ''; //所以二级知识点长度
          var lastPage = ''; //最后一页
          $scope.buMenPages = [];
          DataService.getData(qryJiGouUrl).then(function(data){
            if(data && data.length > 0){
              $scope.originBuMenData = data[0].CHILDREN[0];
              $scope.guanliParams.tabActive = 'bumen';
              $scope.loadingImgShow = false;
              dataLength = $scope.originBuMenData.CHILDREN.length;
              if(dataLength){
                lastPage = Math.ceil(dataLength/numPerPage);
                for(var i = 1; i <= lastPage; i++){
                  $scope.buMenPages.push(i);
                }
              }
              $scope.getThisBuMenPageDate(1);
              $scope.guanLiTpl = 'views/guanli/bumen.html';
            }
            else{
              $scope.loadingImgShow = false;
            }
          });
        };

        /**
         * 得到分页的部门数据 currentBmPageVal
         */
        $scope.getThisBuMenPageDate = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          $scope.currentKsPageVal = pg;
          $scope.buMenData = $scope.originBuMenData.CHILDREN.slice(startPage, endPage);
        };

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
          }
          if (tab == 'bumen') {
            getJgList();
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
          $scope.glEditBoxShow = item;
          if(item == 'modifyKeXuHao'){
            $scope.guanliParams.modifyKxh = data.kxhName;
          }
          if(item == 'modifyBm'){
            $scope.guanliParams.modifyBm = data.JIGOUMINGCHENG;
          }
          $scope.glSelectData = data;
        };

        /**
         * 保存课序号修改
         */
        $scope.saveKeXuHaoModify = function(){
          var saveType = $scope.glEditBoxShow;
          if(saveType == 'addKeXuHao'){ //新增课序号
            if($scope.guanliParams.addNewKxh){
              $http.post(url, shuju).success(function(data){
                if(data.result){
                  $scope.glEditBoxShow = ''; //弹出层显示那一部分内容重置
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
          $scope.glEditBoxShow = ''; //弹出层显示那一部分重置
          $scope.guanliParams.addNewKxh = ''; //课序号重置
        };

        /**
         * 保存部门修改
         */
        $scope.saveBuMenModify = function(){
          var saveType = $scope.glEditBoxShow;
          var bmParam = $scope.glSelectData;
          if(saveType == 'addBuMen'){ //新增课序号
            var newBuMeData = {
              token: token,
              caozuoyuan: caozuoyuan,
              shuju: [
                {
                  JIGOU_ID: bmParam.JIGOU_ID,
                  //JIGOUMINGCHENG: '',
                  //LEIBIE: '',
                  //ZHUANGTAI: '',
                  CHILDREN: [
                    {
                      JIGOU_ID: '',
                      JIGOUMINGCHENG: '',
                      LEIBIE: 2,
                      ZHUANGTAI: 1,
                      CHILDREN: []
                    }
                  ]
                }
              ]
            };
            if($scope.guanliParams.addNewBm){
              newBuMeData.shuju[0].CHILDREN[0].JIGOUMINGCHENG = $scope.guanliParams.addNewBm;
              $http.post(modifyJiGouUrl, newBuMeData).success(function(data){
                if(data.result){
                  console.log(data);
                  getJgList();
                  $scope.glEditBoxShow = ''; //弹出层显示那一部分内容重置
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
