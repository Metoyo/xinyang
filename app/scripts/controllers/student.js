define(['angular', 'config', 'underscore', 'lazy'], function (angular, config, _, lazy) {
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
        var token = config.token;
        var baseKwAPIUrl = config.apiurl_kw; //考务的api
        var baseMtAPIUrl = config.apiurl_mt; //mingti的api
        var baseRzAPIUrl = config.apiurl_rz; //认证的api
        var caozuoyuan = userInfo.UID;//登录的用户的UID   chaxun_kaoshi_liebiao
        var jigouid = userInfo.JIGOU[0].JIGOU_ID || defaultJg;
        var lingyuid = $rootScope.session.defaultLyId;
        var tiKuLingYuId = $rootScope.session.defaultTiKuLyId;
        var lianxiKaiShiUrl = baseKwAPIUrl + 'lianxi_kaishi'; //联系开始的抽题的url
        var chaXunKaoShiUrl = baseKwAPIUrl + 'chaxun_kaoshi_of_kaosheng'; // 查询考生考试
        var startKaoShiUrl = baseKwAPIUrl + 'kaoshi_kaishi'; // 开始考试
        var endKaoShiUrl = baseKwAPIUrl + 'kaoshi_jiaojuan'; // 结束考试
        var kaoShiDaTiUrl = baseKwAPIUrl + 'kaoshi_dati'; // 考试答题
        var lianXiDaTiUrl = baseKwAPIUrl + 'lianxi_dati'; // 考试答题
        var qryMoRenDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid=1'
          + '&lingyuid=2' + '&chaxunzilingyu=true' + '&moren=1'; //查询默认知识大纲的url
        var qryKnowledgeBaseUrl = baseMtAPIUrl + 'chaxun_zhishidagang_zhishidian?token=' + token + '&caozuoyuan=' +
          caozuoyuan + '&jigouid=1' + '&lingyuid=2' + '&zhishidagangid='; //查询知识点基础url
        var qrytimuxiangqingBase = baseMtAPIUrl + 'chaxun_timuxiangqing?token=' + token + '&caozuoyuan=' + caozuoyuan +
          '&jigouid=1' + '&lingyuid=2' + '&timu_id='; //查询题目详情基础url
        var numPerPage = 10; //每页显示多少条数据
        var paginationLength = 11; //显示多少个页码
        var lastDxDa = []; //上一个多选题的答案数组
        var lastDxTm = ''; //上一个多选题
        var xiuGaiYongHu = baseRzAPIUrl + 'xiugai_yonghu';//修改用户

        $scope.stuParams = { //学生controller参数
          stuTabActive: '',
          lxItemNum: '',
          lxTime: '',
          zsdId: '',
          cnNumArr: config.cnNumArr,
          startKaoShiState: false, //考试状态
          startLianXiState: false, //练习状态
          kaoShiName: '', //考试名称
          tmNumPerPage: 10,
          mima: '' //新密码
        };
        $scope.tiMuIdData = ''; //存放题目id的数据
        $scope.tiMuPage = []; //存放题目分页的数据
        $scope.currentTmPageVal = ''; //目前是那一页
        $scope.daTiData = []; //存放已答题目数据
        //$scope.tmNumPerPage = ''; //存放已答题目数据
        $scope.showXiuGaiMiMa = false; //修改密码显示
        $scope.passwordRegexp = /^.{6,20}$/;//密码的正则表达式

        /**
         * 获得大纲数据
         */
        var getDaGangData = function(){
          var zsdgZsdArr = [];
          //得到知识大纲知识点的递归函数
          function _do(item) {
            zsdgZsdArr.push(item.ZHISHIDIAN_ID);
            if(item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0){
              _.each(item.ZIJIEDIAN, _do);
            }
          }
          $http.get(qryMoRenDgUrl).success(function(mrDg){
            if(mrDg && mrDg.length > 0){
              $scope.dgList = mrDg;
              //获取大纲知识点
              var qryKnowledge = qryKnowledgeBaseUrl + mrDg[0].ZHISHIDAGANG_ID;
              $http.get(qryKnowledge).success(function(zsddata){
                if(zsddata.length){
                  $scope.kowledgeList = zsddata[0].ZIJIEDIAN;
                  //得到知识大纲知识点id的函数
                  _.each(zsddata, _do);
                }
                else{
                  DataService.alertInfFun('err', zsddata.error); // '查询大纲失败！错误信息为：' + data.error
                }
              });
            }
            else{
              DataService.alertInfFun('err', mrDg.error);
            }
          });
        };

        /**
         * 查询考试
         */
        var chaXunKaoShi = function(){
          var stuObj = {
            token: token,
            shuju: {
              UID: caozuoyuan,
              JIGOU_ID: 1
            }
          };
          $http.get(chaXunKaoShiUrl, {params: stuObj}).success(function(data){
            if(data && data.length > 0){
              $scope.kaoShiList = data;
            }
            else{
              $scope.kaoShiList = '';
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 考生内容切换
         */
        $scope.stuTabSlide = function(tab){
          $scope.stuParams.stuTabActive = '';
          if(tab == 'practice'){
            getDaGangData();
            $scope.tiMuDetail = [];
            $scope.tiMuDistPage = [];
            $scope.daTiData = [];
            $scope.stuParams.startKaoShiState = false;
            $scope.stuParams.startLianXiState = false;
            $scope.stuParams.kaoShiName = '';
            $scope.stuParams.stuTabActive = 'practice';
            $scope.stuTpl = 'views/student/practice.html'
          }
          if(tab == 'exam'){
            chaXunKaoShi();
            $scope.daTiData = [];
            $scope.tiMuDetail = [];
            $scope.tiMuDistPage = [];
            $scope.stuParams.startKaoShiState = false;
            $scope.stuParams.startLianXiState = false;
            $scope.stuParams.kaoShiName = '';
            $scope.stuParams.stuTabActive = 'exam';
            $scope.stuTpl = 'views/student/exam.html'
          }
          if(tab == 'score'){
            $scope.stuParams.stuTabActive = 'score';
            $scope.stuTpl = 'views/student/score.html'
          }
          lastDxDa = []; //上一个多选题的答案数组
          lastDxTm = ''; //上一个多选题
        };
        $scope.stuTabSlide('exam');

        /**
         * 开始考试
         */
        $scope.startKaoShi = function(ks){
          var ksObj = {
            token: token,
            shuju: {
              UID: caozuoyuan,
              KAOSHI_ID: ks.KAOSHI_ID
            }
          };
          $scope.tiMuIdData = '';
          $scope.tiMuPage = [];
          if(ks.KAOSHI_ID){
            $http.get(startKaoShiUrl, {params: ksObj}).success(function(data){
              if(data.TIMU && data.TIMU.length > 0){
                $scope.kaoShiData = data;
                $scope.tiMuIdData = data.TIMU;
                $scope.stuParams.startKaoShiState = true;
                $scope.stuParams.kaoShiName = ks.KAOSHI_MINGCHENG;
                $scope.changeNumPerPage($scope.stuParams.tmNumPerPage);
              }
              else{
                $scope.kaoShiData = '';
                $scope.tiMuIdData = '';
                $scope.stuParams.startKaoShiState = false;
                $scope.stuParams.kaoShiName = '';
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '缺少考试ID');
          }
        };

        /**
         * 改变每页题目数量
         */
        $scope.changeNumPerPage = function(num){
          numPerPage = num || 10;
          var lastPageNum;
          var tiMuLen;
          $scope.tiMuPage = [];
          $scope.lastTmPageNum = '';
          if($scope.tiMuIdData && $scope.tiMuIdData.length){
            tiMuLen = $scope.tiMuIdData.length;
            lastPageNum = Math.ceil(tiMuLen/numPerPage);
            if(lastPageNum){
              $scope.lastTmPageNum = lastPageNum;
              for(var i = 1; i <= lastPageNum; i++){
                $scope.tiMuPage.push(i);
              }
              $scope.getTiMuDetail(1);
            }
          }
        };

        /**
         * 查询题目详情
         */
        $scope.getTiMuDetail = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          var lastPageNum = $scope.lastTmPageNum;
          $scope.currentTmPageVal = pg;
          //得到分页数组的代码
          var currentPageNum = pg ? pg : 1;
          if(lastPageNum <= paginationLength){
            $scope.tiMuDistPage = $scope.tiMuPage;
          }
          if(lastPageNum > paginationLength){
            if(currentPageNum > 0 && currentPageNum <= 6 ){
              $scope.tiMuDistPage = $scope.tiMuPage.slice(0, paginationLength);
            }
            else if(currentPageNum > lastPageNum - 5 && currentPageNum <= lastPageNum){
              $scope.tiMuDistPage = $scope.tiMuPage.slice(lastPageNum - paginationLength);
            }
            else{
              $scope.tiMuDistPage = $scope.tiMuPage.slice(currentPageNum - 5, currentPageNum + 5);
            }
          }
          var distTiMuId = $scope.tiMuIdData.slice(startPage, endPage);
          var distTiMuIdArr;
          distTiMuIdArr = Lazy(distTiMuId).map(function(tm){
            return tm.TIMU_ID;
          }).toArray();
          var qrytimuxiangqing = qrytimuxiangqingBase + distTiMuIdArr;
          $http.get(qrytimuxiangqing).success(function(data){
            if(data && data.length > 0){
              $scope.tiMuDetail = [];
              var distByTxid = Lazy(data).groupBy('TIXING_ID');
              var stuHasAnsewer = JSON.parse(localStorage.getItem('stuDaArr'));
              Lazy(distByTxid).each(function(v, k, l){
                var tmObj = {daTi: '', tiMu: ''};
                if(k == 1){
                  tmObj.daTi = '单选题';
                }
                if(k == 2){
                  tmObj.daTi = '多选题';
                }
                if(k == 3){
                  tmObj.daTi = '判断题';
                }
                var hasInArr = Lazy(stuHasAnsewer).map(function(hItem){return hItem.TIMU_ID;}).toArray();
                var newInArr = Lazy(v).map(function(nItem){return nItem.TIMU_ID;}).toArray();
                var sameArr = Lazy(hasInArr).intersection(newInArr);
                Lazy(sameArr).each(function(inTm){
                  var hIndex = Lazy(hasInArr).indexOf(inTm);
                  var nIndex = Lazy(newInArr).indexOf(inTm);
                  v[nIndex].ksKsDa = stuHasAnsewer[hIndex].stuDa;
                });
                tmObj.tiMu = v;
                $scope.tiMuDetail.push(tmObj);
              });
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 考试答题 Returns: JSON, {result: true, defen: 1} $scope.daTiData
         */
        $scope.kaoShiDaTi = function(xtm, idxDa, mdDa){
          var dtObj = {
            token: token,
            shuju: {
              ZHUCE_ID: $scope.kaoShiData.ZHUCE_ID,
              TIMU_ID: xtm.TIMU_ID,
              KSDAAN: ''
            }
          };
          if(xtm.TIXING_ID == 1){
            dtObj.shuju.KSDAAN = parseInt(mdDa);
          }
          if(xtm.TIXING_ID == 2){
            if(lastDxTm){
              if(xtm.TIMU_ID == lastDxTm.TIMU_ID){
                if(mdDa){
                  lastDxDa.push(idxDa);
                }
                else{
                  lastDxDa = Lazy(lastDxDa).reject(function(da){return da == idxDa;}).toArray();
                  console.log(lastDxDa);
                }
              }
              else{
                lastDxDa = [];
                lastDxDa.push(idxDa);
                lastDxTm = xtm;
              }
            }
            else{
              lastDxTm = xtm;
              lastDxDa.push(idxDa);
            }
            if(lastDxDa && lastDxDa.length > 0){
              dtObj.shuju.KSDAAN = lastDxDa.join(',');
            }
          }
          if(xtm.TIXING_ID == 4){
            dtObj.shuju.KSDAAN = idxDa;
          }
          if(dtObj.shuju.KSDAAN >= 0 || dtObj.shuju.KSDAAN){
            $http.post(kaoShiDaTiUrl, dtObj).success(function(data){
              if(data.result){
                //存已答题的数据，存放到本地存储
                var hasIn = true;
                Lazy($scope.daTiData).each(function(kstm, idx, lst){
                  if(kstm.TIMU_ID == xtm.TIMU_ID){
                    kstm.stuDa = dtObj.shuju.KSDAAN;
                    hasIn = false;
                  }
                });
                if(hasIn){
                  var daTiObj = {
                    TIMU_ID: xtm.TIMU_ID,
                    stuDa: dtObj.shuju.KSDAAN
                  };
                  $scope.daTiData.push(daTiObj);
                }
                if (window.localStorage){
                  localStorage.setItem('stuDaArr', JSON.stringify($scope.daTiData));
                }
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 结束考试{result: true, defen: 85, zhengque: 85, cuowu: 15}
         */
        $scope.endKaoShi = function(){
          var endObj = {
            token: token,
            shuju: {
              ZHUCE_ID: $scope.kaoShiData.ZHUCE_ID
            }
          };
          $http.post(endKaoShiUrl, endObj).success(function(data){
            if(data.result){
              $scope.stuParams.startKaoShiState = false;
              $scope.stuParams.kaoShiName = '';
              localStorage.removeItem('stuDaArr');
              DataService.alertInfFun('suc', '提交成功！');
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 练习开始的抽题
         */
        $scope.lianXiChouTi = function(){
          var shujuObj = {
            token: token,
            shuju: {
              UID: caozuoyuan,
              JIGOU_ID: 1,
              LINGYU_ID: 2,
              COUNT: $scope.stuParams.lxItemNum,
              ZHISHIDIAN: $scope.stuParams.zsdId,
              shichang: $scope.stuParams.lxTime
            }
          };
          var errArr = [];
          $scope.tiMuIdData = '';
          $scope.tiMuPage = [];
          Lazy(shujuObj.shuju).each(function(v, k, l){
            if(!v){
              switch (k){
                case 'UID':
                  errArr.push('UID');
                  break;
                case 'JIGOU_ID':
                  errArr.push('机构ID');
                  break;
                case 'LINGYU_ID':
                  errArr.push('领域ID');
                  break;
                case 'COUNT':
                  errArr.push('题目数量');
                  break;
                case 'ZHISHIDIAN':
                  errArr.push('知识点');
                  break;
                case 'shichang':
                  errArr.push('练习时长');
                  break;
              }
            }
          });
          if(errArr.length > 0){
            var errInfo = '"' + errArr.join() + '"' + '不能为空！';
            DataService.alertInfFun('pmt', errInfo);
          }
          else{
            $http.get(lianxiKaiShiUrl, {params: shujuObj}).success(function(data){
              if(data.result){
                $scope.lianXiData = data;
                $scope.tiMuIdData = data.TIMU;
                $scope.stuParams.zsdId = '';
                $scope.stuParams.lxItemNum = '';
                $scope.stuParams.startLianXiState = true;
                $scope.changeNumPerPage($scope.stuParams.tmNumPerPage);
              }
              else{
                $scope.lianXiData = '';
                $scope.tiMuIdData = '';
                $scope.stuParams.startLianXiState = false;
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 练习答题 Returns: JSON, {result: true, defen: 1} $scope.daTiData
         */
        $scope.lianXiDaTi = function(xtm, idxDa, mdDa){
          var dtObj = {
            token: token,
            shuju: {
              TIMU_ID: xtm.TIMU_ID,
              ksda: ''
            }
          };
          if(xtm.TIXING_ID == 1){
            dtObj.shuju.ksda = parseInt(mdDa);
          }
          if(xtm.TIXING_ID == 2){
            if(lastDxTm){
              if(xtm.TIMU_ID == lastDxTm.TIMU_ID){
                if(mdDa){
                  lastDxDa.push(idxDa);
                }
                else{
                  lastDxDa = Lazy(lastDxDa).reject(function(da){return da == idxDa;}).toArray();
                  console.log(lastDxDa);
                }
              }
              else{
                lastDxDa = [];
                lastDxDa.push(idxDa);
                lastDxTm = xtm;
              }
            }
            else{
              lastDxTm = xtm;
              lastDxDa.push(idxDa);
            }
            if(lastDxDa && lastDxDa.length > 0){
              dtObj.shuju.ksda = lastDxDa.join(',');
            }
          }
          if(xtm.TIXING_ID == 4){
            dtObj.shuju.ksda = idxDa;
          }
          if(dtObj.shuju.ksda >= 0 || dtObj.shuju.ksda){
            $http.post(lianXiDaTiUrl, dtObj).success(function(data){
              if(data.result){
                //存已答题的数据，存放到本地存储
                var hasIn = true;
                Lazy($scope.daTiData).each(function(kstm, idx, lst){
                  if(kstm.TIMU_ID == xtm.TIMU_ID){
                    kstm.stuDa = dtObj.shuju.ksda;
                    hasIn = false;
                  }
                });
                if(hasIn){
                  var daTiObj = {
                    TIMU_ID: xtm.TIMU_ID,
                    stuDa: dtObj.shuju.ksda
                  };
                  $scope.daTiData.push(daTiObj);
                }
                if (window.localStorage){
                  localStorage.setItem('stuDaArr', JSON.stringify($scope.daTiData));
                }
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 结束练习{result: true, defen: 85, zhengque: 85, cuowu: 15}
         */
        $scope.endLianXi = function(){
          var endObj = {
            token: token,
            shuju: {
              LIANXI_ID: $scope.lianXiData.LIANXI_ID
            }
          };
          $http.post(endKaoShiUrl, endObj).success(function(data){
            if(data.result){
              console.log(data);
              $scope.stuParams.startLianXiState = false;
              localStorage.removeItem('stuDaArr');
              DataService.alertInfFun('suc', '提交成功！');
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 修改密码显示
         */
        $scope.showXiuGaiMiMaShow = function(){
          $scope.showXiuGaiMiMa = true;
        };

        /**
         * 修改密码
         */
        $scope.xiuGaiMiMa = function(){
          var userObj = {
            token: token,
            UID: caozuoyuan,
            MIMA: ''
          };
          if($scope.stuParams.mima){
            userObj.MIMA = $scope.stuParams.mima;
            $http.post(xiuGaiYongHu, userObj).success(function(data){
              if(data.result){
                $scope.showXiuGaiMiMa = false;
                DataService.alertInfFun('suc', '密码修改成功！');
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 取消修改密码 showXiuGaiMiMa
         */
        $scope.closeXiuGaiMiMa = function(){
          $scope.showXiuGaiMiMa = false;
        };

    }]);
});
