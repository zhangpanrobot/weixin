//工具funcs
function timeFormat(time) {
	time = +time <= 0 ? 0 : time;
	if (0 == time) {
		return '刚刚';
	}
	var day = 86400000;
	var hour = 3600000;
	var minute = 60000;
	var totalDay = parseInt(time / day);
	var totalHour = parseInt((time % day) / hour);
	var totalMinu = parseInt((time % day % hour) / minute);
	return totalDay ? totalDay + '天前' : '' + (totalHour ? totalHour + '小时' : '') + (totalHour ? '' : (totalMinu ? totalMinu : '0') + '分钟') + '前';
}
//详情页时间转换
function dateFormat(time) {
	time = new Date(time);
	var date = dateForm(time.getDate() - 1, true);//日期减1
	var month = dateForm(time.getMonth() + 1);//月份加1
	var hour = dateForm(time.getHours());
	var minute = dateForm(time.getMinutes());
	function dateForm(item, bool) {
		item = item + (bool ? 1 : '') + '';
		item = item.length < 2 ? '0' + item : item;
		return item;
	}
	return month + '-' + date + '  ' + hour + ':' + minute;
}
//工具funcs end

var guid = (function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		};
	})();

function pingback(type, hid, obj) {
		var img = document.createElement('img');
		var baseUrl = 'http://ping.ie.sogou.com/news.gif?src=h5&type=' + type + '&hid=' + hid;
		var keys = Object.keys(obj);
		for (var i = keys.length - 1; i >= 0; i--) {
			baseUrl += '&' + keys[i] + '=' + obj[keys[i]];
		};
		img.src = baseUrl;
	}

