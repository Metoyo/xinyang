define(['angular', 'config', 'jquery', 'underscore', 'lazy', 'moment'], function (angular, config, $, _, lazy, moment) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:StudentCtrl
   * @description
   * # StudentCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.StudentCtrl', [])
    .controller('StudentCtrl', ['$rootScope', '$scope', '$location', '$http', 'DataService', '$interval', '$timeout',
      function ($rootScope, $scope, $location, $http, DataService, $interval, $timeout) {
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
        var lianXiDaTiUrl = baseKwAPIUrl + 'lianxi_dati'; // 练习答题
        var lianJeShuTiUrl = baseKwAPIUrl + 'lianxi_jiaojuan'; // 练习交卷
        var qryMoRenDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid=1'
          + '&lingyuid=2' + '&chaxunzilingyu=true' + '&moren=1'; //查询默认知识大纲的url
        var qryKnowledgeBaseUrl = baseMtAPIUrl + 'chaxun_zhishidagang_zhishidian?token=' + token + '&caozuoyuan=' +
          caozuoyuan + '&jigouid=1' + '&lingyuid=2' + '&zhishidagangid='; //查询专业基础url
        var qrytimuxiangqingBase = baseMtAPIUrl + 'chaxun_timuxiangqing?token=' + token + '&caozuoyuan=' + caozuoyuan +
          '&jigouid=1' + '&lingyuid=2' + '&timu_id='; //查询题目详情基础url
        var numPerPage = 20; //每页显示多少条数据
        var paginationLength = 11; //显示多少个页码
        var paginationLengthTwo = 7; //分页部分，页码的长度，目前设定为7; //显示多少个页码
        var lastDxDa = []; //上一个多选题的答案数组
        var lastDxTm = ''; //上一个多选题
        var xiuGaiYongHu = baseRzAPIUrl + 'xiugai_yonghu';//修改用户
        var itemLetter = config.letterArr; //选项的数组
        var kaoshiTime; //考试时间, 秒
        var timer;
        var chaCunLianXiFs = baseKwAPIUrl + 'chaxun_lianxichengji'; // 查询练习成绩
        var totalKssPage; //考试成绩分页
        var totalLxPage; //练习成绩分页
        var isInPracticeOrExam = false; //判读是否在考试或练习中
        var stuDaArr = 'stuDaArr' + caozuoyuan; //存放考生答题数据
        var lianXiSwitch = baseKwAPIUrl + 'lianxi_kaiguan'; //关闭练习的开关

        $scope.stuParams = { //学生controller参数
          stuTabActive: '',
          lxItemNum: '',
          lxTime: '',
          zsdId: '',
          lxTiMuId: '', //选择体型ID
          cnNumArr: config.cnNumArr,
          startKaoShiState: false, //考试状态
          startLianXiState: false, //练习状态
          kaoShiName: '', //考试名称
          tmNumPerPage: 20,
          mima: '', //新密码
          letterArr: config.letterArr, //题支的序号
          addBgColor: false, //加背景颜色
          kaoShiDeFen: '', //考试最后得分
          tuiChuKaoShi: false,
          lianXiKaiQi: false //练习是否开启
        };
        $scope.tiMuIdData = ''; //存放题目id的数据
        $scope.tiMuPage = []; //存放题目分页的数据
        $scope.currentTmPageVal = ''; //目前是那一页
        $scope.daTiData = []; //存放已答题目数据
        //$scope.tmNumPerPage = ''; //存放已答题目数据
        $scope.showXiuGaiMiMa = false; //修改密码显示
        $scope.passwordRegexp = /^.{6,20}$/;//密码的正则表达式
        $scope.isInPracticeOrExam = false; //判读是否在考试或练习中
        $scope.ifClickStartExam = false; //判读是否点击了考试
        $scope.loadingImgShow = false;

        /**
         * 获得大纲数据
         */
        var getDaGangData = function(){
          var zsdgZsdArr = [];
          //得到知识大纲专业的递归函数
          function _do(item) {
            zsdgZsdArr.push(item.ZHISHIDIAN_ID);
            if(item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0){
              _.each(item.ZIJIEDIAN, _do);
            }
          }
          $http.get(qryMoRenDgUrl).success(function(mrDg){
            if(mrDg && mrDg.length > 0){
              $scope.dgList = mrDg;
              //获取大纲专业
              var qryKnowledge = qryKnowledgeBaseUrl + mrDg[0].ZHISHIDAGANG_ID;
              $http.get(qryKnowledge).success(function(zsddata){
                if(zsddata.length){
                  $scope.kowledgeList = zsddata[0].ZIJIEDIAN;
                  //得到知识大纲专业id的函数
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
        var chaXunKaoShi = function(cType){
          var stuObj = {
            token: token,
            shuju: {
              UID: caozuoyuan,
              JIGOU_ID: 1,
              NEW: ''
            }
          };
          if(cType == 'exam'){
            stuObj.shuju.NEW = true;
          }
          if(cType == 'score'){
            stuObj.shuju.NEW = false;
          }
          $http.get(chaXunKaoShiUrl, {params: stuObj}).success(function(data){
            if(data && data.length > 0){
              var ksNowMs = moment().add(moment().utcOffset(), 'm'); //错了8个时区
              Lazy(data).each(function(ks){
                var d = new Date();
                var kssj = Date.parse(ks.KAISHISHIJIAN)-28800000;
                var nowt = Date.parse(d);
                var diffAft = nowt - kssj; //开考半个小时候后
                var diffBef = kssj - nowt; //距离开考时间大于10分钟
                if(ks.ZHUANGTAI < 3){
                  var ksJssjMs = moment(ks.JIESHUSHIJIAN); //考试结束时间毫秒数
                  if(ksNowMs > ksJssjMs){
                    ks.ZHUANGTAI = 10;
                  }
                }
                if((diffAft > 1800000) || (diffBef > 600000)){
                  ks.thisKaoShow = false;
                }
                else{
                  ks.thisKaoShow = true;
                }
              });
              $scope.kaoShiList = data;
              kaoShiScorePages(data);
            }
            else{
              $scope.kaoShiList = '';
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 考试成绩分页数码
         */
        var kaoShiScorePages = function(ks){
          totalKssPage = [];
          $scope.lastKssPageNum = '';
          if(ks && ks.length > 10){
            var dataLength;
            var dataLastPage;
            dataLength = ks.length;
            dataLastPage = Math.ceil(dataLength/numPerPage);
            $scope.lastKssPageNum = dataLastPage;
            for(var i = 1; i <= dataLastPage; i++){
              totalKssPage.push(i);
            }
            $scope.kssPgDist(1);
          }
          else{
            $scope.kssDistData = $scope.kaoShiList.slice(0);
          }
        };

        /**
         * 练习成绩分页数码
         */
        var lianXiScorePages = function(ks){
          totalLxPage = [];
          $scope.lastLxPageNum = '';
          if(ks && ks.length > 10){
            var dataLength;
            var dataLastPage;
            dataLength = ks.length;
            dataLastPage = Math.ceil(dataLength/numPerPage);
            $scope.lastLxPageNum = dataLastPage;
            for(var i = 1; i <= dataLastPage; i++){
              totalLxPage.push(i);
            }
            $scope.lxPgDist(1);
          }
          else{
            $scope.lxDistData = $scope.lianXiList.slice(0);
          }
        };

        /**
         * 查询考试
         */
        var chaXunLianXiScore = function(){
          var stuObj = {
            token: token,
            uid: caozuoyuan
          };
          $http.get(chaCunLianXiFs, {params: stuObj}).success(function(data){
            if(data && data.length > 0){
              Lazy(data).each(function(lx){
                //lx.name = DataService.formatDateUtc(lx.KAISHISHIJIAN) + '练习';
                if(lx.JIESHUSHIJIAN){
                  var sjc = (moment(lx.JIESHUSHIJIAN).valueOf() - moment(lx.KAISHISHIJIAN).valueOf())/ 1000 / 60;
                  lx.shichang = sjc.toFixed(0);
                }
                else{
                  lx.shichang = 20;
                }
              });
              $scope.lianXiList = Lazy(data).reverse().toArray();
              lianXiScorePages($scope.lianXiList);
            }
            else{
              $scope.lianXiList = '';
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * timer计时器
         */
        var countDown = function(){
          if(kaoshiTime >= 0){
            var minutes = Math.floor(kaoshiTime / 60);
            var seconds = Math.floor(kaoshiTime % 60);
            var msg = "距离考试结束还有 "+ minutes + " 分 " + seconds + " 秒";
            $('#timer').html(msg);
            -- kaoshiTime;
          }
          else{
            var addActiveFun = function() {
              $scope.endKaoShi();
            };
            DataService.alertInfFun('pmt', '考试结束，试卷即将自动提交！');
            $timeout(addActiveFun, 2000);
            $interval.cancel(timer);
          }
        };

        /**
         * 删除不是本UID的答题数据
         */
        var deleteLocalStorage = function(){
          if(window.localStorage){
            var len = localStorage.length;
            for (var i=0; i < len; i++){
              var key = localStorage.key(i);
              if(key != stuDaArr){
                localStorage.removeItem(key);
              }
            }
          }
        };

        /**
         * 查询练习状态
         */
        var checkLianXiState = function(){
          var getLxSwitch = lianXiSwitch + '?token=' + token;
          $http.get(getLxSwitch).success(function(data){
            if(data.result){
              $scope.stuParams.lianXiKaiQi = true;
            }
            else{
              $scope.stuParams.lianXiKaiQi = false;
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 考试成绩分页
         */
        $scope.kssPgDist = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          var lastPageNum = $scope.lastKssPageNum;
          $scope.currentKssPageVal = pg;
          //得到分页数组的代码
          var currentPageNum = pg ? pg : 1;
          if(lastPageNum <= paginationLengthTwo){
            $scope.kssPages = totalKssPage;
          }
          if(lastPageNum > paginationLengthTwo){
            if(currentPageNum > 0 && currentPageNum <= 4 ){
              $scope.kssPages = totalKssPage.slice(0, paginationLengthTwo);
            }
            else if(currentPageNum > lastPageNum - 4 && currentPageNum <= lastPageNum){
              $scope.kssPages = totalKssPage.slice(lastPageNum - paginationLengthTwo);
            }
            else{
              $scope.kssPages = totalKssPage.slice(currentPageNum - 4, currentPageNum + 3);
            }
          }
          $scope.kssDistData = $scope.workersData.slice(startPage, endPage);
        };

        /**
         * 练习成绩分页
         */
        $scope.lxPgDist = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          var lastPageNum = $scope.lastLxPageNum;
          $scope.currentLxPageVal = pg;
          //得到分页数组的代码
          var currentPageNum = pg ? pg : 1;
          if(lastPageNum <= paginationLengthTwo){
            $scope.lxPages = totalLxPage;
          }
          if(lastPageNum > paginationLengthTwo){
            if(currentPageNum > 0 && currentPageNum <= 4 ){
              $scope.lxPages = totalLxPage.slice(0, paginationLengthTwo);
            }
            else if(currentPageNum > lastPageNum - 4 && currentPageNum <= lastPageNum){
              $scope.lxPages = totalLxPage.slice(lastPageNum - paginationLengthTwo);
            }
            else{
              $scope.lxPages = totalLxPage.slice(currentPageNum - 4, currentPageNum + 3);
            }
          }
          $scope.lxDistData = $scope.lianXiList.slice(startPage, endPage);
        };

        /**
         * 考生内容切换
         */
        $scope.stuTabSlide = function(tab){
          $scope.stuParams.stuTabActive = '';
          if(!$scope.isInPracticeOrExam){
            if(tab == 'practice'){
              checkLianXiState();
              getDaGangData();
              $scope.tiMuDetail = [];
              $scope.tiMuDistPage = [];
              $scope.daTiData = [];
              $scope.stuParams.startKaoShiState = false;
              $scope.stuParams.startLianXiState = false;
              $scope.stuParams.addBgColor = false;
              $scope.stuParams.kaoShiName = '';
              $scope.stuParams.lxTiMuId = '';
              $scope.stuParams.lxItemNum = '';
              $scope.stuParams.zsdId = '';
              chaXunLianXiScore();
              $scope.stuParams.stuTabActive = 'practice';
              $scope.stuTpl = 'views/student/practice.html'
            }
            if(tab == 'exam'){
              chaXunKaoShi('exam');
              $scope.daTiData = [];
              $scope.tiMuDetail = [];
              $scope.tiMuDistPage = [];
              $scope.stuParams.startKaoShiState = false;
              $scope.stuParams.startLianXiState = false;
              $scope.stuParams.addBgColor = false;
              $scope.stuParams.kaoShiName = '';
              $scope.ifClickStartExam = false; //判读是否点击了考试
              $scope.stuParams.stuTabActive = 'exam';
              $scope.stuTpl = 'views/student/exam.html'
            }
            if(tab == 'score'){
              chaXunKaoShi('score');
              $scope.stuParams.stuTabActive = 'score';
              $scope.stuTpl = 'views/student/score.html'
            }
            lastDxDa = []; //上一个多选题的答案数组
            lastDxTm = ''; //上一个多选题
          }

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
          //先清空计时器
          $interval.cancel(timer);
          $('#timer').html('');
          deleteLocalStorage(); //清空不是本UID的loacalStorage数据
          $scope.tiMuIdData = '';
          $scope.tiMuPage = [];
          if(ks.KAOSHI_ID){
            $scope.loadingImgShow = true;
            $scope.ifClickStartExam = true;
            var ksNowMs = moment().add(moment().utcOffset(), 'm'); //错了8个时区
            var ksKssjMs = moment(ks.KAISHISHIJIAN); //考试开始时间
            if(ksNowMs >= ksKssjMs){
              $http.get(startKaoShiUrl, {params: ksObj}).success(function(data){
                if(data.TIMU && data.TIMU.length > 0){
                  var nt = moment.utc(data.SERVER_TIME).format();
                  var dt = moment.utc(data.KAISHISHIJIAN).format();
                  var ntm = moment(nt).valueOf();
                  var dtm = moment(dt).valueOf();
                  var yiDaShiChang = ntm - dtm;
                  var syTime = (parseInt(data.SHICHANG) * 60 - parseInt(yiDaShiChang) / 1000).toFixed(0); // 剩余时间
                  if(syTime > 0){
                    $scope.kaoShiData = data;
                    $scope.tiMuIdData = data.TIMU;
                    $scope.stuParams.startKaoShiState = true;
                    $scope.stuParams.addBgColor = true;
                    $scope.stuParams.kaoShiName = ks.KAOSHI_MINGCHENG;
                    kaoshiTime = parseInt(syTime);
                    timer = $interval(function(){
                      countDown();
                    }, 1000);
                    $scope.isInPracticeOrExam = true;
                    $scope.changeNumPerPage(20);
                  }
                  else{
                    DataService.alertInfFun('err', '考试已结束！');
                    $scope.stuParams.startKaoShiState = false;
                    $scope.stuParams.addBgColor = false;
                    $scope.stuParams.kaoShiName = '';
                    $('#timer').html('');
                    kaoshiTime = '';
                    timer = '';
                    $scope.kaoShiData = '';
                    $scope.tiMuIdData = '';
                    $scope.ifClickStartExam = false;
                    $interval.cancel(timer);
                    localStorage.removeItem(stuDaArr);
                  }
                  $scope.loadingImgShow = false;
                  $scope.ifClickStartExam = false;
                }
                else{
                  $scope.kaoShiData = '';
                  $scope.tiMuIdData = '';
                  $scope.ifClickStartExam = false;
                  $scope.stuParams.startKaoShiState = false;
                  $scope.stuParams.addBgColor = false;
                  $scope.stuParams.kaoShiName = '';
                  $scope.loadingImgShow = false;
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
            else{
              $scope.kaoShiData = '';
              $scope.tiMuIdData = '';
              $scope.ifClickStartExam = false;
              $scope.stuParams.startKaoShiState = false;
              $scope.stuParams.addBgColor = false;
              $scope.stuParams.kaoShiName = '';
              $scope.loadingImgShow = false;
              DataService.alertInfFun('pmt', '开始时间还未到！');
            }
          }
          else{
            DataService.alertInfFun('pmt', '缺少考试ID');
          }
        };

        /**
         * 改变每页题目数量
         */
        $scope.changeNumPerPage = function(num){
          numPerPage = num || 20;
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
          $scope.tiMuDetail = []; //清空上一页的数据
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
              var distByTxid = Lazy(data).groupBy('TIXING_ID');
              var stuHasAnsewer = JSON.parse(localStorage.getItem(stuDaArr));
              Lazy(distByTxid).each(function(v, k, l){
                var tmObj = {daTi: '', tiMu: ''};
                if(k == 1){
                  tmObj.daTi = '单选题';
                }
                if(k == 2){
                  tmObj.daTi = '多选题';
                }
                if(k == 4){
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
                Lazy(v).each(function(tm){
                  var hIndex = Lazy(distTiMuIdArr).indexOf(tm.TIMU_ID);
                  var nIndex = Lazy(newInArr).indexOf(tm.TIMU_ID);
                  v[nIndex].TIMU_XUHAO = distTiMuId[hIndex].TIMU_XUHAO + 1;
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
                  localStorage.setItem(stuDaArr, JSON.stringify($scope.daTiData));
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
              $scope.stuParams.addBgColor = false;
              $scope.stuParams.kaoShiName = '';
              $interval.cancel(timer);
              $('#timer').html('');
              kaoshiTime = '';
              timer = '';
              localStorage.removeItem(stuDaArr);
              deleteLocalStorage();
              $scope.isInPracticeOrExam = false;
              $scope.ifClickStartExam = false;
              $scope.stuParams.kaoShiDeFen = data.defen;
              $scope.stuParams.tuiChuKaoShi = true;
              //chaXunKaoShi();
              //DataService.alertInfFun('suc', '提交成功！');
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
              TIXING_ID: $scope.stuParams.lxTiMuId,
              COUNT: $scope.stuParams.lxItemNum,
              ZHISHIDIAN: $scope.stuParams.zsdId,
              shichang: $scope.stuParams.lxTime
            }
          };
          var errArr = [];
          $scope.tiMuIdData = '';
          $scope.tiMuPage = [];
          deleteLocalStorage();
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
                case 'TIXING_ID':
                  errArr.push('题目类型');
                  break;
                case 'ZHISHIDIAN':
                  errArr.push('专业');
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
                $scope.stuParams.addBgColor = true;
                if($scope.stuParams.lxTime != 999999){
                  kaoshiTime = parseInt($scope.stuParams.lxTime) * 60;
                  timer = $interval(function(){
                    countDown();
                  }, 1000);
                }
                $scope.isInPracticeOrExam = true;
                $scope.changeNumPerPage($scope.stuParams.tmNumPerPage);
              }
              else{
                $scope.lianXiData = '';
                $scope.tiMuIdData = '';
                $scope.stuParams.startLianXiState = false;
                $scope.stuParams.addBgColor = false;
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
              timuid: xtm.TIMU_ID,
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
              if(!data.error){
                //存已答题的数据，存放到本地存储
                var hasIn = true; //不在已答数组里面
                Lazy($scope.daTiData).each(function(kstm, idx, lst){
                  if(kstm.TIMU_ID == xtm.TIMU_ID){
                    kstm.stuDa = dtObj.shuju.ksda;
                    if(data.result){
                      kstm.score = 'right';
                    }
                    else{
                      kstm.score = 'wrong';
                    }
                    hasIn = false;
                  }
                });
                if(hasIn){
                  var daTiObj = {
                    TIMU_ID: xtm.TIMU_ID,
                    stuDa: dtObj.shuju.ksda,
                    score: data.result
                  };
                  if(data.result){
                    daTiObj.score = 'right';
                  }
                  else{
                    daTiObj.score = 'wrong';
                  }
                  $scope.daTiData.push(daTiObj);
                }
                if (window.localStorage){
                  localStorage.setItem(stuDaArr, JSON.stringify($scope.daTiData));
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
              LIANXI_ID: $scope.lianXiData.LIANXI_ID,
              DDTS: '', //答对题数
              DCTS: '', //答错题数
              DEFEN: ''// 得分(可能不需要)
            }
          };
          var defnArr = JSON.parse(localStorage.getItem(stuDaArr));
          var disArr = Lazy(defnArr).groupBy(function(lx){
            return lx.score;
          }).toObject();
          if(disArr.right && disArr.right.length){
            endObj.shuju.DDTS = disArr.right.length;
          }
          else{
            endObj.shuju.DDTS = 0;
          }
          if(disArr.wrong && disArr.wrong.length){
            endObj.shuju.DCTS = disArr.wrong.length;
          }
          else{
            endObj.shuju.DCTS = 0;
          }
          $http.post(lianJeShuTiUrl, endObj).success(function(data){
            if(data.result){
              $scope.stuParams.startLianXiState = false;
              $scope.stuParams.addBgColor = false;
              $scope.stuParams.lxTiMuId = '';
              $scope.stuParams.lxTime = '';
              $scope.stuParams.lxItemNum = '';
              $scope.stuParams.zsdId = '';
              $interval.cancel(timer);
              $('#timer').html('');
              kaoshiTime = '';
              timer = '';
              localStorage.removeItem(stuDaArr);
              deleteLocalStorage();
              $scope.isInPracticeOrExam = false;
              chaXunLianXiScore();
              DataService.alertInfFun('suc', '提交成功！');
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 练习显示正确答案
         */
        $scope.showDaAn = function(event, da, tx){
          var classTar = $(event.target);
          var nextLCass = $(event.target).next('.standardAnswer');
          classTar.hide();
          var rightAs = '';
          if(tx == 1){
            rightAs = itemLetter[da];
          }
          if(tx == 2){
            var asArr = da.split(',');
            var newAsArr = [];
            Lazy(asArr).each(function(as){
              newAsArr.push(itemLetter[as]);
            });
            rightAs = newAsArr.join();
          }
          if(tx == 4){
            if(da == 0){
              rightAs = '错';
            }
            if(da == 1){
              rightAs = '对';
            }
          }
          nextLCass.find('strong').html(rightAs);
          nextLCass.show();
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

        /**
         * 考试完退出
         */
        $scope.kaoShiJieShuConfirm = function(){
          DataService.logout();
        }

    }]);
});
