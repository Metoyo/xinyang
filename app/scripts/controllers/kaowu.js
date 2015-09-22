define(['angular', 'config', 'intimidatetime', 'jquery', 'underscore', 'lazy'],
  function (angular, config, intimidatetime, $, _, lazy) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:KaowuCtrl
   * @description
   * # KaowuCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.KaowuCtrl', [])
    .controller('KaowuCtrl', ['$rootScope', '$scope', '$http', '$timeout', 'DataService',
      function ($rootScope, $scope, $http, $timeout, DataService) {
        /**
         * 操作title
         */
        $rootScope.isRenZheng = false; //判读页面是不是认证

        /**
         * 定义变量
         */
        var userInfo = $rootScope.session.userInfo;
        var baseKwAPIUrl = config.apiurl_kw; //考务的api
        var baseMtAPIUrl = config.apiurl_mt; //mingti的api
        var baseRzAPIUrl = config.apiurl_rz; //renzheng的api
        var token = config.token;
        var caozuoyuan = userInfo.UID;//登录的用户的UID   chaxun_kaoshi_liebiao
        var jigouid = userInfo.JIGOU[0].JIGOU_ID;
        var lingyuid = $rootScope.session.defaultLyId;
        var qryKaoChangListUrl = baseKwAPIUrl + 'chaxun_kaodiankaochang_liebiao?token=' + token + '&caozuoyuan='
            + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考场列表的url
        var qryKaoChangDetailBaseUrl = baseKwAPIUrl + 'chaxun_kaodiankaochang?token=' + token + '&caozuoyuan='
            + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考场详细的url
        var qryKaoShiListUrl = baseKwAPIUrl + 'chaxun_kaoshi_liebiao?token=' + token + '&caozuoyuan='
            + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考试列表的url
        var qryKaoShiDetailBaseUrl = baseKwAPIUrl + 'chaxun_kaoshi?token=' + token + '&caozuoyuan='
            + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考试详细的url
        var qryCxsjlbUrl = baseMtAPIUrl + 'chaxun_shijuanliebiao?token=' + token + '&caozuoyuan=' + caozuoyuan +
            '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询试卷列表url
        var kaoshi_data; //考试的数据格式
        var kaochang_data; //考场的数据格式
        var xiuGaiKaoShiUrl = baseKwAPIUrl + 'xiugai_kaoshi'; //修改考试的url
        var tongBuShiJuanUrl = baseKwAPIUrl + 'tongbu_shijuan'; // 同步试卷信息的url
        var isEditKaoShi = false; //是否为编辑考试
        var isDeleteKaoShi = false; //是否为删除考试
        var isEditKaoChang = false; //是否为编辑考场
        var isDeleteKaoChang = false; //是否为删除考场
        var xiuGaiKaoChangUrl = baseKwAPIUrl + 'xiugai_kaodiankaochang'; //修改考场的url
        var paperPageArr = []; //定义试卷页码数组
        var sjlbIdArrRev = []; //存放所有试卷ID的数组
        var totalPaperPage;//符合条件的试卷一共有多少页
        var itemNumPerPage = 10; //每页显示多少条数据
        var paginationLength = 11; //分页部分，页码的长度，目前设定为11
        var qryShiJuanGaiYaoBase = baseMtAPIUrl + 'chaxun_shijuangaiyao?token=' + token + '&caozuoyuan=' + caozuoyuan +
            '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&shijuanid='; //查询试卷概要的基础URL
        var getUserNameBase = baseRzAPIUrl + 'get_user_name?token=' + token + '&uid='; //得到用户名的URL
        var faBuKaoShiBaseUrl = baseKwAPIUrl + 'fabu_kaoshi?token=' + token + '&caozuoyuan=' + caozuoyuan +
            '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&kaoshi_id='; //发布考试的url
        var qryPaperDetailBase = baseMtAPIUrl + 'chaxun_shijuanxiangqing?token=' + token + '&caozuoyuan=' + caozuoyuan +
            '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&shijuanid='; //查询试卷详情的url
        var kaoShiPageArr = []; //定义考试页码数组
        var  kaoShiIdArrRev = []; //存放所有考试ID的数组
        var totalKaoShiPage; //符合条件的考试一共有多少页
        var kaoChangPageArr = []; //定义考场页码数组
        var kaoChangIdArrRev = []; //存放所有考场ID的数组
        var totalKaoChangPage; //符合条件的考场一共有多少页
        var uploadKsUrl = baseMtAPIUrl + 'excel_to_json'; //上传考生信息
        var operateJgUrl = baseRzAPIUrl + 'jigou'; //操作机构基础url
        var kxhManageUrl = baseRzAPIUrl + 'kexuhao'; //专业管理的url
        var chaXunJiGouYongHuUrl = baseRzAPIUrl + 'query_student'; //查询机构下面的用户

        $scope.tiXingNameArr = config.tiXingNameArr; //题型名称数组
        $scope.letterArr = config.letterArr; //题支的序号
        $scope.cnNumArr = config.cnNumArr; //汉语的大学数字
        $rootScope.dashboard_shown = true;
        $scope.kwParams = { //考务用到的变量
          ksListZt: '', //考试列表的状态
          showKaoShiDetail: false, //考试详细信息
          selectShiJuan: [], //存放已选择试卷的数组
          saveKaoShiBtnStat: false,
          isAllKeGuanTi: false, //判断全部是否为客观题
          selected_bm: '', //选择的部门ID
          selected_zy: '' //选择的专业ID
        };
        $scope.startDateIsNull = false;
        $scope.endDateIsNull = false;

        /**
         * 由机构类别查询机构
         */
        var getJgList = function(){
          var qryJiGouUrl = operateJgUrl + '?token=' + token; //查询机构
          $scope.originBuMenData = '';
          $scope.loadingImgShow = true;
          DataService.getData(qryJiGouUrl).then(function(data){
            if(data && data.length > 0){
              $scope.loadingImgShow = false;
              $scope.originBuMenData = data[0].CHILDREN[0].CHILDREN;
            }
            else{
              $scope.loadingImgShow = false;
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 获得专业数据
         */
        var getKeXuHaoData = function(){
          var chaXunKxh = kxhManageUrl + '?token=' + token + '&jigouid=' + jigouid;
          $scope.keXuHaoData = '';
          $scope.loadingImgShow = true;
          $http.get(chaXunKxh).success(function(kxh){
            if(kxh && kxh.length > 0){
              $scope.keXuHaoData = kxh;
              $scope.loadingImgShow = false;
            }
            else{
              $scope.loadingImgShow = false;
              DataService.alertInfFun('err', kxh.error);
            }
          });
        };

        /**
         * 考试的分页数据查询函数
         */
        $scope.getThisKaoShiPageData = function(pg){
          var pgNum = pg - 1,
            kaoshi_id,
            currentPage = pgNum ? pgNum : 0,
            qrySelectKaoShisUrl;
          $scope.kaoShiPages = [];
          //得到分页数组的代码
          var currentKsPageVal = $scope.currentKsPageVal = pg ? pg : 1;
          if(totalKaoShiPage <= paginationLength){
            $scope.kaoShiPages = kaoShiPageArr;
          }
          if(totalKaoShiPage > paginationLength){
            if(currentKsPageVal > 0 && currentKsPageVal <= 6 ){
              $scope.kaoShiPages = kaoShiPageArr.slice(0, paginationLength);
            }
            else if(currentKsPageVal > totalKaoShiPage - 5 && currentKsPageVal <= totalKaoShiPage){
              $scope.kaoShiPages = kaoShiPageArr.slice(totalKaoShiPage - paginationLength);
            }
            else{
              $scope.kaoShiPages = kaoShiPageArr.slice(currentKsPageVal - 5, currentKsPageVal + 5);
            }
          }
          //查询数据的代码
          kaoshi_id = kaoShiIdArrRev.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
          qrySelectKaoShisUrl = qryKaoShiDetailBaseUrl + '&kaoshiid=' + kaoshi_id;
          $http.get(qrySelectKaoShisUrl).success(function(ksdtl){
            if(ksdtl.length){
              $scope.loadingImgShow = false; //kaoShiList.html
              $scope.kaoshiList = ksdtl;
            }
            else{
              DataService.alertInfFun('pmt', '没有相关的考试！');
              $scope.loadingImgShow = false; //kaoShiList.html
            }
          });
        };

        /**
         * 显示考试列表,可分页的方法, zt表示状态 1，2，3，4为完成；5，6已完成
         */
        $scope.showKaoShiList = function(zt){
          var ztArr = [],
            qryKaoShiList;
          zt = zt || 'all';
          $scope.loadingImgShow = true; //kaoShiList.html
          kaoShiPageArr = []; //定义考试页码数组
          kaoShiIdArrRev = []; //存放所有考试ID的数组
          //先查询所有考试的Id
          switch (zt) {
            case 'all':
              ztArr = [];
              break;
            case 'ing':
              ztArr = [0, 1, 2];
              break;
            case 'done':
              ztArr = [3, 4, 5, 6];
              break;
          }
          $scope.kwParams.ksListZt = zt;
          qryKaoShiList = qryKaoShiListUrl + '&zhuangtai=' + ztArr;
          $http.get(qryKaoShiList).success(function(kslst){
            if(kslst.length){
              $scope.kaoShiListIds = kslst; //得到所有的考试ids
              totalKaoShiPage = Math.ceil(kslst.length/itemNumPerPage); //得到所有考试的页码
              for(var i = 1; i <= totalKaoShiPage; i++){
                kaoShiPageArr.push(i);
              }
              kaoShiIdArrRev = _.map(kslst, function(ksid){ return ksid.KAOSHI_ID; });
              $scope.lastKaoShiPageNum = totalKaoShiPage; //最后一页的数值
              //查询数据开始
              $scope.getThisKaoShiPageData();
              $scope.txTpl = 'views/kaowu/kaoShiList.html';
              $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
              isEditKaoShi = false;//是否为编辑考试
              isDeleteKaoShi = false;//是否为删除考试
              $scope.kwParams.saveKaoShiBtnStat = false; //考试保存成功后，保存考试的按钮激活
            }
            else{
              $scope.kaoshiList = '';
              kaoShiPageArr = [];
              $scope.kaoShiPages = [];
              $scope.kaoShiListIds = [];
              $scope.kwParams.ksListZt = '';
              $scope.txTpl = 'views/kaowu/kaoShiList.html';
              $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
              isEditKaoShi = false;//是否为编辑考试
              isDeleteKaoShi = false;//是否为删除考试
              DataService.alertInfFun('pmt', '没有相关的考试！');
              $scope.loadingImgShow = false; //kaoShiList.html
            }
          });
        };

        /**
         * 考务页面加载时，加载考试列表
         */
        $scope.showKaoShiList();

        /**
         * 显示试卷详情
         */
        $scope.showShiJuanInfo = function(sjId){
          var newCont,
            tgReg = new RegExp('<\%{.*?}\%>', 'g');
          var qryPaperDetail = qryPaperDetailBase + sjId;
          $http.get(qryPaperDetail).success(function(data){
            if(data){
              //给模板大题添加存放题目的数组
              _.each(data.MUBANDATI, function(mbdt, idx, lst){
                mbdt.TIMUARR = [];
                mbdt.datiScore = 0;
              });
              //将各个题目添加到对应的模板大题中
              _.each(data.TIMU, function(tm, idx, lst){
                //修改填空题的题干
                newCont = tm.DETAIL.TIGAN.tiGan.replace(tgReg, function(arg) {
                  var text = arg.slice(2, -2), //提起内容
                    textJson = JSON.parse(text),
                    _len = textJson.size,
                    i, xhStr = '';
                  for(i = 0; i < _len; i ++ ){
                    xhStr += '_';
                  }
                  return xhStr;
                });
                tm.DETAIL.TIGAN.tiGan = newCont;
                _.each(data.MUBANDATI, function(mbdt, subIdx, subLst){
                  if(mbdt.MUBANDATI_ID == tm.MUBANDATI_ID){
                    mbdt.TIMUARR.push(tm);
                    mbdt.datiScore += parseFloat(tm.FENZHI);
                  }
                });
              });
              //赋值
              $scope.paperDetail = data;
              $scope.showPaperDetail = true;
            }
            else{
              DataService.alertInfFun('err', '查询试卷失败！错误信息为：' + data.error);
            }
          });
        };

        /**
         * 关闭试卷详情
         */
        $scope.closePaperDetail = function(){
          $scope.showPaperDetail = false;
        };

        /**
         * 查询本机构下的所有考场
         */
        var qryAllKaoChang = function(){
          $scope.loadingImgShow = true; //kaoChangList.html
          $http.get(qryKaoChangDetailBaseUrl).success(function(data){
            if(data.length){
              $scope.allKaoChangList = data;
              $scope.loadingImgShow = false; //kaoChangList.html
            }
            else{
              $scope.loadingImgShow = false; //kaoChangList.html
              DataService.alertInfFun('pmt', '没有相关的考场数据!');
            }
          });
        };

        /**
         * 新增一个考试
         */
        $scope.addNewKaoShi = function(ks){
          $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
          $scope.showPaperDetail = false; //控制试卷详情的显示和隐藏
          $scope.kwParams.selectShiJuan = []; //重置已选择的时间数组
          kaoshi_data = { //考试的数据格式
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju:{
              KAOSHI_ID: '',
              KAOSHI_MINGCHENG: '',
              KAISHISHIJIAN: '',
              JIESHUSHIJIAN: '',
              SHICHANG: '',
              XINGZHI: 1,
              LEIXING: 0,
              XUZHI: '',
              SHIJUAN_ID: [],
              shijuan_name: '',
              ZHUANGTAI: 0,
              KAOCHANG:[]
            }
          };
          $http.get(qryKaoChangDetailBaseUrl).success(function(data){
            if(data && data.length > 0){
              var kcInfo = {};
              kcInfo.KID = data[0].KID;
              kcInfo.USERS = [];
              kaoshi_data.shuju.KAOCHANG.push(kcInfo);
              if(isEditKaoShi){
                kaoshi_data.shuju.KAOSHI_ID = ks.KAOSHI_ID;
                kaoshi_data.shuju.KAOSHI_MINGCHENG = ks.KAOSHI_MINGCHENG;
                kaoshi_data.shuju.KAISHISHIJIAN = DataService.formatDateUtc(ks.KAISHISHIJIAN);
                kaoshi_data.shuju.JIESHUSHIJIAN = ks.JIESHUSHIJIAN;
                kaoshi_data.shuju.SHICHANG = ks.SHICHANG;
                kaoshi_data.shuju.XINGZHI = ks.XINGZHI;
                kaoshi_data.shuju.LEIXING = ks.LEIXING;
                kaoshi_data.shuju.XUZHI = ks.XUZHI;
                $scope.kwParams.selectShiJuan = ks.SHIJUAN;
                kaoshi_data.shuju.ZHUANGTAI = ks.ZHUANGTAI;
                $scope.kaoshiData = kaoshi_data;
                $scope.txTpl = 'views/kaowu/editKaoShi.html';
              }
              else if(isDeleteKaoShi){

              }
              else{
                getJgList();
                getKeXuHaoData();
                $scope.kaoshiData = kaoshi_data;
                $scope.txTpl = 'views/kaowu/editKaoShi.html';
              }
              //显示时间选择器
              var showDatePicker = function() {
                $('.start-date').intimidatetime({
                  buttons: [
                    { text: '当前时间', action: function(inst){ inst.value( new Date() ); } }
                  ]
                });
                $('.end-date').intimidatetime({
                  buttons: [
                    { text: '当前时间', action: function(inst){ inst.value( new Date() ); } }
                  ]
                });
              };
              $timeout(showDatePicker, 500);
            }
            else{
              DataService.alertInfFun('pmt', '没有相关的考场数据!');
            }
          });
        };

        /**
         * 查询专业下面的员工
         */
        $scope.chaXunKxhYongHu = function(kxh){
          $scope.kxhWorkersData = '';
          if(kxh){
            var chaXunYongHu = chaXunJiGouYongHuUrl + '?token=' + token + '&kexuhaoid=' + kxh;
            $http.get(chaXunYongHu).success(function(data){
              if(data && data.length > 0){
                $scope.kxhWorkersData = data;
                var hasInKsIds = Lazy(kaoshi_data.shuju.KAOCHANG[0].USERS).map(function(wk){return wk.ZHENGJIANHAO}).toArray();
                var newKsIds = Lazy(data).map(function(wk){return wk.ZHENGJIANHAO}).toArray();
                var differentId = Lazy(newKsIds).without(hasInKsIds).toArray();
                Lazy(differentId).each(function(zj){
                  var wkInfo = Lazy(data).find(function(wk){
                    return wk.ZHENGJIANHAO == zj;
                  });
                  if(wkInfo){
                    var obj = {
                      UID: wkInfo.UID,
                      ZHENGJIANHAO: wkInfo.ZHENGJIANHAO,
                      XINGMING: wkInfo.XINGMING
                    };
                    kaoshi_data.shuju.KAOCHANG[0].USERS.push(obj);
                  }
                });
                console.log(kaoshi_data.shuju.KAOCHANG[0].USERS);
              }
              else{
                $scope.kxhWorkersData = '';
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '缺少专业ID！');
          }
        };

        /**
         * 查询机构下面的员工
         */
        $scope.chaXunJiGouYongHu = function(bm){
          $scope.bmWorkersData = '';
          if(bm){
            var chaXunYongHu = chaXunJiGouYongHuUrl + '?token=' + token + '&jigouid=' + bm;
            $http.get(chaXunYongHu).success(function(data){
              if(data && data.length > 0){
                $scope.bmWorkersData = data;
                var hasInKsIds = Lazy(kaoshi_data.shuju.KAOCHANG[0].USERS).map(function(wk){return wk.ZHENGJIANHAO}).toArray();
                var newKsIds = Lazy(data).map(function(wk){return wk.ZHENGJIANHAO}).toArray();
                var differentId = Lazy(newKsIds).without(hasInKsIds).toArray();
                Lazy(differentId).each(function(zj){
                  var wkInfo = Lazy(data).find(function(wk){
                    return wk.ZHENGJIANHAO == zj;
                  });
                  if(wkInfo){
                    var obj = {
                      UID: wkInfo.UID,
                      ZHENGJIANHAO: wkInfo.ZHENGJIANHAO,
                      XINGMING: wkInfo.XINGMING
                    };
                    kaoshi_data.shuju.KAOCHANG[0].USERS.push(obj);
                  }
                });
              }
              else{
                $scope.bmWorkersData = '';
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '缺少机构ID！');
          }
        };

        /**
         * 查询试卷概要的分页代码
         */
        $scope.getThisSjgyPageData = function(pg){
          var qryShiJuanGaiYao,
            pgNum = pg - 1,
            timu_id,
            currentPage = pgNum ? pgNum : 0,
            userIdArr = [];//存放user id的数组
          //得到分页数组的代码
          var currentPageVal = $scope.currentPageVal = pg ? pg : 1;
          if(totalPaperPage <= paginationLength){
            $scope.paperPages = paperPageArr;
          }
          if(totalPaperPage > paginationLength){
            if(currentPageVal > 0 && currentPageVal <= 6 ){
              $scope.paperPages = sjlbIdArrRev.slice(0, paginationLength);
            }
            else if(currentPageVal > totalPaperPage - 5 && currentPageVal <= totalPaperPage){
              $scope.paperPages = sjlbIdArrRev.slice(totalPaperPage - paginationLength);
            }
            else{
              $scope.paperPages = sjlbIdArrRev.slice(currentPageVal - 5, currentPageVal + 5);
            }
          }
          //查询数据的代码
          timu_id = sjlbIdArrRev.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
          qryShiJuanGaiYao = qryShiJuanGaiYaoBase + timu_id; //查询详情url
          $http.get(qryShiJuanGaiYao).success(function(sjlbgy){
            if(sjlbgy.length){
              _.each(sjlbgy, function(sj, idx, lst){
                sj.NANDU = JSON.parse(sj.NANDU);
                userIdArr.push(sj.CHUANGJIANREN_UID);
              });
              var userIdStr = _.chain(userIdArr).sortBy().uniq().value().toString();
              var getUserNameUrl = getUserNameBase + userIdStr;
              $http.get(getUserNameUrl).success(function(users){
                if(users.length){
                  _.each(sjlbgy, function(sj, idx, lst){
                    _.each(users, function(usr, subidx, sublst){
                      if(usr.UID == sj.CHUANGJIANREN_UID){
                        sj.chuangjianren = usr.XINGMING;
                      }
                    });
                  });
                  $scope.paperListData = sjlbgy;
                  $scope.isShowPaperList = true;
                  $scope.showPopupBox = true; //试卷列表弹出层显示
                }
                else{
                  DataService.alertInfFun('err', '查询创建人名称失败！');
                }
              });
            }
            else{
              DataService.alertInfFun('err', '没有相关数据！');
            }
          });
        };

        /**
         * 显示试卷列表
         */
        $scope.showPaperList = function(){
          paperPageArr = [];
          sjlbIdArrRev = []; //反转试卷列表id
          $http.get(qryCxsjlbUrl).success(function(sjlb){
            if(sjlb.length){
              $scope.papertListIds = sjlb;
              var sjlbIdArr; //试卷id列表数组
              totalPaperPage = Math.ceil(sjlb.length/itemNumPerPage); //试卷一共有多少页
              for(var i = 1; i <= totalPaperPage; i++){
                paperPageArr.push(i);
              }
              $scope.lastPaperPageNum = totalPaperPage; //最后一页的数值
              sjlbIdArr = _.map(sjlb, function(sj){
                return sj.SHIJUAN_ID;
              });
              sjlbIdArrRev = sjlbIdArr.reverse(); //将数组反转，按照时间倒叙排列
              //查询数据开始
              $scope.getThisSjgyPageData();
            }
            else{
              DataService.alertInfFun('err', sjlb.error);
            }
          });
        };

        /**
         * 关闭试卷列表
         */
        $scope.closePaperList = function(){
          $scope.showPopupBox = false;
        };

        /**
         * 返回到试卷添加页面
         */
        $scope.backToAddKaoShi = function(){
          $scope.txTpl = 'views/kaowu/editKaoShi.html';
        };

        /**
         * 将试卷添加到考试，目前只能添加到一个试卷
         */
        $scope.addToKaoShi = function(sj){
          var ifHasIn = _.find($scope.kwParams.selectShiJuan, function(sjData){
              return sjData.SHIJUAN_ID == sj.SHIJUAN_ID;
            }),
            selectShiJuanLen;
          if(ifHasIn){
            DataService.alertInfFun('pmt', '此试卷已经在添加的考试，请选择其他试卷！');
          }
          else{
            $scope.kwParams.selectShiJuan.push(sj);
            $scope.showPopupBox = false;
          }
          //判断试题是不是全为客观题
          selectShiJuanLen = $scope.kwParams.selectShiJuan.length;
          if($scope.kwParams.selectShiJuan && selectShiJuanLen> 0){
            for(var i=0; i < selectShiJuanLen; i++){
              var idx = _.findIndex($scope.kwParams.selectShiJuan[i].TIXING_DATA, function(dt){
                return dt.TIXING_ID > 6;
              });
              if(idx >= 0){
                $scope.kwParams.isAllKeGuanTi = false;
                break;
              }
            }
          }
        };

        /**
         * 删除已选试卷
         */
        $scope.deleteSelectShiJuan = function(sjId){
          $scope.kwParams.selectShiJuan = _.reject($scope.kwParams.selectShiJuan, function(sj){
            return sj.SHIJUAN_ID == sjId;
          });
        };

        /**
         * 添加单个考生页面显示
         */
        $scope.addNewKaoSheng = function(){
          $scope.isAddNewKaoSheng = true; //显示添加单个考生页面
          $scope.isImportKaoSheng = false; //导入考试页面隐藏
          $scope.studentNameIsNull = false; //考生姓名重置为空
          $scope.studentIDIsNull = false; //考生学号重置为空
          $scope.kwParams.selected_bm = '';
          $scope.kwParams.selected_zy = '';
        };

        /**
         * 文件上传
         */
          //存放上传文件的数组
        $scope.uploadFiles = [];

        //将选择的文件加入到数组
        $scope.$on("fileSelected", function (event, args) {
          $scope.$apply(function () {
            $scope.uploadFiles.push(args.file);
          });
        });

        //添加文件
        $scope.addMyFile = function(){
          $('input.addFileBtn').click();
        };

        //删除选择的文件
        $scope.deleteSelectFile = function(idx){
          $scope.uploadFiles.splice(idx, 1);
        };

        //关闭上传文件弹出层
        $scope.closeMediaPlugin = function(){
          $('#mediaPlugin').hide();
        };

        //保存上传文件
        $scope.uploadXlsFile = function() {
          var file = $scope.uploadFiles;
          var fields = [{"name": "token", "data": token}];
          var kaoShengOldArr = [];
          var trimBlankReg = /\s/g;
          var delBlank = '';
          $scope.loadingImgShow = true;
          DataService.uploadFileAndFieldsToUrl(file, fields, uploadKsUrl).then(function(result){
            $scope.uploadFileUrl = result.data;
            $scope.uploadFiles = [];
            if(result.data.json){
              Lazy(result.data.json).each(function(v, k, l){
                Lazy(v).each(function(wk, idx, lst){
                  var ksObj = {XINGMING: '', ZHENGJIANHAO:''};
                  Lazy(wk).each(function(v1, k1, l1){
                    delBlank = k1.replace(trimBlankReg, "");
                    switch (delBlank){
                      case '姓名' :
                        ksObj.XINGMING = v1;
                        break;
                      case '身份证':
                        ksObj.ZHENGJIANHAO = v1;
                        break;
                    }
                  });
                  kaoshi_data.shuju.KAOCHANG[0].USERS.push(ksObj);
                });
              });
              console.log(kaoshi_data.shuju.KAOCHANG[0].USERS);
              $scope.loadingImgShow = false;
              DataService.alertInfFun('suc', '上传成功！');
            }
            else{
              $scope.loadingImgShow = false;
              DataService.alertInfFun('err', result.error);
            }
          });
        };

        /**
         * 导入考生列表页面显示
         */
        $scope.importKaoSheng = function(){
          $scope.isImportKaoSheng = true; //导入考生页面显示
          $scope.isAddNewKaoSheng = false; //添加单个考生页面隐藏
          $scope.isUploadDone = false;
          $scope.showImportStuds = false;
          $scope.showListBtn = false;
        };

        /**
         * 显示导入成功后的考生列表
         */
        $scope.showImportList = function(){
          if(kaoshi_data.shuju.KAOCHANG[0].USERS &&
            kaoshi_data.shuju.KAOCHANG[0].USERS.length > 0){
            $scope.showImportStuds = true; //显示考生列表table
          }
          else{
            DataService.alertInfFun('err', '您还没有上传任何考生信息！');
          }
        };

        /**
         * 关闭导入成功后的考生列表
         */
        $scope.hideImportList = function(){
          $scope.showImportStuds = false;
        };

        /**
         * 取消添加新考试
         */
        $scope.cancelAddStudent = function(){
          $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
        };

        /**
         * 取消导入考生
         */
        $scope.cancelImportStudent = function(){
          $scope.isImportKaoSheng = false; //导入考生页面显示隐藏
          $scope.showImportStuds = false; //隐藏考生列表table
        };

        /**
         * 保存新添加的考生
         */
        $scope.saveNewStudent = function(){
          var usr = {};
          var studentName = $('.studentName');
          var studentID = $('.studentID');
          if(!studentName.val()){
            $scope.studentNameIsNull = true;
          }
          if(!studentID.val()){
            $scope.studentIDIsNull = true;
          }
          if(studentName.val() && studentID.val()){
            usr.XINGMING = studentName.val();
            usr.ZHENGJIANHAO = studentID.val();
            kaoshi_data.shuju.KAOCHANG[0].USERS.push(usr);
            studentName.val('');
            studentID.val('');
          }
        };

        /**
         * 删除考生
         */
        $scope.deleteStudent = function(idx){
          kaoshi_data.shuju.KAOCHANG[0].USERS.splice(idx, 1);
        };

        /**
         * 检查输入的学号和姓名是否为空
         */
        $scope.checkInputVal = function(){
          var studentName = $('.studentName').val(),
            studentID = $('.studentID').val();
          if(studentName){
            $scope.studentNameIsNull = false;
          }
          if(studentID){
            $scope.studentIDIsNull = false;
          }
        };

        /**
         * 计算结束时间
         */
        $scope.calculateEndDate = function(){
          var inputStartDate = $('.start-date').val();
          if(inputStartDate && kaoshi_data.shuju.SHICHANG){
            var startDate = Date.parse(inputStartDate), //开始时间
              endDate = startDate + kaoshi_data.shuju.SHICHANG * 60 * 1000; //结束时间
            kaoshi_data.shuju.JIESHUSHIJIAN = DataService.formatDateZh(endDate);
          }
        };

        /**
         * 保存考试
         */
        $scope.saveKaoShi = function(){
          var inputStartDate = $('.start-date').val();
          var inputEndDate = $('.end-date').val();
          //其他信息判断
          if(inputStartDate){
            if(inputEndDate){
              var startDate = Date.parse(inputStartDate); //开始时间
              var endDate = Date.parse(inputEndDate); //开始时间
              var difTime = endDate - startDate; //结束时间和开考时间的差
              var kaoShiLong = kaoshi_data.shuju.SHICHANG * 60 * 1000;
              if(difTime > 0 && difTime >= kaoShiLong){
                if(kaoshi_data.shuju.KAOCHANG && kaoshi_data.shuju.KAOCHANG.length > 0){
                  $scope.startDateIsNull = false;
                  $scope.endDateIsNull = false;
                  $scope.kwParams.saveKaoShiBtnStat = true;
                  var shijuan_info = { //需要同步的试卷数据格式
                    token: token,
                    caozuoyuan: caozuoyuan,
                    jigouid: jigouid,
                    lingyuid: lingyuid,
                    shijuanid: []
                  };
                  //将已选择的试卷进行数据处理分别添加的同步试卷和考试信息中
                  if($scope.kwParams.selectShiJuan.length > 0){
                    _.each($scope.kwParams.selectShiJuan, function(sj){
                      shijuan_info.shijuanid.push(sj.SHIJUAN_ID);
                    });
                  }
                  kaoshi_data.shuju.KAISHISHIJIAN = inputStartDate;
                  kaoshi_data.shuju.JIESHUSHIJIAN = inputEndDate;
                  kaoshi_data.shuju.SHIJUAN_ID = shijuan_info.shijuanid;
                  $scope.loadingImgShow = true;
                  $http.post(tongBuShiJuanUrl, shijuan_info).success(function(rst){
                    if(rst.result){
                      $http.post(xiuGaiKaoShiUrl, kaoshi_data).success(function(data){
                        if(data.result){
                          $scope.showKaoShiList();
                          $scope.loadingImgShow = false;
                          DataService.alertInfFun('suc', '考试添加成功！');
                          $scope.kwParams.selectShiJuan = []; //重置已选择的时间数组
                          $scope.kwParams.selected_bm = '';
                          $scope.kwParams.selected_zy = '';
                        }
                        else{
                          DataService.alertInfFun('err', data.error);
                          $scope.loadingImgShow = false;
                          $scope.kwParams.saveKaoShiBtnStat = false;
                        }
                      });
                    }
                    else{
                      $scope.loadingImgShow = false;
                      DataService.alertInfFun('err', rst.error);
                      $scope.kwParams.saveKaoShiBtnStat = false;
                    }
                  });
                }
                else{
                  DataService.alertInfFun('err', '请选择考场！');
                }
              }
              else{
                DataService.alertInfFun('pmt', '结束时间与结束时间的差值小于考试时间！');
              }
            }
            else{
              DataService.alertInfFun('pmt', '结束时间不能为空！');
              $scope.endDateIsNull = true;
            }
          }
          else{
            DataService.alertInfFun('pmt', '开考时间不能为空！');
            $scope.startDateIsNull = true;
          }
        };

        /**
         * 修改考试
         */
        $scope.editKaoShi = function(ks){
          isEditKaoShi = true;
          isDeleteKaoShi = false;
          $scope.addNewKaoShi(ks);
        };

        /**
         * 删除考试
         */
        $scope.deleteKaoShi = function(ks){
          isEditKaoShi = false;
          isDeleteKaoShi = true;
          var kaoshiData = { //考试的数据格式
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju:{
              KAOSHI_ID: ks.KAOSHI_ID,
              ZHUANGTAI: -1
            }
          };
          //$scope.addNewKaoShi(ks);
          var confirmInfo = confirm("确定要删除考试吗？");
          if(confirmInfo){
            $http.post(xiuGaiKaoShiUrl, kaoshiData).success(function(data){
              if(data.result){
                $scope.showKaoShiList($scope.kwParams.ksListZt);
                DataService.alertInfFun('suc', '考试删除成功！');
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 发布考试 faBuKaoShiBaseUrl
         */
        $scope.faBuKaoShi = function(ksId){
          var faBuKaoShiUrl = faBuKaoShiBaseUrl + ksId;
          var confirmInfo = confirm('确定要发布本次考试吗？');
          if(confirmInfo){
            $http.get(faBuKaoShiUrl).success(function(data){
              if(data.result){
                $scope.showKaoShiList();
                DataService.alertInfFun('suc', '本次考试发布成功！');
              }
              else{
                DataService.alertInfFun('err', '考试发布失败！');
              }
            });
          }
        };

        /**
         * 查看考试详情
         */
        $scope.seeKaoShiDetail = function(ks){
          $scope.kaoShiDetailData = ks;
          $scope.kwParams.showKaoShiDetail = true;
        };

        /**
         * 查询考场数据
         */
        $scope.getThisKaoChangPageData = function(pg){
          $scope.loadingImgShow = true;
          var pgNum = pg - 1,
            kaochang_id,
            currentPage = pgNum ? pgNum : 0,
            qrySelectKaoChangsUrl;
          //得到分页数组的代码
          var currentKcPageVal = $scope.currentKcPageVal = pg ? pg : 1;
          if(totalKaoChangPage <= paginationLength){
            $scope.kaoChangPages = kaoChangPageArr;
          }
          if(totalKaoChangPage > paginationLength){
            if(currentKcPageVal > 0 && currentKcPageVal <= 6 ){
              $scope.kaoChangPages = kaoChangPageArr.slice(0, paginationLength);
            }
            else if(currentKcPageVal > totalKaoChangPage - 5 && currentKcPageVal <= totalKaoChangPage){
              $scope.kaoChangPages = kaoChangPageArr.slice(totalKaoChangPage - paginationLength);
            }
            else{
              $scope.kaoChangPages = kaoChangPageArr.slice(currentKcPageVal - 5, currentKcPageVal + 5);
            }
          }
          //查询数据的代码
          kaochang_id = kaoChangIdArrRev.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
          qrySelectKaoChangsUrl = qryKaoChangDetailBaseUrl + '&kid=' + kaochang_id;
          $http.get(qrySelectKaoChangsUrl).success(function(kcdtl){
            if(kcdtl.length){
              $scope.loadingImgShow = false; //kaoChangList.html
              _.each(kcdtl, function(kc){
                kc.ips = kc.IP_LIMITS.split(',');
              });
              $scope.kaoChangList = kcdtl;
            }
            else{
              DataService.alertInfFun('err', '没有相关的考场信息！');
              $scope.loadingImgShow = false; //kaoChangList.html
            }
          });
        };

        /**
         * 显示考场列表
         */
        $scope.showKaoChangList = function(){
          $scope.loadingImgShow = true; //kaoChangList.html
          kaoChangPageArr = []; //定义考场页码数组
          kaoChangIdArrRev = []; //存放所有考场ID的数组
          $http.get(qryKaoChangListUrl).success(function(kclst){
            if(kclst.length){
              $scope.kaoChangListIds = kclst; //得到所有的考试ids
              totalKaoChangPage = Math.ceil(kclst.length/itemNumPerPage); //得到所有考试的页码
              for(var i = 1; i <= totalKaoChangPage; i++){
                kaoChangPageArr.push(i);
              }
              kaoChangIdArrRev = _.map(kclst, function(kcid){ return kcid.KID; });
              $scope.lastKaoChangPageNum = totalKaoChangPage; //最后一页的数值
              //查询数据开始
              $scope.getThisKaoChangPageData();
              $scope.txTpl = 'views/kaowu/kaoChangList.html';
              isEditKaoChang = false; //是否为编辑考场
              isDeleteKaoChang = false; //是否为删除考场
            }
            else{
              $scope.txTpl = 'views/kaowu/kaoChangList.html';
              isEditKaoChang = false; //是否为编辑考场
              isDeleteKaoChang = false; //是否为删除考场
              DataService.alertInfFun('err', '没有相关的考场信息！');
              $scope.loadingImgShow = false; //kaoChangList.html
            }
          });
        };

        /**
         * 新增考场
         */
        $scope.addNewKaoChang = function(kc){
          kaochang_data = { //考场的数据格式
            token: token,
            caozuoyuan: caozuoyuan,
            jigouid: jigouid,
            lingyuid: lingyuid,
            shuju:{
              KID: '',
              KMINGCHENG: '',
              KAOWEISHULIANG: '',
              XIANGXIDIZHI: '',
              JIAOTONGFANGSHI: '',
              LIANXIREN: '',
              LIANXIFANGSHI: '',
              KLEIXING: 0,
              PARENT_ID: '',
              KAODIANXINGZHI: 0,
              IP_LIMITS: '',
              ZHUANGTAI: 1
            }
          };
          $scope.ipArray = '';
          if(isEditKaoChang){
            $scope.ipArray = [];
            kaochang_data.shuju.KID = kc.KID;
            kaochang_data.shuju.KMINGCHENG = kc.KMINGCHENG;
            kaochang_data.shuju.KAOWEISHULIANG = kc.KAOWEISHULIANG;
            kaochang_data.shuju.XIANGXIDIZHI = kc.XIANGXIDIZHI;
            kaochang_data.shuju.JIAOTONGFANGSHI = kc.JIAOTONGFANGSHI;
            kaochang_data.shuju.LIANXIREN = kc.LIANXIREN;
            kaochang_data.shuju.LIANXIFANGSHI = kc.LIANXIFANGSHI;
            kaochang_data.shuju.KLEIXING = kc.KLEIXING;
            kaochang_data.shuju.PARENT_ID = kc.PARENT_ID;
            kaochang_data.shuju.KAODIANXINGZHI = kc.KAODIANXINGZHI;
            kaochang_data.shuju.IP_LIMITS = kc.IP_LIMITS;
            kaochang_data.shuju.ZHUANGTAI = kc.ZHUANGTAI;
            var strToArr = kc.IP_LIMITS.split(',');
            _.each(strToArr, function(ip){
              var obj = {ip: ''};
              obj.ip = ip;
              $scope.ipArray.push(obj);
            });
            $scope.kaochangData = kaochang_data;
            $scope.txTpl = 'views/kaowu/editKaoChang.html';
          }
          else if(isDeleteKaoChang){
            kaochang_data.shuju = kc;
            kaochang_data.shuju.ZHUANGTAI = -1;
          }
          else{
            $scope.kaochangData = kaochang_data;
            $scope.ipArray = [
              {ip: ''}
            ];
            $scope.txTpl = 'views/kaowu/editKaoChang.html';
          }
        };

        /**
         * 删除考场
         */
        $scope.deleteKaoChang = function(kc){
          isEditKaoChang = false; //是否为编辑考场
          isDeleteKaoChang = true; //是否为删除考场
          $scope.addNewKaoChang(kc);
          var confirmInfo = confirm("确定要删除考场吗？");
          if(confirmInfo){
            $http.post(xiuGaiKaoChangUrl, kaochang_data).success(function(data){
              if(data.result){
                $scope.showKaoChangList();
                qryAllKaoChang();
                DataService.alertInfFun('suc', '考场删除成功！');
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 修改考场
         */
        $scope.editKaoChang = function(kc){
          isEditKaoChang = true; //是否为编辑考场
          isDeleteKaoChang = false; //是否为删除考场
          $scope.addNewKaoChang(kc);
        };

        /**
         * 新增IP输入框
         */
        $scope.addIpInputBox = function(){
          var obj = {ip: ''};
          $scope.ipArray.push(obj);
        };

        /**
         * 删除IP输入框
         */
        $scope.deleteIpInputBox = function(idx){
          $scope.ipArray.splice(idx, 1);
        };

        /**
         * 保存考场
         */
        $scope.saveKaoChang = function(){
          $scope.loadingImgShow = true; //保存考场
          kaochang_data.shuju.IP_LIMITS = _.map($scope.ipArray, function(ip){
            return ip.ip;
          }).join(',');
          if(kaochang_data.shuju.IP_LIMITS.length){
            $http.post(xiuGaiKaoChangUrl, kaochang_data).success(function(data){
              if(data.result){
                $scope.loadingImgShow = false; //保存考场
                DataService.alertInfFun('suc', '考场保存成功！');
                $scope.showKaoChangList();
              }
              else{
                DataService.alertInfFun('err', data.error);
                $scope.loadingImgShow = false; //保存考场
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '请输入IP！');
            $scope.loadingImgShow = false; //保存考场
          }
        };

        /**
         * 重新加载 mathjax
         */
        //$scope.$on('onRepeatLast', function(scope, element, attrs){
        //  MathJax.Hub.Config({
        //    tex2jax: {inlineMath: [["#$", "$#"]], displayMath: [['#$$','$$#']]},
        //    messageStyle: "none",
        //    showMathMenu: false,processEscapes: true
        //  });
        //  MathJax.Hub.Queue(["Typeset", MathJax.Hub, "kaoWuPaperDetail"]);
        //});
    }]);
});
