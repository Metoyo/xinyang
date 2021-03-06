/**
 * Created by songtao on 15/5/4.
 */
define( "config", [], function () {
  return {
    token: '12345',
    apiurl_rz: "http://10.230.112.96:3000/api/",//认证的url
    apiurl_mt: "http://10.230.112.96:4000/api/",//命题的url
    apiurl_kw: "http://10.230.112.96:4100/api/",//考务的url
    apiurl_tj: "http://10.230.112.96:4300/api/",//统计的url
    apiurl_tj_ori: "http://10.230.112.96:4300/",//统计的原始url
    apiurl_bm: "http://10.230.112.96:4400/api/",//报名的url
    apiurl_gg: "http://10.230.112.96:2000/",//公共接口
    apiurl_e2j: "http://10.230.112.96:5000/",//excel to json

    //apiurl_rz: "http://192.168.1.10:3000/api/",//认证的url
    //apiurl_mt: "http://192.168.1.10:4000/api/",//命题的url
    //apiurl_kw: "http://192.168.1.10:4100/api/",//考务的url
    //apiurl_tj: "http://192.168.1.10:4300/api/",//统计的url
    //apiurl_tj_ori: "http://192.168.1.10:4300/",//统计的原始url
    //apiurl_bm: "http://192.168.1.10:4400/",//报名的url
    //apiurl_gg: "http://192.168.1.10:2000/",//公共接口
    //apiurl_e2j: "http://192.168.1.10:5000/",//excel to json

    secret: '076ee61d63aa10a125ea872411e433b9',
    hostname: 'localhost:3000',
    letterArr: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
      'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], //英文字母序号数组
    cnNumArr: ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九',
      '二十'], //中文数字序号数组
    routes: {
      '/mingti': {
        templateUrl: '../views/mingti/mingti.html',
        controller: 'MingtiCtrl',
        requireLogin: true
      },
      '/dagang': {
        templateUrl: '../views/dagang/dagang.html',
        controller: 'DagangCtrl',
        requireLogin: true
      },
      '/renzheng': {
        templateUrl: '../views/renzheng/renzheng.html',
        controller: 'RenzhengCtrl',
        requireLogin: false
      },
      '/user/:name': {
        templateUrl: '../views/renzheng/user.html',
        controller: 'UserCtrl',
        requireLogin: true
      },
      '/register/teacher': {
        templateUrl: '../views/partials/register.html',
        controller: 'RegisterCtrl',
        requireLogin: false
      },
      '/register/student': {
        templateUrl: '../views/partials/registerStu.html',
        controller: 'RegisterCtrl',
        requireLogin: false
      },
      '/zujuan': {
        templateUrl: '../views/zujuan/zujuan.html',
        controller: 'ZujuanCtrl',
        requireLogin: true
      },
      '/kaowu': {
        templateUrl: '../views/kaowu/kaowu.html',
        controller: 'KaowuCtrl',
        requireLogin: true
      },
      '/lingyu': {
        templateUrl: '../views/renzheng/selectLingYu.html',
        controller: 'LingyuCtrl',
        requireLogin: true
      },
      '/tongji': {
        templateUrl: '../views/tongji/tongji.html',
        controller: 'TongjiCtrl',
        requireLogin: true
      },
      '/resetPassword/:email': {
        templateUrl: '../views/renzheng/rz_resetPw.html',
        controller: 'RenzhengCtrl',
        requireLogin: false
      },
      '/student': {
        templateUrl: '../views/student/student.html',
        controller: 'StudentCtrl',
        requireLogin: true
      },
      '/guanli': {
        templateUrl: '../views/guanli/guanli.html',
        controller: 'GuanLiCtrl',
        requireLogin: true
      }
    },
    quanxianObj: [ //得到角色是数组
      {
        qxArr: ['2006', '2007'],
        targetUrl: '/dagang',
        navName : 'dagang',
        hanName: '专业'
      },
      {
        qxArr: ['2010', '2011', '2012', '2013', '2031', '2032'],
        targetUrl: '/mingti',
        navName : 'mingti',
        hanName: '命题'
      },
      {
        qxArr: ['2017', '2020', '2021', '2022', '2023', '2030', '2033', '2034'],
        targetUrl: '/zujuan',
        navName : 'zujuan',
        hanName: '组卷'
      },
      {
        qxArr: ['3001'],
        targetUrl: '/kaowu',
        navName : 'kaowu',
        hanName: '考务'
      },
      {
        qxArr: ['4001', '4002'],
        targetUrl: '/tongji',
        navName : 'tongji',
        hanName: '统计'
      },
      {
        qxArr: ['2006', '2007', '2017', '2020', '2021', '2022', '2023', '2030', '2033', '2034', '4001', '4002'],
        targetUrl: '/guanli',
        navName : 'guanli',
        hanName: '管理'
      },
      {
        qxArr: [],
        targetUrl: '/student',
        navName : 'student',
        hanName: '报名'
      }
    ],
    tiXingNameArr: [
      '单选题', '多选题','双选题','判断题','是非题','填空题','单词翻译题','单词解释题','计算题','问答题','简答题','论述题','翻译题',
      '作文题','证明题','作图题','解答题'
    ],
    imgType: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    videoType: ['.ogv', '.mp4', '.avi', '.mkv', '.wmv'],
    audioType: ['.ogg', '.mp3', '.wav'],
    uploadFileSizeLimit: 2097152 //上传文件的大小限制2MB
  };
});
