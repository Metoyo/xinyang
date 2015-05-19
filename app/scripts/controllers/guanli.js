define(['angular', 'config', 'jquery', 'underscore'], function (angular, config, $, _) {
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
        var baseMtAPIUrl = config.apiurl_mt; //mingti的api
        var baseGgAPIUrl = config.apiurl_gg; //api的公共接口
        var token = config.token;
        var caozuoyuan = userInfo.UID;//登录的用户的UID
        var jigouid = userInfo.JIGOU[0].JIGOU_ID;
        var lingyuid = $rootScope.session.defaultLyId;
        var operateJgUrl = baseRzAPIUrl + 'jigou'; //操作机构基础url
        var numPerPage = 10; //每页多少条
        var chaXunJiGouYongHuUrl = baseRzAPIUrl + 'query_student'; //查询机构下面的用户
        var xiuGaiYongHu = baseRzAPIUrl + 'xiugai_yonghu';//修改用户
        var modifyJgYh = baseRzAPIUrl + 'jigou_yonghu'; //修改用户的机构
        var modifyKxhYh = baseRzAPIUrl + 'kexuhao_yonghu'; //修改用户的课序号
        var kxhManageUrl = baseRzAPIUrl + 'kexuhao'; //课序号管理的url
        var importUser = baseRzAPIUrl + 'import_users2'; //大批新增用户
        var paginationLength = 7; //分页部分，页码的长度，目前设定为11
        var totalWkPage; //符合条件的员工数据一共有多少页

        $scope.guanliParams = { //学生controller参数
          tabActive: '',
          addNewKxh: '', //添加课序号
          modifyKxh: '',  //修改课序号
          singleWorkName: '', //添加单个员工姓名
          singleWorkID: '', //添加单个员工身份证
          addNewBm: '', //添加新部门
          modifyBm: '', //修改部门
          addWorkJgId: '', //添加员工的机构ID
          select_bm: '' , //添加员工选中的部门ID
          select_bz: '' , //添加员工选中的班组ID
          select_zy: '',  //添加员工选中的专业ID
          shenFenZheng: ''  //人员管理的身份证号
        };
        $scope.showKeXuHaoManage = false;
        $scope.kxhInputShow = false;
        $scope.glEditBoxShow = ''; //弹出层显示那一部分内容
        $scope.glSelectData = ''; //存放需要传入的数据
        $scope.buMenPages = []; //部门分页
        $scope.worksPages = []; //员工分页
        $scope.keXuHaoPages = []; //课序号分页
        $scope.originBuMenData = ''; //存放部门的原始数据
        $scope.selectBmOrKxh = ''; //选中的课序号或者部门的数据
        $scope.renYuanAddType = ''; //人员管理的添加人员的类型
        $scope.workersData = ''; //存放人员信息的变量

        /**
         * 由机构类别查询机构
         */
        var getJgList = function(){
          $scope.originBuMenData = '';
          $scope.loadingImgShow = true;
          var dataLength = ''; //所以二级知识点长度
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
         * 获得课序号数据
         */
        var getKeXuHaoData = function(parm){
          var chaXunKxh = kxhManageUrl + '?token=' + token + '&jigouid=' + jigouid;
          $scope.loadingImgShow = true;
          $http.get(chaXunKxh).success(function(kxh){
            if(kxh && kxh.length > 0){
              if(parm == 'dist'){
                $scope.keXuHaoData = kxh;
                var dataLength = kxh.length; //所以二级知识点长度
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
        };
        $scope.guanLiTabSlide('people');

        /**
         * 通过身份证查询员工
         */
        $scope.chaXunYuanGong = function(sfz){
          $scope.workersData = '';
          $scope.renYuanAddType = '';
          if(sfz){
            var chaXunStuUrl = chaXunJiGouYongHuUrl + '?token=' + token + '&jigouid=' + jigouid + '&sfzh=' + sfz;
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
                if($scope.glSelectData){
                  var originWordData = {
                    token: token,
                    jigouid: $scope.glSelectData.JIGOU_ID,
                    users: [{uid: $scope.glSelectData.UID, zhuangtai: -1}]
                  };
                  $http.post(modifyJgYh, originWordData).success(function(del){
                    if(del.result){
                      DataService.alertInfFun('suc', '修改机构或专业成功！');
                      $scope.renYuanAddType = '';
                      $scope.glSelectData = '';
                      $scope.guanliParams.selected_bz = '';
                      $scope.guanliParams.selected_bm = '';
                      $scope.chaXunYuanGong($scope.guanliParams.shenFenZheng);
                    }
                    else{
                      DataService.alertInfFun('err', del.error);
                    }
                  });
                }
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
                  if($scope.glSelectData){
                    var originKxh = {
                      token: token,
                      kexuhaoid: $scope.glSelectData.KEXUHAO_ID,
                      users: [{uid: $scope.glSelectData.UID, zhuangtai: -1}]
                    };
                    $http.post(modifyKxhYh, originKxh).success(function(delKxh){
                      if(delKxh.result){
                        DataService.alertInfFun('suc', '修改机构或专业成功！');
                        $scope.renYuanAddType = '';
                        $scope.glSelectData = '';
                        $scope.guanliParams.selected_zy = '';
                        $scope.chaXunYuanGong($scope.guanliParams.shenFenZheng);
                      }
                      else{
                        DataService.alertInfFun('err', delKxh.error);
                      }
                    });
                  }

                }
                else{
                  DataService.alertInfFun('err', data.error);
                }
              });
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
        $scope.showKeXuHaoPop = function(item, data){
          $scope.glSelectData = '';
          $scope.showKeXuHaoManage = true;
          $scope.glEditBoxShow = item;
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
         * 课序号分页数据
         */
        $scope.getKeXuHaoDist = function(pg){
          var startPage = (pg-1) * numPerPage;
          var endPage = pg * numPerPage;
          $scope.currentKxhPageVal = pg;
          $scope.keXuHaoPgData = $scope.keXuHaoData.slice(startPage, endPage);
        };

        /**
         * 删除员工课序号的关系
         */
        $scope.deleteKxhYh = function(yh){
          if(yh){
            var obj = {
              token: token,
              kexuhaoid: '',
              users: [{uid: yh.UID, zhuangtai: -1}]
            };
            if($scope.selectBmOrKxh){
              obj.kexuhaoid = $scope.selectBmOrKxh.KEXUHAO_ID;
              if(confirm('确定要删除此员工吗？')){
                $http.post(modifyKxhYh, obj).success(function(data){
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
            }
            else{
              DataService.alertInfFun('pmt', '请选择要删除员工的课序号！');
            }
          }
          else{
            DataService.alertInfFun('pmt', '请选择要删除的人员！');
          }
        };

        /**
         * 保存课序号修改
         */
        $scope.saveKeXuHaoModify = function(){
          var saveType = $scope.glEditBoxShow;
          var keXuHaoObj;
          if(saveType == 'addKeXuHao'){ //新增课序号
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
                  $scope.guanliParams.addNewKxh = ''; //课序号重置
                  $scope.showKeXuHaoManage = false; //课序号重置
                  DataService.alertInfFun('suc', '新增课序号成功！');
                  getKeXuHaoData('dist');
                }
              });
            }
            else{
              DataService.alertInfFun('pmt', '新课序号为空！');
            }
          }
          if(saveType == 'modifyKeXuHao'){ //修改课序号
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
                    $scope.guanliParams.addNewKxh = ''; //课序号重置
                    $scope.showKeXuHaoManage = false; //课序号重置
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
                      DataService.alertInfFun('pmt', '课序号ID为空！');
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
                    console.log(data);
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
              DataService.alertInfFun('pmt', '请选择课序号！');
            }
          }
        };

        /**
         * 查询课序号下面的员工
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
            DataService.alertInfFun('pmt', '缺少课序号ID！');
          }
        };

        /**
         * 删除课序号
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
            if(confirm('确定要此删除课序号吗？')){
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
                      DataService.alertInfFun('pmt', '课序号ID为空！');
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
              DataService.alertInfFun('pmt', '请选择课序号！');
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
         * 删除员工机构的关系
         */
        $scope.deleteBmYh = function(yh){
          if(yh){
            var obj = {
              token: token,
              jigouid: '',
              users: [{uid: yh.UID, zhuangtai: -1}]
            };
            if($scope.selectBmOrKxh){
              obj.jigouid = $scope.selectBmOrKxh.JIGOU_ID;
              if(confirm('确定要删除此员工吗？')){
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
          //var fields = [{"name": "token", "data": token}];
          //var kaoShengNewArr = [];
          //var trimBlankReg = /\s/g;
          //var delBlank = '';
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
          //DataService.uploadFileAndFieldsToUrl(file, fields, importUser).then(function(result){
          //  $scope.uploadFileUrl = result.data;
          //  $scope.uploadFiles = [];
          //  if(result.data.json){
          //    _.each(result.data.json, function(v, k, l){
          //      _.each(v, function(wk, idx, lst){
          //        var ksObj = {XINGMING: '', ZHENGJIANHAO:''};
          //        _.each(wk, function(v1, k1, l1){
          //          delBlank = k1.replace(trimBlankReg, "");
          //          switch (delBlank){
          //            case '姓名' :
          //              ksObj.XINGMING = v1;
          //              break;
          //            case '身份证':
          //              ksObj.ZHENGJIANHAO = v1;
          //              break;
          //          }
          //        });
          //        kaoShengNewArr.push(ksObj);
          //      });
          //    });
          //    var worksData = {
          //      token: token,
          //      jigouid: 1,
          //      users: ''
          //    };
          //    if(kaoShengNewArr && kaoShengNewArr.length > 0){
          //      worksData.users = kaoShengNewArr;
          //      $http.post(importUser, worksData).success(function(data){
          //        if(data && data.length > 0){
          //          $scope.loadingImgShow = false;
          //          DataService.alertInfFun('suc', '上传成功！');
          //        }
          //        else{
          //          DataService.alertInfFun('err', data.error);
          //        }
          //      });
          //    }
          //  }
          //  else{
          //    $scope.loadingImgShow = false;
          //    DataService.alertInfFun('err', result.error);
          //  }
          //});
        };

      }]);
});
