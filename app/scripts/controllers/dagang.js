define(['angular','config', 'mathjax', 'jquery', 'underscore'], function (angular, config, mathjax, $, _) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:DagangCtrl
   * @description
   * # DagangCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.DagangCtrl', [])
    .controller('DagangCtrl', ['$rootScope', '$scope', '$http', '$timeout', 'DataService',
      function ($rootScope, $scope, $http, $timeout, DataService) {
        //声明变量
        var userInfo = $rootScope.session.userInfo;
        var info = $rootScope.session.info;
        var baseAPIUrl = config.apiurl_mt; //renzheng的api
        var baseMtAPIUrl = config.apiurl_mt; //mingti的api
        var token = config.token;
        var caozuoyuan = info.UID;
        var jigouid = userInfo.JIGOU[0].JIGOU_ID;
        var lingyuid = $rootScope.session.defaultLyId;
        var chaxunzilingyu = true;
        var qryPriDgBaseUrl = baseAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan
            + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&leixing=2';
        var qryPubDgBaseUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid='
            + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&leixing=1'; //查询公共知识大纲的url
        var qryMoRenDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid='
            + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&moren=1'; //查询默认知识大纲的url
        var qryKnowledgeBaseUrl = baseAPIUrl + 'chaxun_zhishidagang_zhishidian?token=' + token + '&caozuoyuan=' + caozuoyuan
            + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&zhishidagangid=';
        var submitDataUrl = baseAPIUrl + 'xiugai_zhishidagang'; //修改/新建知识大纲
        var dgdata = {
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju:{}
          };//定义一个空的object用来存放需要保存的数据；根据api需求设定的字段名称
        var publicKnowledgeData = ''; //存放领域下的公共知识点
        var zsdgZsdArr = []; //大纲管理页面，选择自建知识大纲，存放选中的知识大纲知识点id

        $rootScope.isRenZheng = false; //判读页面是不是认证
        $scope.prDgBtnDisabled = true; //自建大纲的保存和用作默认大纲按钮是否可点
        $scope.publicZsdgList = []; //存放公共知识大纲的数组
        $scope.privateZsdgList = []; //存放自建知识大纲的数组
        $scope.daGangParam = { //大纲参数
          selected_dg: '',
          showDaGangAsNew: false,
          defaultDaGangId: '', //获得默认知识大纲的ID
          defaultDaGangLeiXing: '', //获得默认知识大纲类型
          zsdKind: '' //知识点类型
        };

        /**
         * 查询默认知识大纲
         */
        var getMoRenDaGangFun = function(){
          $http.get(qryMoRenDgUrl).success(function(data){
            if(data && data.length > 0){
              $scope.defaultDaGang = data[0].ZHISHIDAGANGMINGCHENG;
              $scope.daGangParam.defaultDaGangId = data[0].ZHISHIDAGANG_ID;
              $scope.daGangParam.defaultDaGangLeiXing = data[0].LEIXING;
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
            getPubDaGangListFun();
            getPriDaGangListFun();
          });
        };
        getMoRenDaGangFun();

        /**
         * 加载公共知识大纲
         */
        var getPubDaGangListFun = function(){
          $scope.publicZsdgList = []; //存放公共知识大纲的数组
          $http.get(qryPubDgBaseUrl).success(function(data){
            if(data && data.length > 0){
              $scope.publicZsdgList = data;
            }
            else{
              DataService.alertInfFun('err', data.error);
              $scope.publicZsdgList = [];
            }
          });
        };

        /**
         * 加载自建知识大纲
         */
        var getPriDaGangListFun = function(){
          $scope.privateZsdgList = []; //存放自建知识大纲的数组
          $http.get(qryPriDgBaseUrl).success(function(data){
            if(data && data.length > 0){
              $scope.privateZsdgList = data;
            }
            else{
              DataService.alertInfFun('err', data.error);
              $scope.privateZsdgList = [];
            }
          });
        };

        /**
         * 返回大纲首页
         */
        var backToDaGangHome = function(){
          $scope.isPrivateDg = false;
          $scope.isPublicDg = false;
          $scope.daGangParam.selected_dg = '';
          $scope.selectZjDgId = '';
          $scope.publicKnowledge = '';
          $scope.daGangParam.zsdKind = '';
        };

        /**
         *加载对应的大纲页面
         */
        $scope.renderDgPage = function(lx){
          $scope.daGangParam.showDaGangAsNew = false;
          backToDaGangHome();
          $scope.selectZjDgId = ''; //已经选择的自建知识大纲的值
          if(!$scope.privateZsdgList.length){
            DataService.alertInfFun('pmt', '没有大纲，请新建一个！');
          }
          $scope.dgTpl = 'views/dagang/daGangPrivate.html';
          $scope.isPrivateDg = true;
          $scope.isPublicDg = false;
          $scope.knowledgePr = '';
          $scope.prDgBtnDisabled = true;
          $scope.daGangParam.activeIdx = 2;
          if($scope.daGangParam.defaultDaGangLeiXing == lx){
            $scope.getPrivateDgZsd($scope.daGangParam.defaultDaGangId);
          }
        };
        $scope.renderDgPage('2');

        /**
         * 获得自建知识大纲获知识点
         */
        $scope.getPrivateDgZsd = function(dgId){
          $scope.selectZjDgId = dgId;
          $scope.loadingImgShow = true;
          zsdgZsdArr = []; //存放知识大纲知识点

          //得到知识大纲知识点的递归函数
          function _do(item) {
            zsdgZsdArr.push(item.ZHISHIDIAN_ID);
            if(item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0){
              _.each(item.ZIJIEDIAN, _do);
            }
          }
          if(dgId){
            $scope.currentDgId = dgId;
            //为保存大纲用到的数据赋值
            var privateDg = _.findWhere($scope.privateZsdgList, { ZHISHIDAGANG_ID: dgId });
            dgdata.shuju = {};
            dgdata.shuju.ZHISHIDAGANG_ID = dgId;
            dgdata.shuju.ZHISHIDAGANGMINGCHENG = privateDg.ZHISHIDAGANGMINGCHENG;
            dgdata.shuju.DAGANGSHUOMING = privateDg.DAGANGSHUOMING;
            dgdata.shuju.GENJIEDIAN_ID = privateDg.GENJIEDIAN_ID;
            dgdata.shuju.LEIXING = 2; //自建知识大纲
            dgdata.shuju.ZHUANGTAI = privateDg.ZHUANGTAI;
            dgdata.shuju.JIEDIAN = [];
            //查询大纲知识点
            var qryDgZsdUrl = qryKnowledgeBaseUrl + dgId;
            $http.get(qryDgZsdUrl).success(function(data) {
              if(data.length){
                $scope.loadingImgShow = false;
                $scope.knowledgePr = data;
                //得到知识大纲知识点id的函数
                _.each(data, _do);
                $scope.prDgBtnDisabled = false;
              }
              else{
                $scope.loadingImgShow = false;
                $scope.knowledgePr = '';
                $scope.publicKnowledge = publicKnowledgeData;
                DataService.alertInfFun('err', data.error);
                $scope.prDgBtnDisabled = true;
              }
            });
          }
          else{
            //没有所需的大纲时
            $scope.loadingImgShow = false;
            $scope.knowledgePr = '';
            $scope.publicKnowledge = publicKnowledgeData;
            $scope.prDgBtnDisabled = true;
          }
        };

        /**
         * 添加知识点
         */
        $scope.addNd = function(event, nd) {
          var newNd = {};
          newNd.JIEDIAN_ID = '';
          newNd.ZHISHIDIAN_ID = '';
          newNd.JIEDIANLEIXING = 1;
          newNd.JIEDIANXUHAO = nd.ZIJIEDIAN.length + 1;
          newNd.ZHUANGTAI = 1;
          newNd.ZHISHIDIANMINGCHENG = '';
          newNd.LEIXING = 2;
          newNd.ZHISHIDIAN_LEIXING = 2;
          newNd.ZIJIEDIAN = [];
          nd.ZIJIEDIAN.push(newNd);
          var parentNd = $(event.target),
            focusFun = function() {
              parentNd.closest('.media-body').find('.media').last().find('input').last().focus();
            };
          $timeout(focusFun, 500);
        };

        /**
         * 删除知识点
         */
        $scope.removeNd = function(parentNd, nd, idx) {
          function getPubZsd(item) {
            if(item.LEIXING){
              var pubZsdObj = _.findWhere(publicKnowledgeData, { ZHISHIDIAN_ID: item.ZHISHIDIAN_ID });
              $scope.publicKnowledge.push(pubZsdObj);
              if(item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0) {
                _.each(item.ZIJIEDIAN, getPubZsd);
              }
            }
          }
          getPubZsd(nd);
          parentNd.ZIJIEDIAN.splice(idx, 1);
        };

        /**
         * 保存知识大纲
         */
        $scope.saveZjDaGangData = function(isSetAsDefaultDg) {
          var countEmpty = true;
          $scope.loadingImgShow = true;
          $scope.prDgBtnDisabled = true;
          //将LEIXING转化为ZHISHIDIAN_LEIXING
          function _do(item) {
            if(!item.LEIXING){
              item.ZHISHIDIAN_LEIXING = 2;
            }
            item.ZHISHIDIANMINGCHENG = item.ZHISHIDIANMINGCHENG.replace(/\s+/g,"");
            if(!item.ZHISHIDIANMINGCHENG){
              countEmpty = false;
            }
            if (item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0) {
              _.each(item.ZIJIEDIAN, _do);
            }
          }
          if($scope.daGangParam.defaultDaGangId == $scope.currentDgId){
            isSetAsDefaultDg = true;
          }
          if($scope.knowledgePr){
            dgdata.shuju.ZHISHIDAGANGMINGCHENG = $scope.knowledgePr[0].ZHISHIDIANMINGCHENG;
            dgdata.shuju.JIEDIAN = $scope.knowledgePr;
            _.each(dgdata.shuju.JIEDIAN, _do);
            if(countEmpty){
              $http.post(submitDataUrl, dgdata).success(function(result) {
                if(result.result){
                  $scope.loadingImgShow = false;
                  //判读是否设置为默认大纲
                  if(isSetAsDefaultDg){
                    $scope.makeDaGangAsDefault(result.id);
                  }
                  getMoRenDaGangFun();
                  //getPubDaGangListFun();
                  //getPriDaGangListFun();
                  $scope.knowledgePr = '';
                  $scope.selectZjDgId = '';
                  $scope.prDgBtnDisabled = true;
                  $scope.daGangParam.selected_dg = '';
                }
                else{
                  $scope.loadingImgShow = false;
                  DataService.alertInfFun('err', '修改大纲失败！');
                  $scope.prDgBtnDisabled = true;
                  $scope.prDgBtnDisabled = false;
                }
              });
            }
            else{
              $scope.loadingImgShow = false; //rz_setDaGang.html
              DataService.alertInfFun('pmt', '知识点名称不能为空！');
              $scope.prDgBtnDisabled = false;
            }
          }
          else{
            $scope.loadingImgShow = false; //rz_setDaGang.html
            DataService.alertInfFun('err', '请选择或新建一个大纲！');
            $scope.prDgBtnDisabled = false;
          }
        };

    }]);
});
