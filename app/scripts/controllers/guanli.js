define(['angular', 'config', 'jquery', 'underscore', 'lazy'], function (angular, config, $, _, lazy) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:GuanLiCtrl
   * @description
   * # GuanLiCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.GuanLiCtrl', [])
    .controller('GuanLiCtrl', ['$rootScope', '$scope', 'DataService', '$http', '$location',
      function ($rootScope, $scope, DataService, $http, $location) {
        /**
         * 定义变量
         */
        $rootScope.isRenZheng = false; //判读页面是不是认证
        /**
         * 声明变量
         */
        var userInfo = $rootScope.session.userInfo;
        var baseRzAPIUrl = config.apiurl_rz; //renzheng的api;
        var baseMtAPIUrl = config.apiurl_mt; //mingti的api
        var baseKwAPIUrl = config.apiurl_kw; //考务的api
        var token = config.token;
        var caozuoyuan = userInfo.UID;//登录的用户的UID
        var jigouid = userInfo.JIGOU[0].JIGOU_ID;
        var lingyuid = $rootScope.session.defaultLyId;
        var operateJgUrl = baseRzAPIUrl + 'jigou'; //操作机构基础url
        var numPerPage = 10; //每页多少条
        var chaXunJiGouYongHuUrl = baseRzAPIUrl + 'query_student'; //查询机构下面的用户
        var xiuGaiYongHu = baseRzAPIUrl + 'xiugai_yonghu';//修改用户
        var modifyJgYh = baseRzAPIUrl + 'jigou_yonghu'; //修改用户的机构
        var modifyKxhYh = baseRzAPIUrl + 'kexuhao_yonghu'; //修改用户的专业
        var kxhManageUrl = baseRzAPIUrl + 'kexuhao'; //专业管理的url
        var importUser = baseRzAPIUrl + 'import_users2'; //大批新增用户
        var paginationLength = 7; //分页部分，页码的长度，目前设定为11
        var totalWkPage; //符合条件的员工数据一共有多少页
        var addMingTiRen = baseRzAPIUrl + 'chuangjian_mingti_jiaoshi'; //增加命题人员
        var qryMoRenDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid=1'
          + '&lingyuid=2' + '&chaxunzilingyu=true' + '&moren=1'; //查询默认知识大纲的url
        var qryKnowledgeBaseUrl = baseMtAPIUrl + 'chaxun_zhishidagang_zhishidian?token=' + token + '&caozuoyuan=' +
          caozuoyuan + '&jigouid=1' + '&lingyuid=2' + '&zhishidagangid='; //查询专业基础url
        var downloadTiKuBase = baseMtAPIUrl + 'download_tiku'; //下载题库的url
        var lianXiSwitch = baseKwAPIUrl + 'lianxi_kaiguan'; //关闭练习的开关
        var clearLianXiCj = baseKwAPIUrl + 'clear_lianxichengji?token=' + token; //清楚练习的成绩

        $scope.guanliParams = { //学生controller参数
          tabActive: '',
          addNewKxh: '', //添加专业
          modifyKxh: '',  //修改专业
          singleWorkName: '', //添加单个员工姓名
          singleWorkID: '', //添加单个员工身份证
          addNewBm: '', //添加新部门
          modifyBm: '', //修改部门
          addWorkJgId: '', //添加员工的机构ID
          select_bm: '' , //添加员工选中的部门ID
          select_bz: '' , //添加员工选中的班组ID
          select_zy: '',  //添加员工选中的专业ID
          shenFenZheng: '',  //人员管理的身份证号
          mingTiWorkName: '',  //命题人员的姓名
          mingTiWorkUserName: '',  //命题人员的用户名
          mingTiWorkPw: '',  //命题人员的密码
          zsdId: '',  //专业ID
          tkTiXingId: '',  //题型ID
          naDuId: '',  //难度ID
          lxSwitch: true, //练习的关闭和开启
          addNewBmTitle: '部门' //新增部门的标题
        };
        $scope.showKeXuHaoManage = false;
        $scope.kxhInputShow = false;
        $scope.glEditBoxShow = ''; //弹出层显示那一部分内容
        $scope.glSelectData = ''; //存放需要传入的数据
        $scope.buMenPages = []; //部门分页
        $scope.worksPages = []; //员工分页
        $scope.keXuHaoPages = []; //专业分页
        $scope.originBuMenData = ''; //存放部门的原始数据
        $scope.selectBmOrKxh = ''; //选中的专业或者部门的数据
        $scope.renYuanAddType = ''; //人员管理的添加人员的类型
        $scope.workersData = ''; //存放人员信息的变量

        /**
         * 由机构类别查询机构
         */
        var getJgList = function(){
          $scope.originBuMenData = '';
          $scope.loadingImgShow = true;
          var dataLength = ''; //所以二级专业长度
          var lastPage = ''; //最后一页
          $scope.lastBmPageNum = '';
          $scope.buMenPages = [];
          var qryJiGouUrl = operateJgUrl + '?token=' + token; //查询机构
          DataService.getData(qryJiGouUrl).then(function(data){
            if(data && data.length > 0){
              $scope.originBuMenData = data[0].CHILDREN[0];
              $scope.loadingImgShow = false;
              dataLength = $scope.originBuMenData.CHILDREN.length;
              if(dataLength){
                lastPage = Math.ceil(dataLength/numPerPage);
                $scope.lastBmPageNum = lastPage;
                for(var i = 1; i <= lastPage; i++){
                  $scope.buMenPages.push(i);
                }
              }
              $scope.getThisBuMenPageDate(1);
            }
            else{
              $scope.loadingImgShow = false;
            }
          });
        };

        /**
         * 获得专业数据
         */
        var getKeXuHaoData = function(parm){
          var chaXunKxh = kxhManageUrl + '?token=' + token + '&jigouid=' + jigouid;
          $scope.loadingImgShow = true;
          $http.get(chaXunKxh).success(function(kxh){
            if(kxh && kxh.length > 0){
              $scope.keXuHaoData = kxh;
              if(parm == 'dist'){
                var dataLength = kxh.length; //所以二级专业长度
                var lastPage = Math.ceil(dataLength/numPerPage); //最后一页
                $scope.lastKxhPageNum = lastPage;
                $scope.keXuHaoPages = [];
                if(lastPage){
                  for(var i = 1; i <= lastPage; i++){
                    $scope.keXuHaoPages.push(i);
                  }
                }
                $scope.getKeXuHaoDist(1);
              }
              $scope.loadingImgShow = false;
            }
            else{
              DataService.alertInfFun('err', kxh.error);
            }
          });
        };

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
         * 查询练习状态
         */
        var checkLianXiState = function(){
          var getLxSwitch = lianXiSwitch + '?token=' + token;
          $http.get(getLxSwitch).success(function(data){
            if(data.result){
              $scope.guanliParams.lxSwitch = true;
            }
            else{
              $scope.guanliParams.lxSwitch = false;
            }
            if(data.error){
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 得到分页的部门数据
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
          $scope.workersData = '';
          $scope.worksPages = '';
          if (tab == 'people') {
            $scope.renYuanAddType = '';
            $scope.guanliParams.tabActive = 'people';
            $scope.guanLiTpl = 'views/guanli/renyuan.html';
          }
          if (tab == 'kexuhao') {
            getKeXuHaoData('dist');
            $scope.guanliParams.tabActive = 'kexuhao';
            $scope.guanLiTpl = 'views/guanli/kexuhao.html';
          }
          if (tab == 'bumen') {
            $scope.workersData = '';
            $scope.selectBmOrKxh = '';
            $scope.banZuData = '';
            $scope.guanliParams.addWorkJgId = '';
            $scope.kowledgeList = '';
            $scope.guanliParams.selected_zy = '';
            $scope.guanliParams.selected_bm = '';
            $scope.guanliParams.selected_bz = '';
            $scope.guanliParams.tabActive = 'bumen';
            $scope.guanLiTpl = 'views/guanli/bumen.html';
            getJgList();
          }
          if(tab == 'tiku'){
            getDaGangData();
            $scope.guanliParams.zsdId = '';
            $scope.guanliParams.tkTiXingId = '';
            $scope.guanliParams.naDuId = '';
            $scope.guanliParams.tabActive = 'tiku';
            $scope.guanLiTpl = 'views/guanli/tiku.html';
          }
          if(tab == 'lxswitch'){
            checkLianXiState();
            $scope.guanliParams.tabActive = 'lxswitch';
            $scope.guanLiTpl = 'views/guanli/switch.html';
          }
        };
        $scope.guanLiTabSlide('people');

        /**
         * 通过身份证查询员工
         */
        $scope.chaXunYuanGong = function(sfz){
          $scope.workersData = '';
          $scope.renYuanAddType = '';
          if(sfz){
            var chaXunStuUrl = chaXunJiGouYongHuUrl + '?token=' + token + '&sfzh=' + sfz;
            $http.get(chaXunStuUrl).success(function(data){
              if(data && data.length){
                $scope.workersData = data;
                workPages(data);
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '缺少身份证号！');
          }
        };

        /**
         * 新增员工
         */
        $scope.renYuanAddShow = function(item, data){
          $scope.glSelectData = '';
          if(data){
            $scope.glSelectData = data;
          }
          if(item == 'singleWork'){
            $scope.renYuanAddType = 'singleWork';
            $scope.workersData = '';
            getJgList();
            getKeXuHaoData();
          }
          if(item == 'plWorks'){
            $scope.renYuanAddType = 'plWorks';
            $scope.workersData = '';
            getJgList();
            getKeXuHaoData();
          }
          if(item == 'modifyYhJg'){
            $scope.renYuanAddType = 'modifyYhJg';
            getJgList();
          }
          if(item == 'modifyYhZy'){
            $scope.renYuanAddType = 'modifyYhZy';
            getKeXuHaoData();
          }
          if(item == 'resetPw'){
            $scope.renYuanAddType = 'resetPw';
            $scope.saveNewWork();
          }
          if(item == 'addMingTi'){
            $scope.workersData = '';
            $scope.renYuanAddType = 'addMingTi';
          }
        };

        /**
         * 关闭新增员工界面
         */
        $scope.cancelAddRenYuan = function(){
          $scope.renYuanAddType = '';
        };

        /**
         * 保存新增员工数据
         */
        $scope.saveNewWork = function(){
          var singleWordData;
          //新增单个员工
          if($scope.renYuanAddType == 'singleWork'){
            if($scope.guanliParams.singleWorkName){
              if($scope.guanliParams.singleWorkID){
                singleWordData = {
                  token: token,
                  UID: '',
                  MIMA: '123456',
                  YONGHULEIBIE: 2,
                  XINGMING: $scope.guanliParams.singleWorkName,
                  ZHUANGTAI: 1,
                  ZHENGJIANHAO: $scope.guanliParams.singleWorkID,
                  JIGOU: [{JIGOU_ID: '', ZHUANGTAI: 1}]
                };
                if($scope.guanliParams.selected_bm){
                  if($scope.guanliParams.selected_bz){
                    singleWordData.JIGOU[0].JIGOU_ID = $scope.guanliParams.selected_bz;
                  }
                  else{
                    singleWordData.JIGOU[0].JIGOU_ID = $scope.guanliParams.selected_bm;
                  }
                }
                else{
                  singleWordData.JIGOU[0].JIGOU_ID = 1;
                }
                if($scope.guanliParams.selected_zy){
                  singleWordData.KEXUHAO = [];
                  var kxhObj = {KEXUHAO_ID: $scope.guanliParams.selected_zy, ZHUANGTAI: 1};
                  singleWordData.KEXUHAO.push(kxhObj);
                }
                $http.post(xiuGaiYongHu, singleWordData).success(function(data){
                  if(data.result){
                    $scope.renYuanAddType = '';
                    $scope.guanliParams.singleWorkName = '';
                    $scope.guanliParams.singleWorkID = '';
                    $scope.originBuMenData = '';
                    $scope.banZuData = '';
                    $scope.kowledgeList = '';
                    $scope.guanliParams.selected_bz = '';
                    $scope.guanliParams.selected_bm = '';
                    $scope.guanliParams.selected_zy = '';
                    DataService.alertInfFun('suc', '添加成功！请去相对应的部门查看。');
                  }
                  else{
                    DataService.alertInfFun('err', data.error);
                  }
                });
              }
              else{
                DataService.alertInfFun('pmt', '缺少身份证！');
              }
            }
            else{
              DataService.alertInfFun('pmt', '缺少姓名！');
            }
          }
          //修改单个员工密码
          if($scope.renYuanAddType == 'resetPw'){
            if($scope.glSelectData.UID){
              singleWordData = {
                token: token,
                UID: $scope.glSelectData.UID,
                MIMA: '123456'
              };
              $http.post(xiuGaiYongHu, singleWordData).success(function(data){
                if(data.result){
                  DataService.alertInfFun('suc', '密码重置成功！');
                  $scope.renYuanAddType = '';
                  $scope.glSelectData = '';
                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '缺少UID！');
            }
          }
          //修改员工机构
          if($scope.renYuanAddType == 'modifyYhJg'){
            if($scope.glSelectData.UID){
              singleWordData = {
                token: token,
                jigouid: '',
                users: [{uid: $scope.glSelectData.UID, zhuangtai: 1}]
              };
            }
            if($scope.guanliParams.selected_bm){
              if($scope.guanliParams.selected_bz){
                singleWordData.jigouid = $scope.guanliParams.selected_bz;
              }
              else{
                singleWordData.jigouid = $scope.guanliParams.selected_bm;
              }
            }
            $http.post(modifyJgYh, singleWordData).success(function(data){
              if(data.result){
                $scope.renYuanAddType = '';
                $scope.glSelectData = '';
                $scope.guanliParams.selected_bz = '';
                $scope.guanliParams.selected_bm = '';
                $scope.chaXunYuanGong($scope.guanliParams.shenFenZheng);
                DataService.alertInfFun('suc', '修改机构或专业成功！');
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
          //修改员工专业
          if($scope.renYuanAddType == 'modifyYhZy'){
            if($scope.glSelectData.UID){
              singleWordData = {
                token: token,
                kexuhaoid: '',
                users: [{uid: $scope.glSelectData.UID, zhuangtai: 1}]
              };
            }
            if($scope.guanliParams.selected_zy){
              singleWordData.kexuhaoid = $scope.guanliParams.selected_zy;
              $http.post(modifyKxhYh, singleWordData).success(function(data){
                if(data.result){
                  DataService.alertInfFun('suc', '修改机构或专业成功！');
                  $scope.renYuanAddType = '';
                  $scope.glSelectData = '';
                  $scope.guanliParams.selected_zy = '';
                  $scope.chaXunYuanGong($scope.guanliParams.shenFenZheng);
                  //if($scope.glSelectData){
                  //  var originKxh = {
                  //    token: token,
                  //    kexuhaoid: $scope.glSelectData.KEXUHAO_ID,
                  //    users: [{uid: $scope.glSelectData.UID, zhuangtai: -1}]
                  //  };
                  //  $http.post(modifyKxhYh, originKxh).success(function(delKxh){
                  //    if(delKxh.result){
                  //      DataService.alertInfFun('suc', '修改机构或专业成功！');
                  //      $scope.renYuanAddType = '';
                  //      $scope.glSelectData = '';
                  //      $scope.guanliParams.selected_zy = '';
                  //      $scope.chaXunYuanGong($scope.guanliParams.shenFenZheng);
                  //    }
                  //    else{
                  //      DataService.alertInfFun('err', delKxh.error);
                  //    }
                  //  });
                  //}

                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
          }
          //新增命题人员
          if($scope.renYuanAddType == 'addMingTi'){
            if($scope.guanliParams.mingTiWorkName){
              if($scope.guanliParams.mingTiWorkUserName){
                if($scope.guanliParams.mingTiWorkPw){
                  singleWordData = {
                    token: token,
                    shuju: {
                      YONGHUMING: $scope.guanliParams.mingTiWorkUserName,
                      XINGMING: $scope.guanliParams.mingTiWorkName,
                      MIMA: $scope.guanliParams.mingTiWorkPw
                    }
                  };
                  $http.post(addMingTiRen, singleWordData).success(function(data){
                    if(data.result){
                      $scope.renYuanAddType = '';
                      $scope.guanliParams.singleWorkName = '';
                      $scope.guanliParams.singleWorkID = '';
                      $scope.originBuMenData = '';
                      $scope.banZuData = '';
                      $scope.kowledgeList = '';
                      $scope.guanliParams.selected_bz = '';
                      $scope.guanliParams.selected_bm = '';
                      $scope.guanliParams.selected_zy = '';
                      $scope.guanliParams.mingTiWorkName = '';
                      $scope.guanliParams.mingTiWorkUserName = '';
                      $scope.guanliParams.mingTiWorkPw = '';
                      DataService.alertInfFun('suc', '添加成功！');
                    }
                    else{
                      DataService.alertInfFun('err', data.error);
                    }
                  });
                }
                else{
                  DataService.alertInfFun('pmt', '缺少密码！');
                }
                singleWordData = {
                  token: token,
                  UID: '',
                  MIMA: '123456',
                  YONGHULEIBIE: 2,
                  XINGMING: $scope.guanliParams.singleWorkName,
                  ZHUANGTAI: 1,
                  ZHENGJIANHAO: $scope.guanliParams.singleWorkID,
                  JIGOU: [{JIGOU_ID: '', ZHUANGTAI: 1}]
                };
                if($scope.guanliParams.selected_bm){
                  if($scope.guanliParams.selected_bz){
                    singleWordData.JIGOU[0].JIGOU_ID = $scope.guanliParams.selected_bz;
                  }
                  else{
                    singleWordData.JIGOU[0].JIGOU_ID = $scope.guanliParams.selected_bm;
                  }
                }
                else{
                  singleWordData.JIGOU[0].JIGOU_ID = 1;
                }
                if($scope.guanliParams.selected_zy){
                  singleWordData.KEXUHAO = [];
                  var kxhObj = {KEXUHAO_ID: $scope.guanliParams.selected_zy, ZHUANGTAI: 1};
                  singleWordData.KEXUHAO.push(kxhObj);
                }

              }
              else{
                DataService.alertInfFun('pmt', '缺少用户名！');
              }
            }
            else{
              DataService.alertInfFun('pmt', '缺少姓名！');
            }
          }
        };

        /**
         * 删除员工
         */
        $scope.deleteYuanGong = function(yh){
          var singleWordData = {
            token: token,
            UID: yh.UID,
            ZHUANGTAI: -1
          };
          if(confirm('确定要删除此员工吗？')){
            $http.post(xiuGaiYongHu, singleWordData).success(function(data){
              if(data.result){
                $scope.workersData = _.reject($scope.workersData, function(wk){ return wk.UID == yh.UID; });
                $scope.workersDistData = _.reject($scope.workersDistData, function(wk){ return wk.UID == yh.UID; });
                DataService.alertInfFun('suc', '删除成功！');
                $scope.showKeXuHaoManage = false;
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

        /**
         * 显示弹出层
         */
        $scope.showKeXuHaoPop = function(item, data, subItem){
          $scope.glSelectData = '';
          $scope.showKeXuHaoManage = true;
          $scope.glEditBoxShow = item;
          if(item == 'addBuMen'){
            if(subItem == 'banzu'){
              $scope.guanliParams.addNewBmTitle = '班组';
            }
            else{
              $scope.guanliParams.addNewBmTitle = '部门';
            }
          }
          if(item == 'modifyKeXuHao'){
            $scope.guanliParams.modifyKxh = data.KEXUHAO_MINGCHENG;
          }
          if(item == 'modifyBm'){
            $scope.guanliParams.modifyBm = data.JIGOUMINGCHENG;
          }
          if(item == 'addSingleWork'){
          }
          if(data){
            $scope.glSelectData = data;
          }
        };

        /**
         * 专业分页数据
         */
        $scope.getKeXuHaoDist = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          $scope.currentKxhPageVal = pg;
          $scope.keXuHaoPgData = $scope.keXuHaoData.slice(startPage, endPage);
        };

        /**
         * 删除员工专业的关系
         */
        $scope.deleteKxhYh = function(yh){
          if(yh){
            var obj = {
              token: token,
              kexuhaoid: '',
              users: ''
            };
            if(yh == 'all'){
              obj.users = [];
              Lazy($scope.workersData).each(function(wk){
                var wkObj = {uid: wk.UID, zhuangtai: -1};
                obj.users.push(wkObj);
              });
            }
            else{
              obj.users = [{uid: yh.UID, zhuangtai: -1}];
            }
            if($scope.selectBmOrKxh){
              obj.kexuhaoid = $scope.selectBmOrKxh.KEXUHAO_ID;
              if(confirm('确定要删除员工吗？')){
                $http.post(modifyKxhYh, obj).success(function(data){
                  if(data.result){
                    $scope.workersData = _.reject($scope.workersData, function(wk){ return wk.UID == yh.UID; });
                    $scope.workersDistData = _.reject($scope.workersDistData, function(wk){ return wk.UID == yh.UID; });
                    $scope.chaXunKxhYongHu($scope.selectBmOrKxh);
                    DataService.alertInfFun('suc', '删除成功！');
                    $scope.showKeXuHaoManage = false;
                  }
                  else{
                    DataService.alertInfFun('err', data.error);
                  }
                });
              }
            }
            else{
              DataService.alertInfFun('pmt', '请选择要删除员工的专业！');
            }
          }
          else{
            DataService.alertInfFun('pmt', '请选择要删除的人员！');
          }
        };

        /**
         * 保存专业修改
         */
        $scope.saveKeXuHaoModify = function(){
          var saveType = $scope.glEditBoxShow;
          var keXuHaoObj;
          if(saveType == 'addKeXuHao'){ //新增专业
            if($scope.guanliParams.addNewKxh){
              keXuHaoObj = {
                token: token,
                caozuoyuan: caozuoyuan,
                shuju: {
                  KEXUHAO_ID: '',
                  KEXUHAO_MINGCHENG: $scope.guanliParams.addNewKxh,
                  JIGOU_ID: jigouid,
                  LINGYU_ID: lingyuid
                }
              };
              $http.post(kxhManageUrl, keXuHaoObj).success(function(data){
                if(data.result){
                  $scope.glEditBoxShow = ''; //弹出层显示那一部分内容重置
                  $scope.guanliParams.addNewKxh = ''; //专业重置
                  $scope.showKeXuHaoManage = false; //专业重置
                  DataService.alertInfFun('suc', '新增专业成功！');
                  getKeXuHaoData('dist');
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '新专业为空！');
            }
          }
          if(saveType == 'modifyKeXuHao'){ //修改专业
            if($scope.guanliParams.modifyKxh){
              keXuHaoObj = {
                token: token,
                caozuoyuan: caozuoyuan,
                shuju: {
                  KEXUHAO_ID: '',
                  KEXUHAO_MINGCHENG: $scope.guanliParams.modifyKxh,
                  JIGOU_ID: jigouid,
                  LINGYU_ID: lingyuid
                }
              };
              if($scope.glSelectData){
                keXuHaoObj.shuju.KEXUHAO_ID = $scope.glSelectData.KEXUHAO_ID;
                $http.post(kxhManageUrl, keXuHaoObj).success(function(data){
                  if(data.result){
                    $scope.glEditBoxShow = ''; //弹出层显示那一部分内容重置
                    $scope.guanliParams.addNewKxh = ''; //专业重置
                    $scope.showKeXuHaoManage = false; //专业重置
                    $scope.glSelectData = '';
                    DataService.alertInfFun('suc', '修改成功！');
                    getKeXuHaoData('dist');
                  }
                });
              }
            }
          }
          if(saveType == 'addSingleWork'){ //添加单个员工
            if($scope.guanliParams.singleWorkName){
              if($scope.guanliParams.singleWorkID){
                //先去查询UID
                var chaXunStuUrl = chaXunJiGouYongHuUrl + '?token=' + token + '&jigouid=' + jigouid +
                  '&sfzh=' + $scope.guanliParams.singleWorkID;
                $http.get(chaXunStuUrl).success(function(data){
                  if(data && data.length){
                    keXuHaoObj = {
                      token: token,
                      kexuhaoid: '',
                      users: [{uid: data[0].UID, zhuangtai:1}]
                    };
                    if($scope.selectBmOrKxh){
                      keXuHaoObj.kexuhaoid = $scope.selectBmOrKxh.KEXUHAO_ID;
                      $http.post(modifyKxhYh, keXuHaoObj).success(function(addKxh){
                        if(addKxh.result){
                          DataService.alertInfFun('suc', '添加用户成功!');
                          $scope.renYuanAddType = '';
                          $scope.glSelectData = '';
                          $scope.showKeXuHaoManage = false;
                          $scope.guanliParams.singleWorkName = '';
                          $scope.guanliParams.singleWorkID = '';
                          $scope.chaXunKxhYongHu($scope.selectBmOrKxh);
                        }
                        else{
                          DataService.alertInfFun('err', addKxh.error);
                        }
                      });
                    }
                    else{
                      DataService.alertInfFun('pmt', '专业ID为空！');
                    }
                  }
                  else{
                    DataService.alertInfFun('err', data.error);
                  }
                });
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
            var file = $scope.uploadFiles;
            var worksData = {
              token: token,
              kexuhaoid: ''
            };
            if($scope.selectBmOrKxh){
              worksData.kexuhaoid = $scope.selectBmOrKxh.KEXUHAO_ID;
              $scope.loadingImgShow = true;
              var fd = new FormData();
              for(var j = 1; j <= file.length; j++){
                fd.append('file' + j, file[j - 1]);
              }
              for(var key in worksData){
                fd.append(key, worksData[key]);
              }
              $http.post(modifyKxhYh, fd, {transformRequest: angular.identity, headers:{'Content-Type': undefined}})
                .success(function(data){
                  if(data){
                    $scope.loadingImgShow = false;
                    $scope.showKeXuHaoManage = '';
                    DataService.alertInfFun('suc', '批量新增成功！');
                    $scope.chaXunKxhYongHu($scope.selectBmOrKxh);
                  }
                  else{
                    $scope.loadingImgShow = false;
                    DataService.alertInfFun('err', data.error);
                  }
              });
            }
            else{
              DataService.alertInfFun('pmt', '请选择专业！');
            }
          }
        };

        /**
         * 查询专业下面的员工
         */
        $scope.chaXunKxhYongHu = function(kxh){
          $scope.workersData = '';
          if(kxh){
            $scope.selectBmOrKxh = kxh;
            var chaXunYongHu = chaXunJiGouYongHuUrl + '?token=' + token + '&kexuhaoid=' + kxh.KEXUHAO_ID;
            $http.get(chaXunYongHu).success(function(data){
              if(data && data.length > 0){
                $scope.workersData = data;
                workPages(data);
              }
              else{
                $scope.workersData = '';
                workPages();
              }
            });
          }
          else{
            DataService.alertInfFun('pmt', '缺少专业ID！');
          }
        };

        /**
         * 删除专业
         */
        $scope.deleteKeXuHao = function(kxh){
          var keXuHaoObj = {
            token: token,
            caozuoyuan: caozuoyuan,
            shuju: {
              KEXUHAO_ID: ''
            }
          };
          if(kxh){
            keXuHaoObj.shuju.KEXUHAO_ID = kxh.KEXUHAO_ID;
            if(confirm('确定要此删除专业吗？')){
              $http.delete(kxhManageUrl, {params: keXuHaoObj}).success(function(data){
                if(data.result){
                  DataService.alertInfFun('suc', '删除成功！');
                  getKeXuHaoData('dist');
                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
          }
        };

        /**
         * 关闭专业的弹出层
         */
        $scope.closeKeXuHaoManage = function(){
          $scope.showKeXuHaoManage = false;
          $scope.glEditBoxShow = ''; //弹出层显示那一部分重置
          $scope.guanliParams.addNewKxh = ''; //专业重置
        };

        /**
         * 保存部门修改
         */
        $scope.saveBuMenModify = function(){
          var saveType = $scope.glEditBoxShow;
          var bmParam = $scope.glSelectData;
          if(saveType == 'addBuMen'){ //新增专业
            var newBuMeData = {
              token: token,
              caozuoyuan: caozuoyuan,
              shuju: {
                PARENT_JIGOU_ID: bmParam.JIGOU_ID,
                JIGOU_ID: '',
                JIGOUMINGCHENG: '',
                LEIBIE: 2,
                ZHUANGTAI: 1
              }
            };
            if($scope.guanliParams.addNewBm){
              newBuMeData.shuju.JIGOUMINGCHENG = $scope.guanliParams.addNewBm;
              $http.post(operateJgUrl, newBuMeData).success(function(data){
                if(data.result){
                  $scope.glEditBoxShow = ''; //弹出层显示那一部分内容重置
                  $scope.guanliParams.addNewBm = ''; //部门重置
                  $scope.showKeXuHaoManage = false;
                  getJgList();
                  DataService.alertInfFun('suc', '添加成功！');
                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '新加部门名称为空！');
            }
          }
          if(saveType == 'modifyBm'){ //修改部门
            if($scope.guanliParams.modifyBm){
              var xgBuMeData = {
                token: token,
                caozuoyuan: caozuoyuan,
                shuju: bmParam
              };
              xgBuMeData.shuju.JIGOUMINGCHENG = $scope.guanliParams.modifyBm;
              $http.post(operateJgUrl, xgBuMeData).success(function(data){
                if(data.result){
                  $scope.glEditBoxShow = ''; //弹出层显示那一部分内容重置
                  $scope.guanliParams.modifyBm = ''; //部门重置
                  $scope.showKeXuHaoManage = false;
                  getJgList();
                  DataService.alertInfFun('suc', '修改成功！');
                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '部门名称为空！');
            }
          }
          if(saveType == 'addSingleWork'){ //添加单个员工
            if($scope.guanliParams.singleWorkName){
              if($scope.guanliParams.singleWorkID){
                //先去查询UID
                var chaXunStuUrl = chaXunJiGouYongHuUrl + '?token=' + token + '&jigouid=' + jigouid +
                  '&sfzh=' + $scope.guanliParams.singleWorkID;
                $http.get(chaXunStuUrl).success(function(data){
                  if(data && data.length){
                    var addBmYgObj = {
                      token: token,
                      jigouid: '',
                      users: [{uid: data[0].UID, zhuangtai: 1}]
                    };
                    if($scope.selectBmOrKxh){
                      addBmYgObj.jigouid = $scope.selectBmOrKxh.JIGOU_ID;
                      $http.post(modifyJgYh, addBmYgObj).success(function(addBmYg){
                        if(addBmYg.result){
                          $scope.renYuanAddType = '';
                          $scope.glSelectData = '';
                          $scope.showKeXuHaoManage = false;
                          $scope.guanliParams.singleWorkName = '';
                          $scope.guanliParams.singleWorkID = '';
                          $scope.chaXunJiGouYongHu($scope.selectBmOrKxh);
                          DataService.alertInfFun('suc', '添加用户成功!');
                        }
                        else{
                          DataService.alertInfFun('err', addBmYg.error);
                        }
                      });
                    }
                    else{
                      DataService.alertInfFun('pmt', '专业ID为空！');
                    }
                  }
                  else{
                    DataService.alertInfFun('err', data.error);
                  }
                });
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
            var file = $scope.uploadFiles;
            var worksData = {
              token: token,
              jigouid: ''
            };
            if($scope.selectBmOrKxh){
              worksData.jigouid = $scope.selectBmOrKxh.JIGOU_ID;
              $scope.loadingImgShow = true;
              var fd = new FormData();
              for(var j = 1; j <= file.length; j++){
                fd.append('file' + j, file[j - 1]);
              }
              for(var key in worksData){
                fd.append(key, worksData[key]);
              }
              $http.post(modifyJgYh, fd, {transformRequest: angular.identity, headers:{'Content-Type': undefined}})
                .success(function(data){
                  if(data.result){
                    console.log(data);
                    $scope.loadingImgShow = false;
                    $scope.showKeXuHaoManage = '';
                    DataService.alertInfFun('suc', '批量新增成功！');
                    $scope.chaXunJiGouYongHu($scope.selectBmOrKxh);
                  }
                  else{
                    $scope.loadingImgShow = false;
                    DataService.alertInfFun('err', data.error);
                  }
                });
            }
            else{
              DataService.alertInfFun('pmt', '请选择专业！');
            }
          }
        };

        /**
         * 删除部门
         */
        $scope.deleteBuMen = function(id){
          if(id){
            var delBuMeData = {
              token: token,
              caozuoyuan: caozuoyuan,
              shuju: {
                JIGOU_ID: id
              }
            };
            if(confirm('确定要删除此数据吗?')){
              $http.delete(operateJgUrl, {params: delBuMeData}).success(function(data){
                if(data.result){
                  getJgList();
                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
            }
          }
        };

        /**
         * 查询机构下面的员工
         */
        $scope.chaXunJiGouYongHu = function(bm){
          $scope.workersData = '';
          if(bm){
            $scope.selectBmOrKxh = bm;
            var chaXunYongHu = chaXunJiGouYongHuUrl + '?token=' + token + '&jigouid=' + bm.JIGOU_ID;
            $http.get(chaXunYongHu).success(function(data){
              if(data && data.length > 0){
                $scope.workersData = data;
                workPages(data);
              }
              else{
                $scope.workersData = '';
                workPages();
              }
            });
          }
        };

        /**
         * 由所选机构得到下面的班组
         */
        $scope.getBanZuByBm = function(bmId){
          $scope.guanliParams.addWorkJgId = '';
          $scope.banZuData = '';
          if(bmId){
            $scope.guanliParams.addWorkJgId = bmId;
            var banzu = _.find($scope.originBuMenData.CHILDREN, function(bm){ return bm.JIGOU_ID == bmId; });
            $scope.banZuData = banzu.CHILDREN;
          }
        };

        /**
         * 得到班组的机构ID
         */
        $scope.getBanZuJgId = function(bzId){
          if(bzId){
            $scope.guanliParams.addWorkJgId = bzId;
          }
        };

        /**
         * 删除员工机构的关系 $scope.workersData
         */
        $scope.deleteBmYh = function(yh){
          if(yh){
            var obj = {
              token: token,
              jigouid: '',
              users: ''
            };
            if(yh == 'all'){
              obj.users = [];
              Lazy($scope.workersData).each(function(wk){
                var wkObj = {uid: wk.UID, zhuangtai: -1};
                obj.users.push(wkObj);
              });
            }
            else{
              obj.users = [{uid: yh.UID, zhuangtai: -1}];
            }
            if($scope.selectBmOrKxh){
              obj.jigouid = $scope.selectBmOrKxh.JIGOU_ID;
              if(confirm('确定要删除员工吗？')){
                $http.post(modifyJgYh, obj).success(function(data){
                  if(data.result){
                    $scope.workersData = _.reject($scope.workersData, function(wk){ return wk.UID == yh.UID; });
                    $scope.workersDistData = _.reject($scope.workersDistData, function(wk){ return wk.UID == yh.UID; });
                    $scope.showKeXuHaoManage = false;
                    $scope.chaXunJiGouYongHu($scope.selectBmOrKxh);
                    DataService.alertInfFun('suc', '删除成功！');
                  }
                  else{
                    DataService.alertInfFun('err', data.error);
                  }
                });
              }
            }
            else{
              DataService.alertInfFun('pmt', '请选择要删除员工的机构！');
            }
          }
          else{
            DataService.alertInfFun('pmt', '请选择要删除的人员！');
          }
        };

        /**
         * 员工分页数码
         */
        var workPages = function(wks){
          totalWkPage = [];
          $scope.worksPages = '';
          $scope.lastWkPageNum = '';
          if(wks && wks.length > 10){
            var worksLength;
            var worksLastPage;
            worksLength = wks.length;
            worksLastPage = Math.ceil(worksLength/numPerPage);
            $scope.lastWkPageNum = worksLastPage;
            for(var i = 1; i <= worksLastPage; i++){
              totalWkPage.push(i);
            }
            $scope.workPgDist(1);
          }
          else{
            $scope.workersDistData = $scope.workersData.slice(0);
          }
        };

        /**
         * 员工分页
         */
        $scope.workPgDist = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          var lastPageNum = $scope.lastWkPageNum;
          $scope.currentWkPageVal = pg;
          //得到分页数组的代码
          var currentPageNum = pg ? pg : 1;
          if(lastPageNum <= paginationLength){
            $scope.worksPages = totalWkPage;
          }
          if(lastPageNum > paginationLength){
            if(currentPageNum > 0 && currentPageNum <= 4 ){
              $scope.worksPages = totalWkPage.slice(0, paginationLength);
            }
            else if(currentPageNum > lastPageNum - 4 && currentPageNum <= lastPageNum){
              $scope.worksPages = totalWkPage.slice(lastPageNum - paginationLength);
            }
            else{
              $scope.worksPages = totalWkPage.slice(currentPageNum - 4, currentPageNum + 3);
            }
          }
          $scope.workersDistData = $scope.workersData.slice(startPage, endPage);
        };

        /**
         * 下载题库
         */
        $scope.downloadTiKu = function(){
          var msg = [];
          if(!$scope.guanliParams.zsdId){
            msg.push('专业');
          }
          if(!$scope.guanliParams.tkTiXingId){
            msg.push('题型');
          }
          if(!$scope.guanliParams.naDuId){
            msg.push('难度');
          }
          if(msg.length > 0){
            DataService.alertInfFun('pmt', msg.join() + ',不能为空！');
            return;
          }
          var dataObj = {
            token: token,
            caozuoyuan: caozuoyuan,
            zhishidianid: $scope.guanliParams.zsdId,
            tixingid: $scope.guanliParams.tkTiXingId,
            nanduid: $scope.guanliParams.naDuId
          };
          $scope.loadingImgShow = true;
          $http.post(downloadTiKuBase, dataObj).success(function(data){
            if(data.result){
              $scope.loadingImgShow = false;
              var downloadTempFile = '/temp/tiku',
                aLink = document.createElement('a'),
                evt = document.createEvent("HTMLEvents");
              evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
              aLink.href = downloadTempFile; //url
              aLink.dispatchEvent(evt);
            }
            else{
              $scope.loadingImgShow = false;
              DataService.alertInfFun('err', data.error)
            }
          });
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
        //保存上传文件
        $scope.uploadXlsFile = function() {
          var file = $scope.uploadFiles;
          var worksData = {
            token: token,
            jigouid: 1
          };
          $scope.loadingImgShow = true;
          var fd = new FormData();
          for(var j = 1; j <= file.length; j++){
            fd.append('file' + j, file[j - 1]);
          }
          for(var key in worksData){
            fd.append(key, worksData[key]);
          }
          $http.post(importUser, fd, {transformRequest: angular.identity, headers:{'Content-Type': undefined}}).success(function(data){
            if(data){
              console.log(data);
              $scope.loadingImgShow = false;
              $scope.renYuanAddType = '';
              DataService.alertInfFun('suc', '保存成功！');
            }
            else{
              $scope.loadingImgShow = false;
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 关闭练习
         */
        $scope.closeLianXi = function(){
          var swObj = {
            token: token,
            on: $scope.guanliParams.lxSwitch
          };
          $http.post(lianXiSwitch, swObj).success(function(data){
            if(data.result){
              DataService.alertInfFun('suc', '修改成功！');
            }
            else{
              DataService.alertInfFun('err', data.error);
            }
          });
        };

        /**
         * 清除练习成绩
         */
        $scope.clearLianXiScore = function(){
          if(confirm('确定要清除练习数据吗？')){
            $http.get(clearLianXiCj).success(function(data){
              if(data.result){
                DataService.alertInfFun('suc', '清除练习成绩成功！');
              }
              else{
                DataService.alertInfFun('err', data.error);
              }
            });
          }
        };

      }]);
});
