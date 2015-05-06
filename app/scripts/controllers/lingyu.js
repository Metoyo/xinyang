define(['angular', 'config', 'underscore'],
  function (angular, config, _) {
  'use strict';

  /**
   * @ngdoc function
   * @name xinyangApp.controller:LingyuCtrl
   * @description
   * # LingyuCtrl
   * Controller of the xinyangApp
   */
  angular.module('xinyangApp.controllers.LingyuCtrl', [])
    .controller('LingyuCtrl', ['$rootScope', '$scope', '$location', 'UrlRedirect', '$cookieStore', 'DataService',
      function ($rootScope, $scope, $location, UrlRedirect, $cookieStore, DataService) {
        /**
         * 定义变量和初始化
         */
        var currentPath = $location.$$path,
          session = $rootScope.session,
          lingyu = $cookieStore.get('lingyuCk'),
          urlArr = [];
        $rootScope.isRenZheng = true; //判读页面是不是认证
        $scope.linyuInfo = lingyu.lingyu;

        /**
         * 设置默认的领域
         */
        $scope.goToTargetWeb = function(ly){
          var jsUrl = '', urlShowAndHideArr = [];
          //在session中记录作为默认的领域id和领域名称
          urlArr = [];
          session.defaultLyId = ly.LINGYU_ID;
          session.defaultLyName = ly.LINGYUMINGCHENG;
          session.defaultTiKuLyId = ly.PARENT_LINGYU_ID;
          if(ly.quanxian && ly.quanxian.length > 0){
            //存放权限id的cookies
            var quanXianCookie = {
                quanXianId: ly.quanxian
              },
              tiKuCookie = {
                tkLingYuId: ly.PARENT_LINGYU_ID
              };
            $cookieStore.put('quanXianCk', quanXianCookie);
            $cookieStore.put('tiKuCk', tiKuCookie);
            //根据权限判断导向
            _.each(config.quanxianObj, function(qx, idx, lst){
              var navName = _.intersection(qx.qxArr, ly.quanxian).length,
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
              var keMuManage = _.contains(ly.quanxian, '2032'); //判断科目负责人
              var hasMingTiUrl = _.contains(urlShowAndHideArr, 'mingti');//判断有没有命题模块
              if(keMuManage && hasMingTiUrl){
                jsUrl = '/mingti';
              }
              else{
                jsUrl = '/' + urlShowAndHideArr[0];
              }
            }
            session.quanxianStr = urlShowAndHideArr.join();
            //cookies代码
            var userCookie = $cookieStore.get('logged'),
              myUrlCookie = {
                myUrl: $rootScope.urlArrs
              };
            userCookie.defaultLyId = ly.LINGYU_ID;
            userCookie.defaultLyName = ly.LINGYUMINGCHENG;
            userCookie.quanxianStr = urlShowAndHideArr.join();
            $cookieStore.put('logged', userCookie);
            $cookieStore.put('tiKuCk', tiKuCookie);
            $cookieStore.put('myUrlCk', myUrlCookie);
            UrlRedirect.goTo(currentPath, jsUrl);
          }
          else{
            DataService.alertInfFun('err', ly.LINGYUMINGCHENG + '科目下没有权限，或者您的权限在审批中！');
          }
        }
    }]);
});
