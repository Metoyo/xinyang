define(['angular', 'config','jquery', 'underscore'],
  function (angular, config, $, _) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:NavCtrl
   * @description
   * # NavCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.NavCtrl', [])
    .controller('NavCtrl', ['$rootScope', '$scope', '$location', '$http', 'DataService',
      function ($rootScope, $scope, $location, $http, DataService) {
        /**
         * 定义变量
         */
        var userInfo = $rootScope.session.userInfo;
        var caozuoyuan = userInfo.UID;//登录的用户的UID
        var baseRzAPIUrl = config.apiurl_rz; //renzheng的api
        var token = config.token;
        var operateJgUrl = baseRzAPIUrl + 'jigou'; //操作机构基础url
        var modifyJgYh = baseRzAPIUrl + 'jigou_yonghu'; //修改用户的机构

        $scope.userInfoLayer = false;
        $scope.navData = {
          newPsd: '',
          select_ly: '',
          jiGouId: '',
          selected_bm: '', //选择的部门
          selected_bz: '' //选择的班组
        };

        /**
         * 控制导航的代码
         */
        $scope.navClass = function (page) {
          var currentRoute = $location.path().substring(1);
          return page === currentRoute ? 'active' : '';
        };

        /**
         * 显示个人详情
         */
        $rootScope.showUserInfo = function(){
          $scope.originBuMenData = '';
          var qryJiGouUrl = operateJgUrl + '?token=' + token; //查询机构
          $http.get(qryJiGouUrl).success(function(data){
            if(data && data.length > 0){
              $scope.originBuMenData = data[0].CHILDREN[0];
              $scope.userInfoLayer = true;
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          })
        };

        /**
         * 由所选机构得到下面的班组
         */
        $scope.getBanZuByBm = function(bmId){
          $scope.banZuData = '';
          if(bmId){
            var banzu = _.find($scope.originBuMenData.CHILDREN, function(bm){ return bm.JIGOU_ID == bmId; });
            $scope.banZuData = banzu.CHILDREN;
          }
        };

        /**
         * 保存机构信息
         */
        $scope.saveStudentJg = function(){
          var singleWordData = {
            token: token,
            jigouid: '',
            users: [{uid: caozuoyuan , zhuangtai: 1}]
          };
          if($scope.navData.selected_bm){
            if($scope.navData.selected_bz){
              singleWordData.jigouid = $scope.navData.selected_bz;
            }
            else{
              singleWordData.jigouid = $scope.navData.selected_bm;
            }
          }
          $http.post(modifyJgYh, singleWordData).success(function(data){
            if(data.result){
              $scope.navData.selected_bz = '';
              $scope.navData.selected_bm = '';
              $scope.userInfoLayer = false;
              DataService.logout();
              DataService.alertInfFun('suc', '修改成功！');
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         /重新选择时，删除已选择的科目和角色
         */
        //var deleteAllSelectedKmAndJs = function(){
        //  objAndRightList = [];
        //  $scope.objAndRight = objAndRightList;
        //};

        /**
         * 有父领域查询子领域领域（即科目）
         */
        //$scope.getKemuList = function(lyId){
        //  if(lyId){
        //    $http.get(apiLyKm + lyId).success(function(data) {
        //      if(data.length){
        //        _.each($scope.usr.LINGYU, function(hasLy, idx, lst){
        //          data = _.reject(data, function(ly){ return ly.LINGYU_ID  == hasLy.LINGYU_ID; });
        //        });
        //        $scope.kemu_list = data;
        //        deleteAllSelectedKmAndJs();
        //      }
        //      else{
        //        $scope.kemu_list = '';
        //        DataService.alertInfFun('err', '没有对应的科目！');
        //      }
        //    });
        //  }
        //  else{
        //    $scope.kemu_list = '';
        //  }
        //};

        /**
         * 添加科目和权限
         */
        //$scope.getObjectAndRight = function(){
        //  var objAndRightObj = {
        //    lingyu:'',
        //    juese:{
        //      jueseId: '',
        //      jueseName: ''
        //    }
        //  };
        //  objAndRightObj.lingyu = $scope.kemu_list.splice(selectedLingYuIndex, 1);
        //  objAndRightObj.juese.jueseId = selectJueseIdArr;
        //  objAndRightObj.juese.jueseName = selectJueseNameArr;
        //  objAndRightList.push(objAndRightObj);
        //  $scope.objAndRight = objAndRightList;
        //  $('input[name=rightName]:checked').prop('checked', false);
        //  $scope.jueseValue = false;
        //  $scope.linyuValue = false;
        //};

        /**
         * 获得领域lingyu（选择科目）的值
         */
        //var selectedLingYuIndex;
        //$scope.getLingYuVal = function(idx){
        //  selectedLingYuIndex = '';
        //  selectedLingYuIndex = idx;
        //  $scope.linyuValue = idx >=0 ? true : false;
        //};

        /**
         * 获得角色juese（科目权限）的代码
         */
        //var selectJueseIdArr = [],
        //  selectJueseNameArr = [];
        //$scope.getJueSeArr = function(){
        //  selectJueseIdArr = [];
        //  selectJueseNameArr = [];
        //  var jueseItem = $('input[name=rightName]:checked');
        //  _.each(jueseItem,function(js, idx, lst){
        //    selectJueseIdArr.push(js.value);
        //    selectJueseNameArr.push(js.nextElementSibling.textContent);
        //  });
        //  $scope.jueseValue = selectJueseIdArr.length;
        //};

        /**
         *  删除一条已选科目
         */
        //$scope.delSelectedObject = function(idx){
        //  var deleteObjectAndRight = $scope.objAndRight.splice(idx, 1);
        //  $scope.kemu_list.push(deleteObjectAndRight[0].lingyu[0]);
        //};

        /**
         * 关闭个人详情页
         */
        $rootScope.closeUserInfoLayer = function(){
          $scope.userInfoLayer = false;
        };

        ///**
        // * 修改密码
        // */
        //$scope.modifyPassWord = function(){
        //  var newPsdData = {
        //    token: token,
        //    UID: '',
        //    MIMA: ''
        //  };
        //  newPsdData.UID = userInfo.UID;
        //  newPsdData.MIMA = $scope.navData.newPsd;
        //  $('.modifuMiMaInfo').html('');
        //  $http.post(alterYongHu, newPsdData).success(function(data){
        //    if(data.result){
        //      DataService.alertInfFun('suc', '密码修改成功！');
        //    }
        //    else{
        //      DataService.alertInfFun('err', data.error);
        //    }
        //  });
        //};

        /**
         * 退出程序
         */
        $scope.signOut = function(){
          DataService.logout();
        };

        /**
         * 点击相应的模块刷新
         */
        $scope.reloadModule = function(targUrl){
          if($location.$$url == targUrl){
            $location.path($location.$$absUrl);
          }
        };
    }]);
});
