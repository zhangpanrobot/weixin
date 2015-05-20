function sendRequest(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			currentTime = this.getResponseHeader('Date');
			callback(xhr.responseText);
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			callback({
				"fail": true,
				"data": xhr.responseText
			});
		}
	}
	xhr.onerror = function() {
		callback({
			"fail": true,
			"data": xhr.responseText
		});
	};
	xhr.open('GET', url, true);
	xhr.send();
}

//默认背景图替换
var imageLoaderHelper = function(flag, img, id, src) {
	if (flag) img.dataset.src = '';
	src = flag ? src : defaultSRCMap[id];
	switch (id) {
		case 'news':
			img.style.cssText = 'background: transparent url(' + src + ') no-repeat center top; background-size: cover;';
			break;
		default:
			img.src = src;
			break;
	}
};

var defaultSRCMap = {
	'news': './public/img/default.png'
};

var imageLoaderManager = (function() {
	var list = [];

	function load(src, cb) {
		var cb = typeof cb === 'function' ? cb : function() {};
		var img = document.createElement('img');
		img.onload = function() {
			img.onerror = img.onload = null;
			cb(true);
		};
		img.onerror = function() {
			img.onerror = img.onload = null;
			cb(false);
			list.push([src, cb]);
		};
		img.src = src;
	}
	window.addEventListener('online', function() {
		var item, stack = list.slice(0);
		list.length = 0;
		while (item = stack.pop()) {
			load(item[0], item[1]);
		}
	}, false);
	return {
		load: load
	};
})();

function $(selector, context) {
	return (context || document).querySelector(selector);
}

function $$(selector, context) {
	return (context || document).querySelectorAll(selector);
}

function renderListCallback(data) {
	return globalObj.renderListCallback(data);
}

function removeElement(ele) {
	return ele.parentNode.removeChild(ele);
}

function emptyElement(ele) {
	return ele.innerHTML = '';
}

function emptyStyle(ele) {
	return ele.style.cssText = '';
}

function addClass(ele, str) {
	ele.classList.add(str);
}

function removeClass(ele, str) {
	ele.classList.remove(str);
}

//视口大小用类控制
function setStyleEle(viewWidth, viewHeight) {
	var style = document.getElementsByTagName('style')[0];
	style.innerText = '.viewHeight:{' + viewHeight + 'px;}.viewWidth:{' + viewWidth + '};';
}

var globalObj = {
	dbody: document.body,
	scrollTop: 0,
	readed: false,
	eleData: {
		container: $('#container'),
		sgList: $('.sg-list')
	},
	opeInfo: {
		change: false,
		direction: false
	},
	guid: (function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		};
	})(),
	pingback: function(type, hid, obj) {
		var img = document.createElement('img');
		var baseUrl = 'http://ping.ie.sogou.com/news.gif?src=h5&type=' + type + '&hid=' + hid;
		var keys = Object.keys(obj);
		for (var i = keys.length - 1; i >= 0; i--) {
			baseUrl += '&' + keys[i] + '=' + obj[keys[i]];
		};
		img.src = baseUrl;
	},
	createScript: function(url) {
		var script = document.createElement('script');
		script.src = url;
		this.dbody.appendChild(script);
		setTimeout(function() {
			removeElement(script);
		}, 5000);
	},
	config: {
		currentTime: 0,
		currentLabel: decodeURIComponent(~location.hash.indexOf('&label=') ? location.hash.slice(1).match(/label=(.*)[&\s\n]?/) && location.hash.slice(1).match(/label=(.*)[&\s\n]?/)[1] : location.hash.slice(1)) || '汽车迷',
		iconType: location.href.match(/iconType=([a-zA-Z0-9]*)/) && location.href.match(/iconType=([a-zA-Z0-9]*)/)[1],
		listArray: {} //每个频道的内容
	},
	loadMoreText: function(bool) {
		$('.load-more').innerHTML = bool ? '<span>正在加载...</span>' : '';
	},
	//渲染频道
	renderSelected: function() {
		var str = '';
		var self = this;
		//当前频道是否被删除
		var currentDeleted = false;
		editData.forEach(function(item) {
			if (item.val) {
				var itemText = item.abbr ? item.abbr : item.name;
				str += '<li class="' + (self.config.currentLabel == item.name ? 'current' : '') + '"><a data-tag="' + item.name + '" href="#' + item.name + '">' + itemText + '</a></li>';
			}
			//当前频道被删除时
			if ((item.abbr || item.name) == self.config.currentLabel && !item.val) {
				//清空list并以"汽车迷"重新请求
				location.hash = '#汽车迷';
				self.config.currentLabel = '汽车迷';
				delete self.config.listArray[currentLabel];
				emptyElement(self.eleData.sgList);
				self.moreList(true, false, undefined, '汽车迷');
				self.eleData.container.style.minHeight = self.viewHeight + 'px';
				currentDeleted = true;
			}
		});
		$('.selected').innerHTML = str;
		if (currentDeleted) {
			$('.selected li').className = 'current';
		}
		//重新初始化iScroll
		setTimeout(function() {
			var myScroll = new IScroll('.labelChange', {
				eventPassthrough: true,
				scrollX: true,
				scrollY: false
			});
			self.labelHeight = $('.labelChange').offsetHeight;
		}, 200);
	},
	//渲染列表页
	renderList: function(obj, change, direction) {
		var section = this.eleData.sgList;
		if (obj.length) {
			var ul = document.createElement('ul'),
				tempStr = '';
			ul.className = 'article';
			for (var i = 0; i < obj.length; i++) {
				var item = obj[i];
				if (!item) continue;
				tempStr += '<li><a href=' + item.link + '><div class="thumb" style="background: rgb(224, 224, 224) url(./public/img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + item.img + '"></div><h2>' + item.title + '</h2><span class="count"><i class="read-num">阅读 ' + item.read_num + '</i><i class="source">' + item.source + '</i></span></a></li>';
			}
			setTimeout(function() {
				var images = $$('.thumb', ul);
				for (var i = 0, l = images.length; i < l; i++) {
					if (!images[i].dataset) continue;
					(function(img, id) {
						var src = img.dataset.src;
						if (src) {
							imageLoaderManager.load(src, function(flag) {
								imageLoaderHelper(flag, img, id, src);
							});
						}
					})(images[i], 'news');
				}
				var imagesThree = $$('.three li', ul);
				if (imagesThree.length) {
					for (var i = 0, l = images.length; i < l; i++) {
						if (!(imagesThree[i] && imagesThree[i].dataset)) continue;
						(function(img, id) {
							var src = img.dataset.src;
							if (src) {
								imageLoaderManager.load(src, function(flag) {
									imageLoaderHelper(flag, img, id, src);
								});
							}
						})(imagesThree[i], 'news');
					}
				}
			}, 50);

			ul.innerHTML = tempStr;
			change && emptyElement(section);
			direction ? section.insertBefore(ul, section.children[0]) : section.appendChild(ul);
			$('.load-more').innerHTML = '<span>正在加载...</span>';
		}
	},
	//从当前列表页请求更多内容
	moreList: function(change, direction, num, label) {
		var config = this.config;
		var index;
		currentLabel = label || decodeURIComponent(config.currentLabel);
		this.listTime = new Date().getTime();
		url = config.baseUrl;
		this.createScript('http://10.134.30.154:10178/?mid=test&cnt=10&type=' + encodeURIComponent(currentLabel) + '&callback=renderListCallback');
	},
	//
	renderListCallback: function(data) {
		var opeInfo = this.opeInfo;
		var config = this.config;
		var urls;
		//data = JSON.parse(data);
		currentLabelList = config.listArray[config.currentLabel] || {};
		currentLabelList.data = currentLabelList.data || [];
		if (!data.status || !data.result.article_list.length) {
			$('.load-more').innerHTML = '<span>童鞋,表淘气,没有更多咯^_^</span>';
			return;
		}
		if (data.status == 1) {
			urls = data.result.article_list;
			config.currentTime = (+data.timestamp) * 1000;
			this.renderList(urls, opeInfo.change, opeInfo.direction);
			if (opeInfo.direction) {
				this.showUp(urls.length);
				this.pullDownStyle();
				//下拉, 下拉用不同的方法
				currentLabelList.data.unshift(urls);
				//保存每个频道最新的时间
				//currentLabelList.unshift(urls);
			} else {
				currentLabelList.data.push(urls);
				//currentLabelList.push(urls);
			}
			currentLabelList.time = config.currentTime;
		}
	},
	init: function() {
		var self = this;
		var eleData = self.eleData;
		var container = eleData.container;
		var articleContainer = eleData.articleContainer;
		var article = eleData.article;
		var edit = eleData.edit;
		var opeInfo = self.opeInfo;
		var config = self.config;
		new IScroll('.labelChange', {
			eventPassthrough: true,
			scrollX: true,
			scrollY: false
		});
		self.startTime = new Date().getTime(); //停留时间
		//self.renderSelected();
		self.viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		self.viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		setStyleEle(); //得到屏幕宽高
		container.style.minHeight = self.viewHeight + 'px';
		if ((location.hash.length && location.hash.slice(1))) {
			if (location.hash.length) {
				var lable = decodeURIComponent(~location.hash.indexOf('&label=') ? location.hash.slice(1).match(/label=(.*)(&|\s|\n)?/) && location.hash.slice(1).match(/label=(.*)(&|\s|\n)?/)[1] : location.hash.slice(1));
			}
			config.listArray[lable] = {};
			$('.selected .current') && ($('.selected .current').className = '');
			$('[href="#' + lable + '"]') && ($('[href="#' + lable + '"]').parentNode.className = 'current');
		} else {
			config.listArray["汽车迷"] = {};
			$('.selected li') && ($('.selected li').className = 'current');
		}
		self.moreList();
		$('.labelChange') && $('.labelChange').addEventListener('click', function(e) {
			var label = e.target.parentNode;
			if (label.nodeName !== 'LI') return; //切内容
			opeInfo.change = true;
			opeInfo.direction = false;
			opeInfo.num = 0;
			emptyElement($('.load-more'));
			$('.selected .current') && ($('.selected .current').className = '');
			emptyElement(self.eleData.sgList);
			label.scrollIntoView();
			// location.hash = e.target.getAttribute('data-tag');
			history.pushState({
				page: e.target.getAttribute('data-tag') || "汽车迷"
			}, undefined, 'http://' + location.host + '/#' + e.target.getAttribute('data-tag'));
			config.currentLabel = e.target.getAttribute("data-tag").toLowerCase();
			config.listArray[config.currentLabel] = config.listArray[config.currentLabel] || {};
			currentLabelList = config.listArray[config.currentLabel];
			if (currentLabelList.length) { //已缓存
				var renderObj = currentLabelList[0].length < 10 ? currentLabelList[0].concat(currentLabelList[1]) : currentLabelList[0];
				self.renderList(renderObj, true);
			} else {
				self.moreList(true);
			}
			label.className += 'current';
		});
		window.addEventListener('popstate', function(e) {
			console.log(e);
			self.channelChange.call(self, e.state.page);
		});
		$('.load-more') && window.addEventListener('scroll', function() {
			self.scrollUpdateDelay.call(self);
		});
		$('#toTop') && $('#toTop').addEventListener('touchstart', function(e) {
			document.body.scrollTop = 0;
		});
		self.dbody.addEventListener('touchstart', function(e) {
			if (self.dbody.scrollTop == 0) {
				toTopDistance = 0;
			}
		});
		self.pullToRefresh.init.call(self);
	},
	channelChange: function(channel) {
		var label = $('[data-tag=' + channel + ']') || e.target.parentNode;
		var self = this;
		var opeInfo = self.opeInfo;
		var config = self.config;
		var channelText = location.hash.slice(1);
		opeInfo.change = true;
		opeInfo.direction = false;
		opeInfo.num = 0;
		emptyElement($('.load-more'));
		$('.selected .current') && ($('.selected .current').className = '');
		emptyElement(self.eleData.sgList);
		label.scrollIntoView();
		// location.hash = e.target.getAttribute('data-tag');
		history.pushState({
			page: channelText
		}, undefined, 'http://' + location.host + '/#' + channelText);
		config.currentLabel = channelText.toLowerCase();
		config.listArray[config.currentLabel] = config.listArray[config.currentLabel] || {};
		currentLabelList = config.listArray[config.currentLabel];
		if (currentLabelList.length) { //已缓存
			var renderObj = currentLabelList[0].length < 10 ? currentLabelList[0].concat(currentLabelList[1]) : currentLabelList[0];
			self.renderList(renderObj, true);
		} else {
			self.moreList(true);
		}
		label.className += 'current';
	},
	scrollTime: new Date().getTime(),
	scrollUpdate: function(e) {
		var scrollTop = this.dbody.scrollTop;
		var opeInfo = this.opeInfo;
		var time = new Date().getTime();
		if (time - this.scrollTime < 500) return;
		if (scrollTop + window.innerHeight + 20 > this.eleData.sgList.clientHeight) {
			opeInfo.change = false;
			opeInfo.direction = false;
			opeInfo.num = 0;
			this.moreList(false);
		}
		this.scrollTime = new Date().getTime();
		$('#toTop').style.display = scrollTop > 800 ? 'block' : 'none';
	},
	scrollUpdateDelay: function(e) {
		var self = this;
		if (self.eleData.container.className == '') {
			setTimeout(function() {
				self.scrollUpdate(e);
			}, 300);
			//头部定位
			var labelChange = $('.labelChange');
			labelChange.style.position = self.dbody.scrollTop > 50 ? 'fixed' : 'absolute';
			if (self.dbody.scrollTop > 50) {
				labelChange.style.position = 'fixed';
				labelChange.style.top = 0;
			} else if (self.dbody.scrollTop > 43) {
				labelChange.style.top = '-70px';
			} else {
				labelChange.style.top = 0;
				labelChange.style.position = 'absolute';
			}
		}
	},
	showUp: function(num) {
		// var callbackMsg = $('#callback-msg');
		// callbackMsg.innerText = '为您推荐' + num + '篇文章';
		// setTimeout(function() {
		// 	callbackMsg.style.opacity = '1';
		// }, 500);
		// setTimeout(function() {
		// 	callbackMsg.style.opacity = '0';
		// 	setTimeout(function() {
		// 		callbackMsg.innerText = '暂无新汽车迷';
		// 	}, 500);
		// }, 1500);
		// var pulldownMsg = $('#pulldown-msg'),
		// 	pulldownMsgIcon = $('#pulldown-msg i'),
		// 	pulldownMsgText = $('#pulldown-msg span');

		// 	addClass(pulldownMsgIcon, 'icon-arrow-seccuss');
		// 	pulldownMsgText.innerText = '刷新成功';

		// 	setTimeout(function(){
		// 		removeClass(pulldownMsgIcon, 'icon-arrow-seccuss');
		// 		pulldownMsgText.innerText = '下拉刷新';
		// 	}, 500);
	},
	getUpdate: function(currentLabel, lastindex) {
		this.moreList(false, true);
	},
	pullDownStyle: function() {
		//setTimeout里的调用


			var pulldownMsg = $('#pulldown-msg'),
			pulldownMsgIcon = $('i', pulldownMsg),
			pulldownMsgText = $('span', pulldownMsg);
			removeClass(pulldownMsgIcon, 'icon-refresh');
			addClass(pulldownMsgIcon, 'icon-arrow-seccuss');
			pulldownMsgText.innerText = '刷新成功';

			setTimeout(function(){
			globalObj.eleData.sgList.style.cssText = '-webkit-transition: all .3s ease;transition: all .3s ease;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0)';
			pulldownMsg.style.cssText = '-webkit-transition: all .3s ease;transition: all .3s ease;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0)';
			}, 300);
			setTimeout(function(){
				removeClass(pulldownMsgIcon, 'icon-arrow-seccuss');
				pulldownMsgText.innerText = '下拉刷新';
			}, 500);
	},
	updateGeted: function(data) {
		var opeInfo = this.opeInfo;
		data = data.app_cmd[0].cmd[0].news_app_info[0];
			opeInfo.change = false;
			opeInfo.direction = true;
			this.moreList(false, true);
		this.toGetUpdate = false;
	},
	pullToRefresh: {
		init: function() {
			var self = this,
				eleData = self.eleData
			sgList = eleData.sgList,
				pulldownMsg = $('#pulldown-msg'),
				container = eleData.container,
				pulldownMsgIcon = $('#pulldown-msg i'),
				pulldownMsgText = $('#pulldown-msg span');

			function allowToPull(e) {
				return document.body.scrollTop == 0 && (e.target.parentNode.nodeName !== 'LI' || !e.target.hasAttribute('data-tag'));
			}
			container.addEventListener('touchstart', function(e) {
				touchY = e.touches[0].pageY;
			});
			container.addEventListener('touchmove', function(e) {
				var pageY = e.touches[0].pageY;
				if (allowToPull(e)) {
					if (pageY - touchY > 100) {
						return void 0;
					}
					pageY - touchY > 0 && e.preventDefault();
					sgList.style.cssText = 'transition: none;-webkit-transition: none';
					(pageY - touchY > 0) && (sgList.style.cssText += 'transform:translate3d(0, ' + (pageY - touchY) + ' px,0);-webkit-transform: translate3d(0, ' + (pageY - touchY) + 'px,0)');
					pulldownMsg.style.cssText = '-webkit-transition: none;transition: none;transform: translate3d(0, ' + (pageY - touchY) + 'px,0); -webkit-transform: translate3d(0, ' + (pageY - touchY) + 'px,0);';
					if (pageY - touchY > 60) {
						self.toGetUpdate = true;
						addClass(pulldownMsgIcon, 'icon-arrow-up');
						pulldownMsgText.innerText = '释放刷新';
					} else {
						removeClass(pulldownMsgIcon, 'icon-arrow-up');
						pulldownMsgText.innerText = '下拉刷新';
					}
				}
			});
			container.addEventListener('touchend', function(e) {
				var opeInfo = self.opeInfo;
				if (allowToPull(e)) {
					opeInfo.change = false;
					opeInfo.direction = true;
					opeInfo.num = 0;
					if (!self.toGetUpdate) {
						self.pullDownStyle();
					} else {
						pulldownMsgText.innerText = '正在刷新';
						addClass(pulldownMsgIcon, 'icon-refresh');
						self.getUpdate();
						self.pingback('update', self.uuid, {
							currentLabel: self.config.currentLabel
						});
					}
				}
			});
		}
	}
};

globalObj.init();