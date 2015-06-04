/**
 * Created by songtao on 15/6/2.
 */
/**
 * 日期格式化
 */
template.helper('dateFormat', function (date, format) {
  date = new Date(date);
  var map = {
    "M": date.getUTCMonth() + 1, //月份
    "d": date.getUTCDate(), //日
    "h": date.getUTCHours(), //小时
    "m": date.getUTCMinutes(), //分
    "s": date.getUTCSeconds(), //秒
    "q": Math.floor((date.getUTCMonth() + 3) / 3), //季度
    "S": date.getUTCMilliseconds() //毫秒
  };
  format = format.replace(/([yMdhmsqS])+/g, function(all, t){
    var v = map[t];
    if(v !== undefined){
      if(all.length > 1){
        v = '0' + v;
        v = v.substr(v.length-2);
      }
      return v;
    }
    else if(t === 'y'){
      return (date.getFullYear() + '').substr(4 - all.length);
    }
    return all;
  });
  return format;
});

/**
 * 得到练习分数
 */
var scoreUrl = 'http://192.168.1.10:4100/api/chaxun_lianxichengji';
$('.getChengji').click(function(){
  $.get(scoreUrl, {token: "12345", uid: "1023"}, function(data) {
    if(data && data.length > 0){
      var lianXiObj = {
        name: '余尚学',
        lxScore: data
      };
      var html = template('lxScoreTpl', lianXiObj);
      $('#lxScoreCont').html(html);
    }
  });
});
