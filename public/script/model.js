var config = {
	opeInfo: {
		change: false,
		direction: false, //方向
		num: 0
	},
	keyWord: {
		"hot": "热门",
		"editor": "精品"
	},
	data: {
		currentTime: 0,
		currentLabel: decodeURIComponent(~location.hash.indexOf('&label=') ? location.hash.slice(1).match(/label=(.*)[&\s\n]?/) && location.hash.slice(1).match(/label=(.*)[&\s\n]?/)[1] : location.hash.slice(1)) || '头条',
		iconType: location.href.match(/iconType=([a-zA-Z0-9]*)/) && location.href.match(/iconType=([a-zA-Z0-9]*)/)[1],
		listArray: {} //每个频道的内容
	}
}


function createScript(url){
	var script = document.createElement('script');
	script.src = url;
	this.dbody.appendChild(script);
	setTimeout(function() {
		removeElement(script);
	}, 5000);
}

function getListCallback(data) {
	return globalObj.renderListCallback(data);
}

function getArticleCallback(data) {
	return globalObj.renderArticleCallback(data);
}

function updateGeted(data) {
	return globalObj.updateGeted(data);
}



