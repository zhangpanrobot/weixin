var express = require('express');
var app = express();

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendfile('public/index.html');
});

app.listen(3002);