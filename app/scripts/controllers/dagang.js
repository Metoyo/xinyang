define(['angular','config', 'jquery', 'underscore'], function (angular, config, $, _) {
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
        var userInfo = $rootScope.session.userInfo,
          info = $rootScope.session.info,
          baseAPIUrl = config.apiurl_mt, //renzheng的api
          baseMtAPIUrl = config.apiurl_mt, //mingti的api
          token = config.token,
          caozuoyuan = info.UID,
          jigouid = userInfo.JIGOU[0].JIGOU_ID,
          lingyuid = $rootScope.session.defaultLyId,
          chaxunzilingyu = true,
          qryPriDgBaseUrl = baseAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan
            + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&leixing=2',
          qryPubDgBaseUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid='
            + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&leixing=1', //查询公共知识大纲的url
          qryMoRenDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid='
            + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&moren=1', //查询默认知识大纲的url
          qryKnowledgeBaseUrl = baseAPIUrl + 'chaxun_zhishidagang_zhishidian?token=' + token + '&caozuoyuan=' + caozuoyuan
            + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&zhishidagangid=',
          xgMoRenDaGangUrl = baseAPIUrl + 'xiugai_morendagang', //修改机构默认大纲
          submitDataUrl = baseAPIUrl + 'xiugai_zhishidagang', //修改/新建知识大纲
          dgdata = {
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju:{}
          },//定义一个空的object用来存放需要保存的数据；根据api需求设定的字段名称
          daGangJieDianData = [], //定义一个大纲节点的数据
          qryPubZsdUrl = baseMtAPIUrl + 'chaxun_zhishidian?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid='
            + jigouid + '&lingyuid=' + lingyuid + '&leixing=', //查询公共专业的url
          publicKnowledgeData = '', //存放领域下的公共专业
          publicZsdArr = [], //存放公共专业id的数组
          zsdgZsdArr = []; //大纲管理页面，选择自建知识大纲，存放选中的知识大纲专业id

        $rootScope.isRenZheng = false; //判读页面是不是认证
        $scope.prDgBtnDisabled = true; //自建大纲的保存和用作默认大纲按钮是否可点
        $scope.publicZsdgList = []; //存放公共知识大纲的数组
        $scope.privateZsdgList = []; //存放自建知识大纲的数组
        $scope.daGangParam = { //大纲参数
          selected_dg: '',
          dgSaveAsName: '',
          showDaGangAsNew: false,
          defaultDaGangId: '', //获得默认知识大纲的ID
          defaultDaGangLeiXing: '', //获得默认知识大纲类型
          zsdKind: '', //专业类型
          activeIdx: 2 //激活标签
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
            getPriDaGangListFun();
          });
        };
        getMoRenDaGangFun();

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
         * 删除共有专业
         */
        var deleteTheSameZsd = function(){
          var differentArr, //从已有的公共专业ID中减去知识大纲专业ID
            needPubZsd, //从已有的公共专业中找到对应专业详情
            diffPubZsdArr = []; //存放删除已使用的知识大纲后公共知识大纲
          //从已有的公共专业中减去知识大纲专业
          differentArr = _.difference(publicZsdArr, zsdgZsdArr);
          //得到相对应的公共知识大纲专业
          _.each(differentArr, function(sgzsd, idx, lst){
            needPubZsd = _.findWhere(publicKnowledgeData, { ZHISHIDIAN_ID: sgzsd });
            diffPubZsdArr.push(needPubZsd);
          });
          return diffPubZsdArr;
        };

        /**
         * 查询该领域的在公共专业或者私有专业, 最新方法!!!!
         */
        $scope.getThisOrgPublicZsd = function(){
          publicKnowledgeData = '';
          publicZsdArr = [];
          $scope.publicKnowledge = '';
          if($scope.daGangParam.zsdKind){
            var qryPubZsd = qryPubZsdUrl + $scope.daGangParam.zsdKind;
            $http.get(qryPubZsd).success(function(ggzsd){
              if(ggzsd && ggzsd.length > 0){
                $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                publicKnowledgeData = ggzsd;
                //得到公共专业id的数组
                publicZsdArr = _.map(ggzsd, function(szsd){
                  return szsd.ZHISHIDIAN_ID;
                });
                if(zsdgZsdArr && zsdgZsdArr.length > 0){
                  $scope.publicKnowledge = deleteTheSameZsd();
                }
                else{
                  $scope.publicKnowledge = ggzsd;
                }
              }
              else{
                $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                DataService.alertInfFun('pmt', '此领域下没有此类型的专业！');
                publicKnowledgeData = '';
              }
            });
          }
        };

        /**
         * 返回大纲首页
         */
        $scope.backToDaGangHome = function(){
          $scope.isPrivateDg = false;
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
          $scope.backToDaGangHome();
          $scope.selectZjDgId = ''; //已经选择的自建知识大纲的值
          if(lx == 2){
            if(!$scope.privateZsdgList.length){
              DataService.alertInfFun('pmt', '没有大纲，请新建一个！');
            }
            $scope.dgTpl = 'views/dagang/daGangPrivate.html';
            $scope.isPrivateDg = true;
            $scope.knowledgePr = '';
            $scope.prDgBtnDisabled = true;
            $scope.daGangParam.activeIdx = 2;
            if($scope.daGangParam.defaultDaGangLeiXing == lx){
              $scope.getPrivateDgZsd($scope.daGangParam.defaultDaGangId);
            }
          }
        };
        $scope.renderDgPage('2');

        /**
         * 获得自建知识大纲获专业
         */
        $scope.getPrivateDgZsd = function(dgId){
          $scope.selectZjDgId = dgId;
          $scope.loadingImgShow = true; //daGangPublic.html & daGangPrivate.html
          zsdgZsdArr = []; //存放知识大纲专业

          //得到知识大纲专业的递归函数
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
            //查询大纲专业
            var qryDgZsdUrl = qryKnowledgeBaseUrl + dgId;
            $http.get(qryDgZsdUrl).success(function(data) {
              if(data.length){
                $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                $scope.knowledgePr = data;
                //得到知识大纲专业id的函数
                _.each(data, _do);
                $scope.publicKnowledge = deleteTheSameZsd();
                $scope.prDgBtnDisabled = false;
              }
              else{
                $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                $scope.knowledgePr = '';
                $scope.publicKnowledge = publicKnowledgeData;
                DataService.alertInfFun('err', data.error);
                $scope.prDgBtnDisabled = true;
              }
            });
          }
          else{
            //没有所需的大纲时
            $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
            $scope.knowledgePr = '';
            $scope.publicKnowledge = publicKnowledgeData;
            $scope.prDgBtnDisabled = true;
          }
        };

        /**
         * 获得公共知识大纲专业
         */
        $scope.getPublicDgZsd = function(dgId){
          if(dgId){
            //查询大纲专业
            $scope.currentDgId = dgId;
            var qryDgZsdUrl = qryKnowledgeBaseUrl + dgId;
            $http.get(qryDgZsdUrl).success(function(data) {
              if(data.length){
                $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                $scope.knowledgePb = data;
              }
              else{
                $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                $scope.knowledgePb = '';
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          else{
            $scope.knowledgePb = '';
          }
        };

        /**
         * 修改默认大纲
         */
        $scope.makeDaGangAsDefault = function(dgId){
          var defaultDg = {
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            dagangid: dgId || $scope.currentDgId
          };
          $http.post(xgMoRenDaGangUrl, defaultDg).success(function(result) {
            if(result.result){
              getMoRenDaGangFun();
              DataService.alertInfFun('suc', '将此大纲设置为默认大纲的操作成功！');
            }
            else{
              DataService.alertInfFun('suc', '将此大纲设置为默认大纲的操作失败！');
            }
          });
        };

        /**
         * 新增一个自建知识大纲
         */
        $scope.addNewZjDg = function(){
          var jieDianObj = {};
          $scope.daGangParam.selected_dg = '';
          //保存大纲时的数据
          dgdata.shuju = {};
          dgdata.shuju.ZHISHIDAGANG_ID = '';
          dgdata.shuju.ZHISHIDAGANGMINGCHENG = '新建' + $rootScope.session.defaultLyName + '自建知识大纲';
          dgdata.shuju.DAGANGSHUOMING = '';
          dgdata.shuju.GENJIEDIAN_ID = '';
          dgdata.shuju.LEIXING = 2; //自建知识大纲
          dgdata.shuju.ZHUANGTAI = 1;
          dgdata.shuju.JIEDIAN = [];

          //保存大纲是用到的第一级子节点
          $scope.knowledgePr = ''; //重置公共知识大纲专业
          daGangJieDianData = []; //定义一个大纲节点的数据
          jieDianObj.JIEDIAN_ID = '';
          jieDianObj.ZHISHIDIAN_ID = '';
          jieDianObj.ZHISHIDIANMINGCHENG = '新建' + $rootScope.session.defaultLyName + '自建知识大纲';
          jieDianObj.ZHISHIDIAN_LEIXING = 2;
          jieDianObj.LEIXING = 2;
          jieDianObj.JIEDIANLEIXING = 0;
          jieDianObj.JIEDIANXUHAO = 1;
          jieDianObj.ZHUANGTAI = 1;
          jieDianObj.ZIJIEDIAN = [];
          jieDianObj.GEN = 1;
          daGangJieDianData.push(jieDianObj);
          $scope.knowledgePr = daGangJieDianData;
          $scope.prDgBtnDisabled = false;
          //用于新建大纲的名称聚焦
          var focusFun = function() {
            $('.dagangBox input').focus();
          };
          $timeout(focusFun, 500);
          $scope.selectZjDgId = ''; //已经选择的自建知识大纲的值
        };

        /**
         * 删除大纲
         */
        $scope.deleteDaGang = function(){
          var deleteZjDgData = {
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju:{
              ZHISHIDAGANG_ID: "",
              ZHUANGTAI: -1
            }
          };
          deleteZjDgData.shuju.ZHISHIDAGANG_ID = $scope.selectZjDgId;
          if(deleteZjDgData.shuju.ZHISHIDAGANG_ID){
            if(confirm("确定要删除此大纲吗？")){
              $http.post(submitDataUrl, deleteZjDgData).success(function(result) {
                if(result.result){
                  $scope.privateZsdgList = _.reject($scope.privateZsdgList, function(zjdg){
                    return zjdg.ZHISHIDAGANG_ID == deleteZjDgData.shuju.ZHISHIDAGANG_ID;
                  });
                  $scope.knowledgePr = '';
                  $scope.selectZjDgId = '';
                  $scope.daGangParam.selected_dg = '';
                }
                else{
                  DataService.alertInfFun('err', result.error);
                }
              });
            }
          }
          else{
            DataService.alertInfFun('pmt', '请选择要删除的大纲！');
          }
          $scope.prDgBtnDisabled = true;
        };

        /**
         * 添加专业
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
         * 删除专业
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
         * 那一个输入框被选中
         */
        var targetInput = '', targetNd = '', oldNdId;
        $scope.privateDgInputIdx = function(event, nd){
          targetNd = '';
          targetInput = '';
          targetInput = $(event.target);
          targetNd = nd;
          oldNdId = nd.ZHISHIDIAN_ID;
        };

        /**
         * 将公共专业添加到知识大纲
         */
        $scope.addToZjDaGang = function(zsd, idx){
          if(targetNd){ //判断聚焦的是那个输入框
            if(targetNd.ZHISHIDIAN_ID){ //判断输入框中是否有专业
              var originData = _.find(publicKnowledgeData, function(pkd){
                return pkd.ZHISHIDIAN_ID == targetNd.ZHISHIDIAN_ID;
              });
              $scope.publicKnowledge.push(originData);
            }
            targetNd.ZHISHIDIAN_ID = zsd.ZHISHIDIAN_ID;
            targetNd.ZHISHIDIANMINGCHENG = zsd.ZHISHIDIANMINGCHENG;
            targetNd.LEIXING = zsd.LEIXING;
            targetNd = '';
            $scope.publicKnowledge.splice(idx, 1);
          }
          else{
            DataService.alertInfFun('pmt', '请选择要输入的目标！');
          }
        };

        /**
         * 当输入介绍后检查公共知识大纲中是否已经存在专业
         */
        $scope.compareZjInputVal = function(nd){
          var str  = nd.ZHISHIDIANMINGCHENG;
          str = str.replace(/\s+/g,"");
          var result = _.findWhere($scope.publicKnowledge, { ZHISHIDIANMINGCHENG: str });
          if(result){
            nd.ZHISHIDIAN_ID = result.ZHISHIDIAN_ID;
            nd.ZHISHIDIANMINGCHENG = result.ZHISHIDIANMINGCHENG;
            nd.LEIXING = result.LEIXING;
            $scope.publicKnowledge = _.reject($scope.publicKnowledge, function(pkg){
              return pkg.ZHISHIDIAN_ID == result.ZHISHIDIAN_ID;
            });
            if(oldNdId){
              if(oldNdId !== result.ZHISHIDIAN_ID){
                var originData = _.find(publicKnowledgeData, function(pkd){
                  return pkd.ZHISHIDIAN_ID == oldNdId;
                });
                $scope.publicKnowledge.push(originData);
              }
            }
          }
        };

        /**
         * 保存知识大纲
         */
        $scope.saveZjDaGangData = function(isSetAsDefaultDg) {
          var countEmpty = true;
          $scope.loadingImgShow = true; //daGangPublic.html & daGangPrivate.html
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
                  $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                  //判读是否设置为默认大纲
                  if(isSetAsDefaultDg){
                    $scope.makeDaGangAsDefault(result.id);
                  }
                  getMoRenDaGangFun();
                  $scope.knowledgePr = '';
                  $scope.selectZjDgId = '';
                  $scope.prDgBtnDisabled = true;
                  $scope.daGangParam.selected_dg = '';
                }
                else{
                  $scope.loadingImgShow = false; //daGangPublic.html & daGangPrivate.html
                  DataService.alertInfFun('err', '修改大纲失败！');
                  $scope.prDgBtnDisabled = true;
                  $scope.prDgBtnDisabled = false;
                }
              });
            }
            else{
              $scope.loadingImgShow = false; //rz_setDaGang.html
              DataService.alertInfFun('pmt', '专业名称不能为空！');
              $scope.prDgBtnDisabled = false;
            }
          }
          else{
            $scope.loadingImgShow = false; //rz_setDaGang.html
            DataService.alertInfFun('err', '请选择或新建一个大纲！');
            $scope.prDgBtnDisabled = false;
          }
        };

        /**
         * 大纲另存为
         */
        $scope.saveDaGangAsNew = function(){
          var saveAdDgData = {
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju: {
              ZHISHIDAGANG_ID: '',
              GENJIEDIAN_ID: '',
              DAGANGSHUOMING: '',
              ZHUANGTAI: 1,
              ZHISHIDAGANGMINGCHENG: '',
              LEIXING: 2,
              JIEDIAN: [
                {
                  JIEDIAN_ID: '',
                  ZHISHIDIAN_ID: '',
                  ZHISHIDIANMINGCHENG: '',
                  ZHISHIDIAN_LEIXING: 2,
                  LEIXING: 2,
                  JIEDIANLEIXING:  0,
                  JIEDIANXUHAO: 1,
                  ZHUANGTAI: 1,
                  GEN: 1,
                  ZIJIEDIAN: []
                }
              ]
            }
          };
          //将节点ID置空的递归函数
          function _do(item) {
            item.JIEDIAN_ID = '';
            if(item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0){
              _.each(item.ZIJIEDIAN, _do);
            }
          }
          //节点数据赋值
          if($scope.knowledgePb && $scope.knowledgePb.length > 0){
            saveAdDgData.shuju.JIEDIAN[0].ZIJIEDIAN = $scope.knowledgePb[0].ZIJIEDIAN;
          }
          if($scope.knowledgePr && $scope.knowledgePr.length > 0){
            saveAdDgData.shuju.JIEDIAN[0].ZIJIEDIAN = $scope.knowledgePr[0].ZIJIEDIAN;
          }
          _.each(saveAdDgData.shuju.JIEDIAN, _do);//将节点ID去掉
          if($scope.daGangParam.dgSaveAsName){
            saveAdDgData.shuju.ZHISHIDAGANGMINGCHENG = $scope.daGangParam.dgSaveAsName;
            saveAdDgData.shuju.JIEDIAN[0].ZHISHIDIANMINGCHENG = $scope.daGangParam.dgSaveAsName;
          }
          else{
            DataService.alertInfFun('pmt', '亲给新大纲起一个名字！');
          }
          if(saveAdDgData.shuju.ZHISHIDAGANGMINGCHENG && saveAdDgData.shuju.LEIXING){
            $http.post(submitDataUrl, saveAdDgData).success(function(result) {
              if(result.result){
                $scope.daGangParam.showDaGangAsNew = false;
                DataService.alertInfFun('suc', '大纲另存为成功！');
                $scope.daGangParam.dgSaveAsName = '';
                getMoRenDaGangFun();
              }
              else{
                DataService.alertInfFun('err', result.error);
              }
            });
          }
        };

    }]);
});
