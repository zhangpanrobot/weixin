//util funcs
function $(selector, context) {
	return (context || document).querySelector(selector);
}

function $$(selector, context) {
	return (context || document).querySelectorAll(selector);
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
//util funcs end

//视口大小
function setStyleEle(viewWidth, viewHeight) {
	var style = document.getElementsByTagName('style')[0];
	style.innerText = '.viewHeight:{' + viewHeight + 'px;}.viewWidth:{' + viewWidth + '};';
}

var eleData = {
	container: $('#container'),
	article: $('#article'),
	edit: $('#edit'),
	articleContainer: $('.sg-article-container'),
	sgList: $('.sg-list')
};

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
	'news': './images/default-news.png'
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

//频道编辑
function renderEdit(){

}

//频道
function renderLabels(){
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
			//清空list并以"头条"重新请求
			backToInit();
		}
	});
	$('.selected').innerHTML = str;
	if(currentDeleted) {
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
}

function backToInit(prev){
	delete self.config.listArray[currentLabel];
	currentDeleted = true;
	labelChange(, '头条');
}

function labelChange(prev, current){
	emptyElement(self.eleData.sgList);
	location.hash = '#头条';
	config.data.currentLabel = '头条';
	moreList(true, false, undefined, '头条');
	eleData.container.style.minHeight = self.viewHeight + 'px';
}

//文章
function renderArticle(){

}

//列表
function renderList(){

}

//显示更新条数
function showNewsNum(){
	
}



