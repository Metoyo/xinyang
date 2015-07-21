define(['angular', 'config', 'charts','jquery', 'underscore', 'lazy', 'saveas'],
  function (angular, config, charts, $, _, lazy, saveas) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:TongjiCtrl
   * @description
   * # TongjiCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.TongjiCtrl', [])
    .controller('TongjiCtrl', ['$rootScope', '$scope', '$http', '$timeout', 'DataService', '$window',
      function ($rootScope, $scope, $http, $timeout, DataService, $window) {
        /**
         * 操作title
         */
        $rootScope.isRenZheng = false; //判读页面是不是认证

        /**
         * 声明变量
         */
        var userInfo = $rootScope.session.userInfo;
        var baseTjAPIUrl = config.apiurl_tj; //统计的api
        var baseKwAPIUrl = config.apiurl_kw; //考务的api
        var baseGGAPIUrl = config.apiurl_gg; //公共的api
        var token = config.token;
        var caozuoyuan = userInfo.UID;//登录的用户的UID
        var jigouid = userInfo.JIGOU[0].JIGOU_ID;
        var lingyuid = $rootScope.session.defaultLyId;
        var letterArr = config.letterArr;
        var queryKaoShi = baseTjAPIUrl + 'query_kaoshi?token=' + token + '&caozuoyuan=' + caozuoyuan
          + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考试数据
        var qryKaoShiListUrl = baseKwAPIUrl + 'chaxun_kaoshi_liebiao?token=' + token + '&caozuoyuan='
          + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考试UID列表的url
        var qryKaoShiDetailBaseUrl = baseKwAPIUrl + 'chaxun_kaoshi?token=' + token + '&caozuoyuan='
          + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询考试详细的url
        var queryShiJuan = baseTjAPIUrl + 'query_shijuan?token=' + token + '&caozuoyuan=' + caozuoyuan
          + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid; //查询试卷数据
        var queryKaoShengBase = baseTjAPIUrl + 'query_kaosheng?token=' + token; //查询考生数据
        var queryZsdBase = baseTjAPIUrl + 'query_zhishidian?token=' + token; //查询带分数的专业
        var queryTiMuBase = baseTjAPIUrl + 'query_timu?token=' + token; //查询题目数据
        var qryKaoShiByXueHaoBase = baseTjAPIUrl + 'query_kaoshi_by_xuehao?token=' + token + '&jigouid=' + jigouid
          + '&lingyuid=' + lingyuid + '&xuehao='; //查询考试通过考生学号
        var dataNumOfPerPage = 10; //每页显示多少条数据
        var paginationLength = 11; //分页部分，页码的长度，目前设定为11
        var pagesArr = []; //定义考试页码数组
        var tjNeedData = []; //存放查询出来的统计数数据
        var lastPage; //符合条件的考试一共有多少页
        var tjKaoShiData = '';
        var backToWhere = ''; //返回按钮返回到什么列表
        var tjParaObj = {
          pieBox: '',
          barBox: '',
          lineBox: '',
          pieDataAll: '',
          pieDataBanJi: '',
          lineDataAll: '',
          lineDataBanJi: ''
        }; //存放统计参数的Object
        var tjBarData = []; //柱状图数据
        //var exportStuInfoUrl = baseTjAPIUrl + 'export_to_excel'; //导出excel名单
        var exportStuInfoUrl = baseGGAPIUrl + 'json2excel'; //导出excel名单
        var downloadTempFileBase = config.apiurl_tj_ori + 'download_temp_file/';
        var answerReappearBaseUrl = baseTjAPIUrl + 'answer_reappear?token=' + token; //作答重现的url
        var tjKaoShiIds = []; //查询考试数据用到的存放考试ID的数组
        var qryItemDeFenLvBase = baseTjAPIUrl + 'query_timu_defenlv?token=' + token + '&kaoshiid='; //查询每道题目的得分率
        var itemDeFenLv = ''; //存放考生得分率的变量
        var chaXunKaoShiUrl = baseKwAPIUrl + 'chaxun_kaoshi_of_kaosheng'; // 查询考生考试
        var chongZhiKaoShiUrl = baseKwAPIUrl + 'chongzhi_kaoshi_of_kaosheng'; // 重置考试
        var xiuGaiChengJiShiUrl = baseKwAPIUrl + 'xiugai_chengji_of_kaosheng'; // 修改成绩
        var chaXunScoreUrl = baseKwAPIUrl + 'chaxun_kaoshi_chengji?token=' + token; // 查询考试成绩

        $scope.tjKaoShiList = []; //试卷列表
        $scope.tjParas = { //统计用到的参数
          stuIdCount: true,
          nameCount: true,
          classCount: true,
          scoreCount: true,
          timeCount: true,
          zdcxKaoShiId: '', //作答重现用到的考试id
          letterArr: config.letterArr, //题支的序号
          cnNumArr: config.cnNumArr, //汉语的大写数字
          tjBjPgOn: 0, //统计用到的当前班级页码
          tjBjPgLen: 0, //统计用到的班级总分页数
          selectBanJi: '', //当前选中的班级
          lastSelectBj: {
            pageNum: 0,
            banJiIdx: 0
          }, //最后选中的班级
          allStudents: '',
          zsdOriginData: '', //统计——存放专业原始数据的变量
          zsdIdArr: '',
          selectedKaoShi: [], //统计时存放已选择的考试
          studentUid: '', //存放考生UID的字段，用于考生统计
          tongJiType: 'keXuHao',
          xiuGaiScorePop: false, //修改考试弹出
          xiuGaiScore: '' //修改考试弹出
        };

        $scope.selectTongJiKaoShi = '';
        $scope.showMoreKaoShi = false;

        /**
         * 显示考试统计列表
         */
        $scope.showKaoShiTjList = function(){
          if(!($scope.tjKaoShiList && $scope.tjKaoShiList.length > 0)){
            tjKaoShiData = '';
            pagesArr = [];
            tjNeedData = [];
            DataService.getData(qryKaoShiListUrl).then(function(data) {
              if(data && data.length > 0){
                //tjNeedData = data;
                _.each(data, function(kslb){
                  kslb.KAISHISHIJIAN = Date.parse(kslb.KAISHISHIJIAN);
                });
                tjNeedData = _.sortBy(data, function(stuLb){
                  return -stuLb.KAISHISHIJIAN;
                });
                lastPage = Math.ceil(tjNeedData.length/dataNumOfPerPage); //得到所有考试的页码
                $scope.lastPageNum = lastPage;
                for(var i = 1; i <= lastPage; i++){
                  pagesArr.push(i);
                }
                $scope.tjPaging();
              }
            });
          }
          $scope.tj_tabActive = 'kaoshiTj';
          $scope.isTjDetailShow = false;
          $scope.studentData = '';
          $scope.tjSubTpl = 'views/tongji/tj_ks.html';
        };

        /**
         * 显示考生首页
         */
        $scope.showKaoShengTjList = function(){
          $scope.tj_tabActive = 'kaoshengTj';
          $scope.studentData = '';
          $scope.tjKaoShiData = '';
          $scope.tjSubTpl = 'views/tongji/tj_student.html';
        };

        /**
         * 初始化运行的程序
         */
        $scope.showKaoShiTjList();

        /**
         * 试卷统计详情
         */
        $scope.tjShowItemInfo = function(id, idType, comeForm, tjName){
          var queryTiMu, newCont,
            tgReg = new RegExp('<\%{.*?}\%>', 'g');
          if(idType == 'ksId'){
            queryTiMu = queryTiMuBase + '&kaoshiid=' + id;
          }
          if(idType == 'sjId'){
            queryTiMu = queryTiMuBase + '&shijuanid=' + id;
          }
          $http.get(queryTiMu).success(function(data){
            if(!data.error){
              _.each(data, function(tm, idx, lst){
                tm.TIGAN = JSON.parse(tm.TIGAN);
                if(tm.TIXING_ID <= 3){
                  var daanArr = tm.DAAN.split(','),
                    daanLen = daanArr.length,
                    daan = [];
                  for(var i = 0; i < daanLen; i++){
                    daan.push(letterArr[daanArr[i]]);
                  }
                  tm.DAAN = daan.join(',');
                }
                else if(tm.TIXING_ID == 4){
                  if(tm.DAAN == 1){
                    tm.DAAN = '对';
                  }
                  else{
                    tm.DAAN = '错';
                  }
                }
                else if(tm.TIXING_ID == 6){ //填空题
                  //修改填空题的答案
                  var tkDaAnArr = [],
                    tkDaAn = JSON.parse(tm.DAAN),
                    tkDaAnStr;
                  _.each(tkDaAn, function(da, idx, lst){
                    tkDaAnArr.push(da.answer);
                  });
                  tkDaAnStr = tkDaAnArr.join(';');
                  tm.DAAN = tkDaAnStr;
                  //修改填空题的题干
                  newCont = tm.TIGAN.tiGan.replace(tgReg, function(arg) {
                    var text = arg.slice(2, -2),
                      textJson = JSON.parse(text),
                      _len = textJson.size,
                      i, xhStr = '';
                    for(i = 0; i < _len; i ++ ){
                      xhStr += '_';
                    }
                    return xhStr;
                  });
                  tm.TIGAN.tiGan = newCont;
                }
                else{
                }
                backToWhere = comeForm;
              });
              $scope.tjTmQuantity = 5; //加载是显示的题目数量
              $scope.letterArr = config.letterArr; //题支的序号
              $scope.tjTiMuDetail = data;
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
          $scope.tjItemName = tjName;
          $scope.isTjDetailShow = true;
          $scope.myAvgScore = '';
          $scope.tjSubTpl = 'views/tongji/tj_sj_detail.html';
        };

        /**
         * 显示更多试卷统计详情
         */
        $scope.showTjSjMoreDetail = function(){
          if($scope.tjTiMuDetail){
            $scope.tjTmQuantity = $scope.tjTiMuDetail.length; //加载是显示的题目数量
          }
        };

        /**
         * 由统计详情返回列表
         */
        $scope.tjDetailToList = function(){
          if($scope.tj_tabActive == 'kaoshiTj'){ //考试统计的返回按钮
            $scope.showKaoShiTjList();
          }
          if($scope.tj_tabActive == 'kaoshengTj'){ //考生统计的返回按钮
            $scope.showKaoShengTjList();
          }
        };

        /**
         * 考试的分页数据
         */
        $scope.tjPaging = function(pg){
          //得到分页数组的代码
          var currentPage = $scope.currentPage = pg ? pg : 1;
          var kaoshi_id = '';
          var kaoshiStr = '';
          var qrySelectKaoShisUrl;
          if(lastPage <= paginationLength){
            $scope.tjPages = pagesArr;
          }
          if(lastPage > paginationLength){
            if(currentPage > 0 && currentPage <= 6 ){
              $scope.tjPages = pagesArr.slice(0, paginationLength);
            }
            else if(currentPage > lastPage - 5 && currentPage <= lastPage){
              $scope.tjPages = pagesArr.slice(lastPage - paginationLength);
            }
            else{
              $scope.tjPages = pagesArr.slice(currentPage - 5, currentPage + 5);
            }
          }
          //查询数据的代码
          kaoshi_id = tjNeedData.slice((currentPage-1)*10, currentPage*10);
          kaoshiStr = Lazy(kaoshi_id).map(function(ksId){
            return ksId.KAOSHI_ID;
          }).join();
          //查询数据的代码
          qrySelectKaoShisUrl = qryKaoShiDetailBaseUrl + '&kaoshiid=' + kaoshiStr;
          $http.get(qrySelectKaoShisUrl).success(function(ksdtl){
            if(ksdtl.length){
              var ckdArr = Lazy(tjNeedData).filter(function(ckdItem){
                return ckdItem.ckd == true;
              });
              Lazy(ckdArr).each(function(ksId){
                Lazy(ksdtl).each(function(ks){
                  if(ks.KAOSHI_ID == ksId.KAOSHI_ID){
                    ks.ckd = ksId.ckd;
                  }
                });
              });
              $scope.tjKaoShiList = ksdtl;
            }
            else{
              DataService.alertInfFun('pmt', '没有相关的考试！');
            }
          });
        };

        /**
         * 数据排序
         */
        $scope.ksSortDataFun = function(sortItem){
          switch (sortItem){
            case 'stuId' : //学号排序
              if($scope.tjParas.stuIdCount){
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.ZHENGJIANHAO;
                });
                $scope.tjParas.stuIdCount = false;
              }
              else{
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.ZHENGJIANHAO;
                }).reverse();
                $scope.tjParas.stuIdCount = true;
              }
              break;
            case 'name' : //姓名排序，中文
              if($scope.tjParas.nameCount){
                $scope.studentData.sort(function(a,b){
                  return a.XINGMING.localeCompare(b.XINGMING);
                });
                $scope.tjParas.nameCount = false;
              }
              else{
                $scope.studentData.sort(function(a,b){
                  return a.XINGMING.localeCompare(b.XINGMING);
                }).reverse();
                $scope.tjParas.nameCount = true;
              }
              break;
            case 'class' : //班级排序，中文
              if($scope.tjParas.classCount){
                $scope.studentData.sort(function(a,b){
                  return a.JIGOUMINGCHENG.localeCompare(b.JIGOUMINGCHENG);
                });
                $scope.tjParas.classCount = false;
              }
              else{
                $scope.studentData.sort(function(a,b){
                  return a.JIGOUMINGCHENG.localeCompare(b.JIGOUMINGCHENG);
                }).reverse();
                $scope.tjParas.classCount = true;
              }
              break;
            case 'kexuhao' : //专业排序
              if($scope.tjParas.stuIdCount){
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.KEXUHAO;
                });
                $scope.tjParas.stuIdCount = false;
              }
              else{
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.KEXUHAO;
                }).reverse();
                $scope.tjParas.stuIdCount = true;
              }
              break;
            case 'score' : //分数排序
              if($scope.tjParas.scoreCount){
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.ZUIHOU_PINGFEN;
                });
                $scope.tjParas.scoreCount = false;
              }
              else{
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.ZUIHOU_PINGFEN;
                }).reverse();
                $scope.tjParas.scoreCount = true;
              }
              break;
            case 'ksTime' : //开始时间排序
              if($scope.tjParas.timeCount){
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.KAISHISHIJIAN;
                });
                $scope.tjParas.timeCount = false;
              }
              else{
                $scope.studentData = _.sortBy($scope.studentData, function(stu){
                  return stu.KAISHISHIJIAN;
                }).reverse();
                $scope.tjParas.timeCount = true;
              }
              break;
          }
        };

        /**
         * 导出学生,需要的数据为考生列表
         */
        $scope.exportKsInfo = function(stuData){
          //var ksData = {
          //  //sheetName: '',
          //  json: {}
          //};
          var ksData = {

          };
          var ksArr = [];
          var mydateNew = new Date();
          var year = mydateNew.getFullYear(); //根据世界时从 Date 对象返回四位数的年份
          var month = mydateNew.getMonth() + 1; //根据世界时从 Date 对象返回月份 (0 ~ 11)
          var day = mydateNew.getDate(); //根据世界时从 Date 对象返回月中的一天 (1 ~ 31)
          var hour = mydateNew.getHours(); //根据世界时返回 Date 对象的小时 (0 ~ 23)
          var minute = mydateNew.getMinutes(); //根据世界时返回 Date 对象的分钟 (0 ~ 59)
          if(month < 10){
            month = '0' + month;
          }
          if(day < 10){
            day = '0' + day;
          }
          if(hour < 10){
            hour = '0' + hour;
          }
          if(minute < 10){
            minute = '0' + minute;
          }
          var myData = year + month + day + hour + minute;
          //ksData.sheetName = myData;
          //新代码
          _.each(stuData, function(ks){
            var ksObj = {
              '身份证': '',
              '姓名': '',
              '成绩': '',
              '考试时间': '',
              '正确数': '',
              '错误数': '',
              '试卷名称': '',
              '部门': '',
              '班组': ''
            };
            ksObj['身份证'] = ks.ZHENGJIANHAO;
            ksObj['姓名'] = ks.XINGMING;
            ksObj['成绩'] = ks.ZUIHOU_PINGFEN;
            ksObj['考试时间'] = ks.KAISHISHIJIAN;
            ksObj['正确数'] = ks.ZQS;
            ksObj['错误数'] = ks.CWS;
            ksObj['试卷名称'] = ks.SHIJUAN_MINGCHENG;
            ksObj['部门'] = ks.BUMEN_MINGCHENG;
            ksObj['班组'] = ks.BANZU_MINGCHENG;
            ksArr.push(ksObj);
          });
          ksData[myData] = ksArr;

          //ksData.json[myData] = ksArr;

          var ksArr2 = [
            {
              "UID":"3",
              "姓名":"董泉",
              "身份证":"413023197110280011",
              "密码":"123456",
              "部门":"变电运维工区",
              "班组":"",
              "专业":""
            },
            {
              "UID":"4",
              "姓名":"李秋霞 ",
              "身份证":"413001197010150588",
              "密码":"123456",
              "部门":"检修试验工区",
              "班组":"保护二班",
              "专业":""
            },
            {
              "UID":"5",
              "姓名":"孙春雷 ",
              "身份证":"413001196707124895",
              "密码":"123456",
              "部门":"检修试验工区",
              "班组":"管理人员",
              "专业":""
            },
            {
              "UID":"6",
              "姓名":"解东波 ",
              "身份证":"413001197004300535",
              "密码":"123456",
              "部门":"检修试验工区",
              "班组":"管理人员",
              "专业":"变电检修"
            },
            {
              "UID":"7",
              "姓名":"李清恩 ",
              "身份证":"413001196405150078",
              "密码":"123456",
              "部门":"检修试验工区",
              "班组":"管理人员",
              "专业":""
            },
            {
              "UID":"8",
              "姓名":"蔡胜群 ",
              "身份证":"413001196112230015",
              "密码":"123456",
              "部门":"检修试验工区",
              "班组":"管理人员",
              "专业":""
            },
            {
              "UID":"9",
              "姓名":"余信生 ",
              "身份证":"413023195707160056",
              "密码":"26267099",
              "部门":"检修试验工区",
              "班组":"检修一班",
              "专业":"变电检修"
            },
            {
              "UID":"10",
              "姓名":"潘长明 ",
              "身份证":"413001196310140037",
              "密码":"123456",
              "部门":"检修试验工区",
              "班组":"检修一班",
              "专业":""
            }
          ];

          var bodyData = {};
          bodyData[myData] = ksArr2;
          var bodyStr = JSON.stringify(bodyData);

          //var newUrl = 'http://192.168.1.10:5000/json2excel?json=';
          //newUrl += bodyStr;

          var newUrl = 'http://192.168.1.10:5000/json2excel';


          //$http.get(newUrl).success(function(data){
          //  //window.open(newUrl);
          //  console.log(data);
          //  //var blob = new Blob(
          //  //  [data],
          //  //  {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
          //  //);
          //  //saveAs(blob, myData + '.xlsx');
          //});
          //console.log(ksData);
          //$.get(newUrl, function(data){
          //  console.log(data);
          //});

          //$.ajax({
          //  url: newUrl,
          //  type: "POST",
          //  data: {json: bodyStr},
          //  header:{
          //    'Content-type': 'application/json',
          //    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          //  },
          //  responseType: 'arraybuffer',
          //  beforeSend: function(XMLHttpRequest){
          //  },
          //  success: function(data, textStatus, jqXHR){
          //    console.log(jqXHR);
          //    console.log(data);
          //    console.log(textStatus);
          //  },
          //  complete: function(data){ // XMLHttpRequest.responseText
          //    console.log(data);
          //    var blob = new Blob(
          //      [data.responseText]
          //      //{type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
          //    );
          //    saveAs(blob, myData + '.xlsx');
          //  },
          //  error: function(XMLHttpRequest){
          //    DataService.alertInfFun('err', XMLHttpRequest.error);
          //  }
          //});

          //$http({
          //  method: "POST",
          //  url: newUrl,
          //  data: {json: bodyStr},
          //  headers: {
          //    'Content-Type': undefined
          //    //'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          //  },
          //  responseType: 'arraybuffer'
          //}).success(function(data, status, headers){
          //  $("body").append("<iframe src='" + data + "' style='display: block;' ></iframe>");
          //  //var arrayBuffer = data;
          //  //var byteArray = new Uint8Array(arrayBuffer);
          //  //console.log(data[0]);
          //  //console.log(typeof data);
          //  //
          //  //console.log(status);
          //  //console.log(headers);
          //  //var blob = new Blob(
          //  //  [data],
          //  //  {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          //  //);
          //  //saveAs(blob);
          //  //window.open(newUrl);
          //});

          //post的备份
          $http({
            method: "POST",
            url: newUrl,
            data: {json: bodyStr},
            headers: {
              'Content-Type': 'application/download',
              'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            responseType: 'arraybuffer'
          }).success(function(data, status, headers){

            console.log(data);
            //console.log(typeof(data));
            var blob = new Blob(
              [data],
              {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
            );
            saveAs(blob, myData + '.xlsx');
          });

          ////能够执行，少量数据
          //$http({
          //  method: "GET",
          //  url: newUrl,
          //  params: {json: bodyStr},
          //  headers: {
          //    'Content-type': 'application/json',
          //    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          //  },
          //  responseType: 'arraybuffer'
          //}).success(function(data){
          //  console.log(data);
          //  var blob = new Blob(
          //    [data],
          //    {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
          //  );
          //  saveAs(blob, myData + '.xlsx');
          //});
        };

        /**
         * 作答重现
         */
        $scope.zuoDaReappear = function(studId, examId){
          var answerReappearUrl = answerReappearBaseUrl,
            dataDis, tmVal,
            finaData = {
              sj_name: '',
              sj_tm: []
            };
          if(studId){
            answerReappearUrl += '&kaoshengid=' + studId;
          }
          else{
            DataService.alertInfFun('pmt', '缺少考生UID');
            return;
          }
          if(examId){
            answerReappearUrl += '&kaoshiid=' + examId;
          }
          else{
            DataService.alertInfFun('pmt', '缺少考试ID');
            return;
          }
          DataService.getData(answerReappearUrl).then(function(data) {
            if(data && data.length > 0){
              finaData.sj_name = data[0].SHIJUAN_MINGCHENG;
              dataDis = _.groupBy(data, 'DATI_XUHAO');
              _.each(dataDis, function(val, key, list){
                var dObj = {
                  tx_id: key,
                  tx_name: val[0].DATIMINGCHENG,
                  tm: ''
                };
                tmVal = _.each(val, function(tm, idx, lst){
                  var findVal = _.find(itemDeFenLv, function(item){return item.TIMU_ID == tm.TIMU_ID});
                  tm.itemDeFenLv = (findVal.DEFENLV * 100).toFixed(1);
                  if(typeof(tm.TIGAN) == 'string'){
                    tm.TIGAN = JSON.parse(tm.TIGAN);
                  }
                  DataService.formatDaAn(tm);
                });
                dObj.tm = tmVal;
                finaData.sj_tm.push(dObj);
              });
              $scope.showKaoShengList = false;
              $scope.kaoShengShiJuan = finaData;
            }
          });
        };

        /**
         * 关闭作答重新内容
         */
        $scope.closeZuoDaReappear = function(){
          $scope.showKaoShengList = true;
        };

        /**
         * 饼状图数据处理函数
         */
        var pieDataDealFun = function(data){
          var pieDataArr = [
            {
              name : '不及格',
              value : 0
            },
            {
              name : '差',
              value : 0
            },
            {
              name : '中',
              value : 0
            },
            {
              name : '良',
              value : 0
            },
            {
              name : '优',
              value : 0
            }
          ];
          _.each(data, function(item, idx, lst){
            if(item.ZUIHOU_PINGFEN < 60){
              pieDataArr[0].value ++;
            }
            if(item.ZUIHOU_PINGFEN >= 60 && item.ZUIHOU_PINGFEN < 70){
              pieDataArr[1].value ++;
            }
            if(item.ZUIHOU_PINGFEN >= 70 && item.ZUIHOU_PINGFEN < 80){
              pieDataArr[2].value ++;
            }
            if(item.ZUIHOU_PINGFEN >= 80 && item.ZUIHOU_PINGFEN < 90){
              pieDataArr[3].value ++;
            }
            if(item.ZUIHOU_PINGFEN >= 90){
              pieDataArr[4].value ++;
            }
          });
          return pieDataArr;
        };

        /**
         * 折线图数据处理函数
         */
        var lineDataDealFun = function(data){
          var disByScore, lineDataArr = [];
          disByScore = _.groupBy(data, function(item){return item.ZUIHOU_PINGFEN});
          _.each(disByScore, function(v, k, l){
            var ary = [];
            ary[0] = parseInt(k);
            ary[1] = v.length;
            lineDataArr.push(ary);
          });
          return lineDataArr;
        };

        /**
         * 统计函数
         */
        var chartShowFun = function(kind){
          var optPie = { // 饼状图图
            tooltip : {
              trigger : 'item',
              formatter : "{a} <br/>{b} : {c} ({d}%)"
            },
            legend : {
              orient : 'vertical',
              x : 'left',
              //data : '' //数组
              data : ['不及格', '差', '中', '良', '优']
            },
            calculable : true,
            series : [{
              name : '成绩等级',
              type : 'pie',
              radius : '55%',
              center: ['50%', '50%'],
              itemStyle : {
                normal : {
                  label : {
                    position : 'outter',
                    formatter: '{b}:{d}%'
                  },
                  labelLine : {
                    show : true
                  }
                }
              },
              data : ''
            }]
          };
          var optBar = {
            tooltip : {
              trigger : 'axis',
              axisPointer : {
                type : 'shadow'
              }
            },
            legend : {
              data : ['班级平均分']
            },
            calculable : true,
            xAxis : [{
              type : 'category',
              data : [] //此处为变量表示班级数据
            }],
            yAxis : [{
              type : 'value',
              splitArea : {
                show : true
              }
            }],
            grid : {
              x : 30,
              x2 : 30,
              y : 30
            },
            dataZoom : {
              show : true,
              realtime : true,
              start : 0,
              end : '' //此处为变量，是下面表示拖拽的功能
            },
            series : [{
              name : '班级平均分',
              type : 'bar',
              barWidth: 30, //柱子的宽度
              itemStyle : {
                normal: {
                  label : {show: true, position: 'top'},
                  color:'#7FB06B' //柱子的颜色
                }
              },
              data : [], //此处为变量
              markLine : { //平均值直线
                itemStyle:{
                  normal:{
                    color:'#9F79EE'
                  }
                },
                data : [
                  [
                    {name: '平均值起点', xAxis: -1, yAxis: $scope.tjKaoShiPublicData.ksAvgScore, value: $scope.tjKaoShiPublicData.ksAvgScore},
                    {name: '平均值终点', xAxis: 1000, yAxis: $scope.tjKaoShiPublicData.ksAvgScore}
                  ]
                ]
              }
            }]
          };
          var optLine = {
            tooltip : {
              trigger: 'axis',
              formatter: function (params,ticket,callback) {
                return params.seriesName + '</br>' + params.data[0] + '分：' +  params.data[1] + '人';
              }
            },
            legend: {
              data:['所有考生','本班考生']
            },
            grid : {
              x : 40,
              x2 : 30,
              y : 30,
              y2 : 30
            },
            calculable : true,
            xAxis : [
              {
                type : 'value',
                scale:true,
                axisLabel : {
                  formatter: '{value}分'
                }
              }
            ],
            yAxis : [
              {
                type : 'value',
                scale:false,
                axisLabel : {
                  formatter: '{value}人'
                }
              }
            ],
            series : [
              {
                name: '所有考生',
                type: 'line',
                data: tjParaObj.lineDataAll
              },
              {
                name: '本班考生',
                type: 'line',
                data: ''
              }
            ]
          };
          //饼状图数据
          if(kind == 'all'){
            optPie.series[0].data = tjParaObj.pieDataAll;
            optLine.series[1].data = '';
          }
          else{
            optPie.series[0].data = tjParaObj.pieDataBanJi;
            optLine.series[1].data = tjParaObj.lineDataBanJi;
          }
          //柱状图数据
          tjBarData = _.sortBy(tjBarData, function(bj){return -bj.bjAvgScore;});
          Lazy(tjBarData).each(function(bj, idx, lst){
            optBar.xAxis[0].data.push(bj.bjName);
            optBar.series[0].data.push(bj.bjAvgScore);
          });
          if(tjBarData.length <= 5){
            optBar.dataZoom.end = 100;
          }
          else{
            optBar.dataZoom.end = (5 / tjBarData.length) * 100;
          }
          tjParaObj.pieBox.setOption(optPie);
          tjParaObj.barBox.setOption(optBar);
          tjParaObj.lineBox.setOption(optLine);
          $timeout(function (){
            window.onresize = function () {
              tjParaObj.pieBox.resize();
              tjParaObj.barBox.resize();
              tjParaObj.lineBox.resize();
            }
          }, 200);
        };

        /**
         * 整理班级或者专业的数据
         */
        var tidyDivideData = function(originData){
          var totalScore = 0; //考试总分
          var avgScore; //本次考试的平均分
          var idxCount = 1; //给班级加所有值
          var bjOrKxhArray = []; //最终班级数组
          Lazy(originData).each(function(v, k, l){
            var banJiObj = {
              bjName: '',
              bjStu: '',
              bjAvgScore: '',
              bjIdx: ''
            };
            banJiObj.bjName = k;
            banJiObj.bjStu = v;
            banJiObj.bjIdx = idxCount;
            banJiObj.bjAvgScore = (Lazy(v).reduce(function(memo, stu){ return memo + stu.ZUIHOU_PINGFEN; }, 0) / v.length)
              .toFixed(1);
            totalScore += parseInt(banJiObj.bjAvgScore);
            bjOrKxhArray.push(banJiObj);
            idxCount ++;
          });
          avgScore = totalScore / bjOrKxhArray.length;
          if(avgScore == 0){
            $scope.tjKaoShiPublicData.ksAvgScore = 0;
          }
          else{
            $scope.tjKaoShiPublicData.ksAvgScore = avgScore.toFixed(1);
          }
          $scope.tjKaoShiPublicData.sjNum = $scope.tjKaoShiPublicData.shijuan.length;
          tjBarData = bjOrKxhArray;
          $scope.tjKaoShiPublicData.bjOrKxh = bjOrKxhArray;
          $scope.tjBanJi = bjOrKxhArray.slice(0, 5);
          $scope.tjParas.tjBjPgOn = 0;
          $scope.tjParas.tjBjPgLen = Math.ceil(bjOrKxhArray.length / 5);
          $scope.tjParas.lastSelectBj = {
            pageNum: 0,
            banJiIdx: 0
          };
          $scope.tjByBanJi('all');
        };

        /**
         * 查询专业
         */
        var tjQryZsd = function(lx){
          var zsdAllArr = []; //存放所有专业数组
          var queryZsd = queryZsdBase + '&kaoshiid=' + tjKaoShiIds.toString() + '&qrytype=' + lx;
          var allBanJi;
          DataService.getData(queryZsd).then(function(zsdData) {
            var disByZsd;
            if(zsdData && zsdData.length > 0){
              $scope.tjParas.zsdOriginData = angular.copy(zsdData);
              disByZsd = Lazy(zsdData).groupBy(function(zsd){ return zsd.ZHISHIDIANMINGCHENG; });
              Lazy(disByZsd).each(function(v, k, l){
                var zsdObj = {
                  zsd_id: v[0].ZHISHIDIAN_ID,
                  zsd_name: k,
                  zsd_dfl_all: '', //总得分率
                  zsd_dfl_bj: '', //班级得分率
                  zsd_timu_num: 0, //使用次数
                  zsd_timu_num_bj: 0
                };
                if(lx == 'banji'){
                  allBanJi = Lazy(v).find(function(bj){ return bj.BANJI == 'all_banji'; });
                }
                if(lx == 'kexuhao'){
                  allBanJi = Lazy(v).find(function(bj){ return bj.KEXUHAO == 'all_kexuhao'; });
                }
                if(allBanJi){
                  if(allBanJi.DEFENLV && allBanJi.DEFENLV > 0){
                    zsdObj.zsd_dfl_all = parseFloat((allBanJi.DEFENLV * 100).toFixed(1));
                  }
                  else{
                    zsdObj.zsd_dfl_all = 0;
                  }
                  zsdObj.zsd_timu_num = allBanJi.TIMUSHULIANG;
                  zsdAllArr.push(zsdObj);
                }
              });
              $scope.tjZsdDataUd = Lazy(zsdAllArr).sortBy(function(item){ return item.zsd_dfl_all}).reverse().toArray();
              $scope.tjParas.zsdIdArr = Lazy($scope.tjZsdDataUd).map(function(item){ return item.zsd_id}).toArray();
              if($scope.tjZsdDataUd.length > 5){
                $scope.tjZsdData = $scope.tjZsdDataUd.slice(0, 5);
              }
              else{
                $scope.tjZsdData = $scope.tjZsdDataUd;
              }
            }
            else{
              $scope.tjZsdDataUd = '';
              $scope.tjParas.zsdIdArr = '';
            }
          });
        };

        /**
         * 统计，以专业为准
         */
        var keXuHaoDateManage = function(data){
          var disByKeXuHao; //按专业分组obj
          /* 按专业分组统计数据，用在按专业统计柱状图中 */
          disByKeXuHao = Lazy(data).groupBy(function(stu){
            if(!stu.KEXUHAO){
              stu.KEXUHAO = '空';
            }
            return stu.KEXUHAO;
          });
          tidyDivideData(disByKeXuHao);
          //查询专业
          tjQryZsd('kexuhao');
        };

        /**
         * 统计，以班级为准
         */
        var banJiDateManage = function(data){
          var disByBanJi; //按班级分组obj
          /* 按班级分组统计数据，用在按班级统计柱状图中 */
          disByBanJi = Lazy(data).groupBy(function(stu){
            if(!stu.BANJI){
              stu.BANJI = '其他';
            }
            return stu.BANJI;
          });
          tidyDivideData(disByBanJi);
          //查询专业
          tjQryZsd('banji');
        };

        /**
         * 显示考试统计的首页
         */
        $scope.tjKaoShiPublicData = {
          ksname: '',
          ksAvgScore: 0,
          ksRenShu: 0,
          leixing: 0,
          sjNum: 0,
          kaikaodate: '',
          shijuan: [],
          bjOrKxh: []
        };
        $scope.tjShowKaoShiChart = function(ks){
          var queryKaoSheng;
          var isArr = _.isArray(ks); //判读传入的参数是否为数组
          var ksIdStr;
          tjBarData = [];
          tjKaoShiIds = [];
          $scope.tjZsdDataUd = '';
          $scope.tjZsdDataDu = '';
          $scope.tjParas.selectBanJi = '全部';
          $scope.tjParas.tongJiType = 'keXuHao';
          $scope.showKaoShengList = true;
          $scope.tjKaoShiPublicData.ksRenShu = 0;
          $scope.tjKaoShiPublicData.ksname = '';
          $scope.tjParas.selectedKaoShi = [];
          if(isArr){
            Lazy(ks).each(function(item, idx, lst){
              tjKaoShiIds.push(item.KAOSHI_ID); //考试id
              $scope.tjKaoShiPublicData.ksname += item.KAOSHI_MINGCHENG + '；';
              //$scope.tjKaoShiPublicData.ksRenShu += item.KSRS;
              $scope.tjParas.selectedKaoShi.push(item);
              //是否被选择中
              Lazy(tjNeedData).each(function(ksIdObj){
                if(ksIdObj.KAOSHI_ID == item.KAOSHI_ID){
                  ksIdObj.ckd = true;
                }
              });
              item.ckd = true;
            });
          }
          else{
            tjKaoShiIds.push(ks.KAOSHI_ID);
            $scope.tjKaoShiPublicData.ksname = ks.KAOSHI_MINGCHENG;
            //是否被选择中
            Lazy(tjNeedData).each(function(ksIdObj){
              if(ksIdObj.KAOSHI_ID == ks.KAOSHI_ID){
                ksIdObj.ckd = true;
              }
            });
            ks.ckd = true;
            $scope.tjParas.selectedKaoShi.push(ks);
          }
          ksIdStr = tjKaoShiIds.toString();
          queryKaoSheng = chaXunScoreUrl + '&kaoshiid=' + ksIdStr;
          //查询考生
          $http.get(queryKaoSheng).success(function(data){
            if(data && data.length > 0){
              Lazy(data).each(function(xs){
                xs.ZUIHOU_PINGFEN = xs.ZUIHOU_PINGFEN ? xs.ZUIHOU_PINGFEN.toFixed(0) : 0;
                xs.KAISHISHIJIAN = DataService.formatDateUtc(xs.KAISHISHIJIAN);
              });
              $scope.studentData = data;
              $scope.tjParas.allStudents = data;
              $scope.showMoreKaoShi = false;
              /* 饼图用到的数据，全部班级 */
              /* 按专业分组统计数据，用在按专业统计柱状图中 */
              $scope.tjParas.tongJiType = 'keXuHao';
            }
            else{
              $scope.studentData = '';
              $scope.tjParas.allStudents = '';
              DataService.alertInfFun('err', data.error);
            }
          });
          $scope.tj_tabActive = 'kaoshiTj';
          $scope.tjSubTpl = 'views/tongji/tj_ks_chart.html';
        };

        /**
         * 显示更多考试   tjKaoShiList
         */
        $scope.showMoreKaoShiFun = function(){
          if($scope.tjKaoShiList && $scope.tjKaoShiList.length){
            var ckdArr = Lazy(tjNeedData).filter(function(ckdItem){
              return ckdItem.ckd == true;
            });
            Lazy(ckdArr).each(function(ksId){
              Lazy($scope.tjKaoShiList).each(function(ks){
                if(ks.KAOSHI_ID == ksId.KAOSHI_ID){
                  ks.ckd = ksId.ckd;
                }
              });
            });
          }
          $scope.showMoreKaoShi = true;
        };

        /**
         * 关闭更多考试
         */
        $scope.closeKsXuanZhe = function(){
          $scope.showMoreKaoShi = false;
        };

        /**
         * 统计页面试卷多选，将试卷加入到数组
         */
        $scope.addKaoShiToTj = function(event, ks){
          Lazy(tjNeedData).each(function(ksId){
            if(ksId.KAOSHI_ID == ks.KAOSHI_ID){
              ksId.ckd = !ks.ckd;
            }
          });
          ks.ckd = !ks.ckd;
          if(ks.ckd){
            $scope.tjParas.selectedKaoShi.push(ks);
          }
          else{
            if($scope.tjParas.selectedKaoShi.length){
              $scope.tjParas.selectedKaoShi = _.reject($scope.tjParas.selectedKaoShi, function(item){
                return item.KAOSHI_ID == ks.KAOSHI_ID;
              });
            }
          }
        };

        /**
         * 统计全选本页的考试 $scope.tjKaoShiList
         */
        $scope.tjCheckPageKs = function(){
          Lazy($scope.tjKaoShiList).each(function(tjks){
            Lazy(tjNeedData).each(function(ksId){
              if(ksId.KAOSHI_ID == tjks.KAOSHI_ID){
                ksId.ckd = true;
              }
            });
            var findInKs = Lazy($scope.tjParas.selectedKaoShi).find(function(slks){
              return slks.KAOSHI_ID == tjks.KAOSHI_ID;
            });
            tjks.ckd = true;
            if(!findInKs){
              $scope.tjParas.selectedKaoShi.push(tjks);
            }
          });
        };

        /**
         * 班级列表分页
         */
        $scope.banJiPage = function(direction){
          if(direction == 'down'){
            $scope.tjParas.tjBjPgOn ++;
            if($scope.tjParas.tjBjPgOn < $scope.tjParas.tjBjPgLen){
              $scope.tjBanJi = $scope.tjKaoShiPublicData.bjOrKxh.slice($scope.tjParas.tjBjPgOn * 5, ($scope.tjParas.tjBjPgOn + 1) * 5);
            }
            else{
              $scope.tjParas.tjBjPgOn = $scope.tjParas.tjBjPgLen - 1;
            }
          }
          else{
            $scope.tjParas.tjBjPgOn --;
            if($scope.tjParas.tjBjPgOn >= 0){
              $scope.tjBanJi = $scope.tjKaoShiPublicData.bjOrKxh.slice($scope.tjParas.tjBjPgOn * 5, ($scope.tjParas.tjBjPgOn + 1) * 5);
            }
            else{
              $scope.tjParas.tjBjPgOn = 0;
            }
          }
        };

        /**
         * 通过班级统计
         */
        $scope.tjByBanJi = function(bj){
          var addActiveFun;
          tjParaObj.lineDataBanJi = '';
          $scope.tjParas.lastSelectBj = {
            pageNum: $scope.tjParas.tjBjPgOn,
            banJiIdx: ''
          };
          //专业数据,初始化班级数据
          _.each($scope.tjZsdDataUd, function(zsd, idx, lst){
            zsd.zsd_dfl_bj = '';
            zsd.zsd_timu_num_bj = 0;
          });
          if(bj == 'all'){
            $scope.tjParas.selectBanJi = '全部';
            $scope.tjParas.lastSelectBj.banJiIdx = 0;
            $scope.studentData = $scope.tjParas.allStudents;
            //饼图数据，单个班级
            addActiveFun = function(){
              tjParaObj.lineBox = echarts.init(document.getElementById('chartLine'));
              chartShowFun('all');
            };
            $timeout(addActiveFun, 100);
          }
          else{
            var disByBj, banJiZsd, disByZsd, sumAll, sumSgl, posIdx;
            $scope.tjParas.selectBanJi = bj.bjName;
            $scope.tjParas.lastSelectBj.banJiIdx = bj.bjIdx;
            $scope.studentData = bj.bjStu;
            //饼状图数据，单个班级
            tjParaObj.pieDataBanJi = pieDataDealFun(bj.bjStu);
            //折线图，班级数据
            tjParaObj.lineDataBanJi = lineDataDealFun(bj.bjStu);
            //饼图数据
            addActiveFun = function(){
              tjParaObj.lineBox = echarts.init(document.getElementById('chartLine'));
              chartShowFun();
            };
            $timeout(addActiveFun, 100);
            //专业数据
            if($scope.tjParas.tongJiType && $scope.tjParas.tongJiType == 'banJi'){
              disByBj = _.groupBy($scope.tjParas.zsdOriginData, function(zsd){
                if(!zsd.BANJI){
                  zsd.BANJI = '其他';
                }
                return zsd.BANJI;
              });
            }
            if($scope.tjParas.tongJiType && $scope.tjParas.tongJiType == 'keXuHao'){
              disByBj = _.groupBy($scope.tjParas.zsdOriginData, function(zsd){
                if(!zsd.KEXUHAO){
                  zsd.KEXUHAO = '其他';
                }
                return zsd.KEXUHAO;
              });
            }
            banJiZsd = disByBj[bj.bjName];
            if(banJiZsd){
              disByZsd = _.groupBy(banJiZsd, function(zsd){ return zsd.ZHISHIDIANMINGCHENG; }); //用专业把数据分组
              _.each(disByZsd, function(v, k, l) {
                posIdx = _.indexOf($scope.tjParas.zsdIdArr, v[0].ZHISHIDIAN_ID);
                $scope.tjZsdDataUd[posIdx].zsd_timu_num_bj = v[0].TIMUSHULIANG;
                if(v[0].DEFENLV && v[0].DEFENLV > 0){
                  $scope.tjZsdDataUd[posIdx].zsd_dfl_bj = (v[0].DEFENLV * 100).toFixed(1);
                }
                else{
                  $scope.tjZsdDataUd[posIdx].zsd_dfl_bj = 0;
                }
              });
            }
          }
        };

        /**
         * 考试统计类型切换（班级和专业）
         */
        $scope.switchTongJiType = function(tjType){
          if(tjType == 'keXuHao'){
            keXuHaoDateManage($scope.tjParas.allStudents);
          }
          if(tjType == 'banJi'){
            banJiDateManage($scope.tjParas.allStudents);
          }
          tjParaObj.pieBox = echarts.init(document.getElementById('chartPie'));
          tjParaObj.barBox = echarts.init(document.getElementById('chartBar'));
          tjParaObj.lineBox = echarts.init(document.getElementById('chartLine'));
        };

        /**
         * 通过试卷统计
         */
        $scope.tjByShiJuan = function(){

        };

        /**
         * 查询考试通过考生身份证
         */
        $scope.qryKaoShiByZJH = function(){
          if($scope.tjParas.studentUid){
            var stuObj = {
              token: token,
              shuju: {
                ZHENGJIANHAO: $scope.tjParas.studentUid,
                JIGOU_ID: 1,
                NEW: false
              }
            };
            $http.get(chaXunKaoShiUrl, {params: stuObj}).success(function(data){
              if(data && data.length > 0){
                $scope.tjKaoShiData = data;
                $scope.studentData = '';
                $scope.showKaoShengList = true;
                $scope.tjSubTpl = 'views/tongji/tj_stud_detail.html';
              }
              else{
                $scope.kaoShiList = '';
              }
            });
          }
        };

        /**
         * 作答重现查询没道题目的得分率
         */
        var qryItemDeFenLv = function(ksId){
          var qryItemDeFenLvUrl = qryItemDeFenLvBase + ksId;
          itemDeFenLv = '';
          if(ksId){
            DataService.getData(qryItemDeFenLvUrl).then(function(data) {
              if(data && data.length > 0) {
                itemDeFenLv = data;
              }
            });
          }
          else{
            itemDeFenLv = '';
            DataService.alertInfFun('pmt', '缺少考试ID');
          }
        };

        /**
         * 由考试查询考生
         */
        $scope.qryKaoSheng = function(id){
          if(id){
            var qryKaoShengUrl = queryKaoShengBase + '&kaoshiid=' + id;
            $scope.tjParas.zdcxKaoShiId = id;
            DataService.getData(qryKaoShengUrl).then(function(data) {
              if(data && data.length > 0) {
                $scope.studentData = data;
                $scope.tjKaoShiData = '';
                $scope.showKaoShengList = true;
                qryItemDeFenLv(id);
                $scope.tjSubTpl = 'views/tongji/tj_stud_detail.html';
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '缺少考试ID');
          }
        };

        /**
         * 点击更多，查看更多专业
         */
        $scope.getMoreZsd = function(){
          $scope.tjZsdData = $scope.tjZsdDataUd;
        };

        /**
         * 点击收起，收起更多专业
         */
        $scope.closeMoreZsd = function(){
          $scope.tjZsdData = $scope.tjZsdDataUd.slice(0, 5);
        };

        /**
         * 修改考生成绩
         */
        var needXiuGaiKs = '';
        $scope.changKaoShengScore = function(cj){
          $scope.tjParas.xiuGaiScorePop = true;
          needXiuGaiKs = cj;
        };

        /**
         * 确定改分
         */
        $scope.queDingGaiFen = function(){
          var csObj = {
            token: token,
            shuju: {
              ZHENGJIANHAO: '',
              KAOSHI_ID: '',
              CHENGJI: ''
            }
          };
          if(needXiuGaiKs){
            csObj.shuju.ZHENGJIANHAO = needXiuGaiKs.ZHENGJIANHAO;
            csObj.shuju.KAOSHI_ID = needXiuGaiKs.KAOSHI_ID;
            if($scope.tjParas.xiuGaiScore){
              csObj.shuju.CHENGJI = $scope.tjParas.xiuGaiScore;
            }
            else{
              DataService.alertInfFun('pmt', '请填写分数！');
            }
            csObj.shuju.ZHENGJIANHAO = needXiuGaiKs.ZHENGJIANHAO;
            $http.post(xiuGaiChengJiShiUrl, csObj).success(function(data){
              if(data.result){
                DataService.alertInfFun('suc', '改分成功！');
                $scope.tjParas.xiuGaiScorePop = false;
                needXiuGaiKs = '';
                $scope.tjParas.xiuGaiScore = '';
                $scope.tjShowKaoShiChart($scope.tjParas.selectedKaoShi);
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '请选择要修改的员工！');
          }
        };

        /**
         * 取消改分
         */
        $scope.closeGaiFen = function(){
          $scope.tjParas.xiuGaiScorePop = false;
        };

        /**
         * 重置考试
         */
        $scope.resetThisKaoShi = function(ksId){
          var czObj = {
            token: token,
            shuju: {
              ZHENGJIANHAO: $scope.tjParas.studentUid,
              KAOSHI_ID: ksId
            }
          };
          $http.get(chongZhiKaoShiUrl, {params: czObj}).success(function(data){
            if(data.result){
              DataService.alertInfFun('suc', '重置成功！');
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

    }])
});
