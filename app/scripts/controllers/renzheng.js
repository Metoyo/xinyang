define(['angular', 'config', 'underscore'],
  function (angular, config, _) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:RenzhengCtrl
   * @description
   * # RenzhengCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.RenzhengCtrl', [])
    .controller('RenzhengCtrl', ['$rootScope', '$scope', '$location', '$http', 'UrlRedirect', '$cookieStore', 'DataService',
      '$routeParams', '$timeout',
      function ($rootScope, $scope, $location, $http, UrlRedirect, $cookieStore, DataService, $routeParams, $timeout) {
        var baseRzAPIUrl = config.apiurl_rz,
          token = config.token,
          loginApiUrl =  baseRzAPIUrl + 'denglu',
          login = { //教师登录数据格式
            userName: '',
            password: ''
          },
          stuLogin = { //学生登录数据格式
            userName: '',
            password: ''
          },
          loginPostParams,
          session = {},
          urlArr = [],
          currentPath = $location.$$path,
          checkUserUrlBase = config.apiurl_rz + 'check_user?token=' + config.token, //检测用户是否存在的url
          findPwUrlBase = baseRzAPIUrl + 'find_password?token=' + token + '&registeremail=', //忘记密码
          resetPwUrl = baseRzAPIUrl + 'reset_password'; //重置密码

        $rootScope.session = session;
        $rootScope.isRenZheng = true; //判读页面是不是认证
        $scope.login = login;
        $scope.stuLogin = stuLogin;
        $rootScope.isPromiseAlterOthersTimu = false;
        $scope.rzParams = { //全局参数
          registerEmail: '',
          showFindPwWrap: false,
          passwordRegexp:' /^.{6,20}$/',
          emailLink: '',
          sendEmailSuccess: false,
          zhuCeUrl: '',
          homeUrl: '',
          resetPwSuccess: false
        };
        $scope.rzParams.zhuCeUrl = $location.$$protocol + '://' +$location.$$host + ':' + $location.$$port + '/#/register';
        $scope.rzParams.homeUrl = $location.$$protocol + '://' +$location.$$host + ':' + $location.$$port + '/#/renzheng';
        $scope.dengluInfo = false;
        //$scope.stuDengluInfo = false;

        /**
         * 登录程序
         */
        $scope.signIn = function() {
          urlArr = [];
          if(login.userName && login.password) {
            /**
             * 构建登陆回传参数，token, 用户名， 密码
             * @type {{token: (config.token|*), yonghuming: string, mima: string}}
             */
            loginPostParams = {
              token : config.token,
              yonghuming : login.userName,
              mima : login.password
            };
            //登录信息的验证
            $http.post(loginApiUrl, loginPostParams).success(function(result) {
              var jsArr, quanxianDist, userCookie, lingyuCookie, myUrlCookie;
              session.info = result[0];
              session.userInfo = '';
              session.quanxian2032 = false;
              if(result && result.length > 0){
                var profileUrl = '/user/' + login.userName,
                  yhxxxxApiUrl = config.apiurl_rz + 'yonghu_xiangxi_xinxi?token=' + config.token + '&yonghuid=' +
                    session.info.UID; //通过UID查询用户详细的url
                /**
                 *查询过用户的详细信息，得到jigouid,lingyuid等等 JUESE
                 */
                $http.get(yhxxxxApiUrl).success(function(data){
                  if(data.YONGHULEIBIE == 0 || data.YONGHULEIBIE == 1){
                    if(data.JIGOU && data.JIGOU.length > 0){
                      if(data.JUESE && data.JUESE.length > 0){
                        session.userInfo = data;
                        jsArr = _.chain(data.JUESE)
                          .sortBy(function(js){ return js.JUESE_ID; })
                          .map(function(js){ return js.JUESE_ID; })
                          .uniq()
                          .without("9", "10")
                          .value(); //得到角色的数组
                        //把权限加入到对应的领域中
                        quanxianDist = _.groupBy(data.QUANXIAN, function(qx){ return qx.LINGYU_ID; });
                        _.each(data.LINGYU, function(ly){
                          var qxIds = _.map(quanxianDist[parseInt(ly.LINGYU_ID)], function(qx){ return qx.QUANXIAN_ID; });
                          ly.quanxian = qxIds;
                        });
                        if(_.contains(jsArr, "1")){
                          UrlRedirect.goTo(currentPath, profileUrl);
                        }
                        else{
                          /**
                           * 查询用户权限的代码，用来导航，如果权限中包含QUANXIAN_ID包含4就导向审核页面，否则去相对应的页面
                           */
                          var permissions = data.QUANXIAN,
                            find_QUANXIAN_ID_4, find_QUANXIAN_ID_5,
                            quanxianArr = [],
                            urlShowAndHideArr = [],
                            jsUrl = '';
                          find_QUANXIAN_ID_4 = _.find(permissions, function(permission) {
                            return permission.QUANXIAN_ID == 2004;
                          });
                          find_QUANXIAN_ID_5 = _.find(permissions, function(permission) {
                            return permission.QUANXIAN_ID == 2005;
                          });
                          if(find_QUANXIAN_ID_4 || find_QUANXIAN_ID_5) {
                            UrlRedirect.goTo(currentPath, profileUrl);
                          }
                          else {
                            if(data.LINGYU.length == 1){
                              session.defaultLyId = data.LINGYU[0].LINGYU_ID;
                              session.defaultLyName = data.LINGYU[0].LINGYUMINGCHENG;
                              session.defaultTiKuLyId = data.LINGYU[0].LINGYU_ID;
                              quanxianArr = _.map(quanxianDist[parseInt(data.LINGYU[0].LINGYU_ID)], function(qx){
                                return qx.QUANXIAN_ID;
                              });
                              quanxianArr = _.uniq(quanxianArr);
                              //存放权限id的cookies
                              var quanXianCookie = {
                                  quanXianId: quanxianArr
                                },
                                tiKuCookie = {
                                  tkLingYuId: data.LINGYU[0].LINGYU_ID
                                };
                              $cookieStore.put('quanXianCk', quanXianCookie);
                              $cookieStore.put('tiKuCk', tiKuCookie);
                              //根据权限判断导向
                              _.each(config.quanxianObj, function(qx, idx, lst){
                                var navName = _.intersection(qx.qxArr, quanxianArr).length,
                                  urlObj = {
                                    myUrl: '',
                                    urlName: ''
                                  };
                                //显示和隐藏url
                                if(navName > 0){
                                  urlShowAndHideArr.push(qx.navName);
                                  urlObj.myUrl = qx.navName;
                                  urlObj.urlName = qx.hanName;
                                  urlArr.push(urlObj);
                                }
                              });
                              //默认url
                              if(urlShowAndHideArr && urlShowAndHideArr.length > 0){
                                $rootScope.urlArrs = urlArr;
                                //jsUrl = '/' + urlShowAndHideArr[0];
                                var keMuManage = _.contains(quanxianArr, '2032'); //判断科目负责人
                                var hasMingTiUrl = _.contains(urlShowAndHideArr, 'mingti');//判断有没有命题模块
                                if(keMuManage && hasMingTiUrl){
                                  jsUrl = '/mingti';
                                }
                                else{
                                  jsUrl = '/' + urlShowAndHideArr[0];
                                }
                              }
                              session.quanxianStr = urlShowAndHideArr.join();
                              UrlRedirect.goTo(currentPath, jsUrl);
                            }
                            else{
                              UrlRedirect.goTo(currentPath, '/lingyu');
                            }
                          }
                        }
                        //cookies代码
                        userCookie = {
                          UID: $rootScope.session.info.UID,
                          XINGMING: $rootScope.session.info.XINGMING,
                          defaultLyId: session.defaultLyId,
                          defaultLyName: session.defaultLyName,
                          quanxianStr: session.quanxianStr,
                          JIGOU: session.userInfo.JIGOU,
                          JUESE: jsArr
                        };
                        lingyuCookie = {
                          lingyu: data.LINGYU
                        };
                        myUrlCookie = {
                          myUrl: $rootScope.urlArrs
                        };
                        $cookieStore.put('logged', userCookie);
                        $cookieStore.put('lingyuCk', lingyuCookie);
                        $cookieStore.put('myUrlCk', myUrlCookie);
                      }
                      else{
                        DataService.alertInfFun('pmt', '您注册的信息正在审核中，新耐心等待……');
                      }
                    }
                    else{
                      $scope.dengluInfo = false;
                      DataService.alertInfFun('err', '此用户没有机构信息！');
                    }
                  }
                  else if(data.YONGHULEIBIE == 2){
                    var urlObj = {
                      myUrl: 'student',
                      urlName: '员工'
                    };
                    urlArr.push(urlObj);
                    $rootScope.urlArrs = urlArr;
                    //cookies代码
                    userCookie = {
                      UID: $rootScope.session.info.UID,
                      XINGMING: $rootScope.session.info.XINGMING,
                      defaultLyId: 2,
                      defaultLyName: session.defaultLyName,
                      quanxianStr: session.quanxianStr,
                      JIGOU: data.JIGOU[0].JIGOU_ID
                      //JUESE: jsArr,
                      //xuehao: session.info.YONGHUHAO
                    };
                    lingyuCookie = {
                      lingyu: data.LINGYU
                    };
                    myUrlCookie = {
                      myUrl: $rootScope.urlArrs
                    };
                    $cookieStore.put('logged', userCookie);
                    $cookieStore.put('lingyuCk', lingyuCookie);
                    $cookieStore.put('myUrlCk', myUrlCookie);
                    UrlRedirect.goTo(currentPath, '/student');
                  }
                  else{
                    DataService.alertInfFun('err', data.error);
                  }
                });
              }
              else{
                $scope.dengluInfo = true;
              }
            });
          }
        };

        /**
         * 忘记密码
         */
        $scope.sendFindPwEmail = function() {
          if($scope.registerEmail){
            var findPwUrl = findPwUrlBase + $scope.registerEmail,
              mailLink = 'http://mail.' + $scope.registerEmail.split('@').pop();
            $http.get(findPwUrl).success(function(data){
              if(data.result){
                $scope.rzParams.emailLink = mailLink;
                $scope.rzParams.sendEmailSuccess = true;
              }
              else{
                DataService.alertInfFun('err', data.error)
              }
            });
          }
        };

        /**
         * 检查输入的邮箱或者是用户名，在数据库中是否存在
         */
        $scope.checkUsrExist = function(nme, info){
          var checkUserUrl = checkUserUrlBase + '&' + nme + '=' + info;
          $http.get(checkUserUrl).success(function(data){
            if(data.result){
              $scope.youxiangExist = true;
            }
            else{
              $scope.youxiangExist = false;
            }
          });
        };

        /**
         * 重置密码
         */
        $scope.newPasswordObj = {
          token: token,
          email: $routeParams.email,
          newPw: '',
          confirmNewPw: ''
        };
        $scope.restPassword = function(){
          if($scope.newPasswordObj.newPw == $scope.newPasswordObj.confirmNewPw){
            $http.post(resetPwUrl, $scope.newPasswordObj).success(function(data){
              if(data.result){
                $scope.rzParams.resetPwSuccess = true;
                var jumpToHome = function() {
                  UrlRedirect.goTo(currentPath, '/renzheng');
                };
                $timeout(jumpToHome, 5000);
              }
            });
          }
        };

        /**
         * 重置错误信息
         */
        $scope.errorInfoReset = function(){
          $scope.dengluInfo = false;
          login.userName = '';
          login.password = '';
          stuLogin.userName = '';
          stuLogin.password = '';
        };
    }]);
});
