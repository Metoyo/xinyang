/*jshint unused: vars */
define(['angular',
    'config',
    'controllers/dagang',
    'controllers/kaowu',
    'controllers/lingyu',
    'controllers/mingti',
    'controllers/nav',
    'controllers/register',
    'controllers/renzheng',
    'controllers/student',
    'controllers/tongji',
    'controllers/user',
    'controllers/zujuan',
    'directives/bnslideshow',
    'directives/fileupload',
    'directives/hoverslide',
    'directives/nandustar',
    'directives/passwordverify',
    'directives/repeatdone',
    'filters/examstatus',
    'filters/mylocaldate',
    'filters/mylocaldatewithweek',
    'filters/outtigan',
    'services/dataservice',
    'services/urlredirect', 'controllers/guanli',
    'jquery', 'underscore']/*deps*/,
  function (angular, config, DagangCtrl, KaowuCtrl, LingyuCtrl, MingtiCtrl, NavCtrl, RegisterCtrl, RenzhengCtrl, StudentCtrl,
            TongjiCtrl, UserCtrl, ZujuanCtrl, BnSlideShowDirective, FileUploadDirective, HoverSlideDirective,
            NanDuStarDirective, PasswordVerifyDirective, RepeatDoneDirective, ExamStatusFilter,
            MyLocalDateFilter, MyLocalDateWithWeekFilter, OutTiGanFilter, DataServiceService, UrlRedirectService, GuanLiCtrl,
            $, _)/*invoke*/ {
  'use strict';

  /**
   * @ngdoc overview
   * @name xinyangApp
   * @description
   * # xinyangApp
   *
   * Main module of the application.
   */
  return angular
    .module('xinyangApp', [
'xinyangApp.controllers.DagangCtrl',
'xinyangApp.controllers.KaowuCtrl',
'xinyangApp.controllers.LingyuCtrl',
'xinyangApp.controllers.MingtiCtrl',
'xinyangApp.controllers.NavCtrl',
'xinyangApp.controllers.RegisterCtrl',
'xinyangApp.controllers.RenzhengCtrl',
'xinyangApp.controllers.StudentCtrl',
'xinyangApp.controllers.TongjiCtrl',
'xinyangApp.controllers.UserCtrl',
'xinyangApp.controllers.ZujuanCtrl',
'xinyangApp.directives.BnSlideShow',
'xinyangApp.directives.FileUpload',
'xinyangApp.directives.HoverSlide',
'xinyangApp.directives.NanDuStar',
'xinyangApp.directives.PasswordVerify',
'xinyangApp.directives.RepeatDone',
'xinyangApp.filters.ExamStatus',
'xinyangApp.filters.MyLocalDate',
'xinyangApp.filters.MyLocalDateWithWeek',
'xinyangApp.filters.OutTiGan',
'xinyangApp.services.DataService',
'xinyangApp.services.UrlRedirect',
'xinyangApp.controllers.GuanLiCtrl',
/*angJSDeps*/
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
    .config(['$routeProvider', function ($routeProvider) {
      var routes = config.routes;
      /**
       * 根据config文件中的路由配置信息加载本应用中要使用到的路由规则
       */
      for(var path in routes) {
        $routeProvider.when(path, routes[path]);
      }
      $routeProvider.otherwise({redirectTo: '/renzheng'});
    }])
    .run(['$rootScope', '$location', '$route', 'UrlRedirect', '$cookieStore',
      function($rootScope, $location, $route, UrlRedirect, $cookieStore){
        /**
         * 确保所有需要登陆才可以访问的链接进行用户登陆信息验证，如果没有登陆的话，则导向登陆界面
         */
        $rootScope.$on("$locationChangeStart", function(event, next, current) {
          var routes = config.routes,
            nextUrlPattern,
            nextRoute,
            currentUrlParser = document.createElement('a'), // 使用浏览器内置的a标签进行url的解析判断
            nextUrlParser = document.createElement('a'),
            nextPath,
            currentPath,
            session = {
              defaultLyId: '',
              defaultLyName: '',
              quanxianStr: '',
              info: {},
              userInfo: {}
            };
          //cookies 代码
          $cookieStore.put('lastUrl', current);
          var loggedInfo = $cookieStore.get('logged'),
            lastUrl = $cookieStore.get('lastUrl'),
            quanXianIds = $cookieStore.get('quanXianCk'),
            tiKuInfo = $cookieStore.get('tiKuCk'),
            isKeMuManage,
            myUrl = $cookieStore.get('myUrlCk');
          $rootScope.urlArrs = myUrl.myUrl;
          if(quanXianIds){
            if(quanXianIds.quanXianId && quanXianIds.quanXianId.length > 0){
              isKeMuManage = _.contains(quanXianIds.quanXianId, '2032');
            }
          }
          if(loggedInfo && loggedInfo.UID){
            $rootScope.session = session;
            $rootScope.session.defaultLyId = loggedInfo.defaultLyId;
            $rootScope.session.defaultLyName = loggedInfo.defaultLyName;
            $rootScope.session.quanxianStr = loggedInfo.quanxianStr;
            $rootScope.session.info.UID = loggedInfo.UID;
            $rootScope.session.info.XINGMING = loggedInfo.XINGMING;
            $rootScope.session.userInfo.UID = loggedInfo.UID;
            $rootScope.session.userInfo.XINGMING = loggedInfo.XINGMING;
            $rootScope.session.userInfo.JIGOU = loggedInfo.JIGOU;
            $rootScope.session.userInfo.JUESE = loggedInfo.JUESE;
            $rootScope.session.userInfo.xuehao = loggedInfo.xuehao;
          }
          if(tiKuInfo && $rootScope.session){
            $rootScope.session.defaultTiKuLyId = tiKuInfo.tkLingYuId;
          }
          if(isKeMuManage){ //判断科目负责人
            $rootScope.isPromiseAlterOthersTimu = true;
          }
          else{
            $rootScope.isPromiseAlterOthersTimu = false;
          }
          currentUrlParser.href = current; // current为当前的url地址
          nextUrlParser.href = next; // next为即将要访问的url地址
          if(currentUrlParser.protocol === nextUrlParser.protocol
            && currentUrlParser.host === nextUrlParser.host) { // 确保current与next的url地址都是属于同一个网站的链接地址
            nextPath = nextUrlParser.hash.substr(1); // 因为我们使用的是hash即#开头的浏览器端路由， 在这儿解析的时候要去掉#
            /**
             * 测试即将要访问的路由是否已经在我们的angular.js程序中定义
             * @type {*|Mixed}
             */
            var findRoute = _.find($route.routes, function(route, urlPattern) {
              if(route && route !== 'null' && route.regexp) { // 测试即将要访问的url是否否何定义的路由规则
                if(route.regexp.test(nextPath)) {
                  nextUrlPattern = urlPattern; // 记录即将要访问的路由模式，i.e: /user/:name
                  return true;
                }
              }
              return false;
            });
            if(findRoute) { // 如果在我们的路由表中已找到即将要访问的路由， 那么执行以下代码
              nextRoute = routes[nextUrlPattern]; // 找到即将要访问的路由的配置信息
              /**
               * 判断即将要访问的路由是否需要登陆验证， 并且确保如果当前用户没有登陆的话，将用户重定向至登陆界面
               */
              if(nextRoute && nextRoute.requireLogin && !($rootScope.session && $rootScope.session.info)) {
                event.preventDefault(); // 取消访问下一个路由地址
                currentPath = $location.$$path;
                UrlRedirect.goTo(currentPath, '/renzheng');
              }
            }
          }
        });
    }]);
});
