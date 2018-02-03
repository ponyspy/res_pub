global.__app_name = 'terminals';
global.__glob_root = __dirname.replace('/apps/' + __app_name, '');
global.__app_root = __dirname;

var express = require('express'),
		bodyParser = require('body-parser'),
		cookieParser = require('cookie-parser'),
		app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var i18n = require('i18n');
var moment = require('moment');

app.set('x-powered-by', false);
app.set('views', __app_root + '/views');
app.set('view engine', 'jade');

// app.use(express.static(__glob_root + '/public'));  // remove
if (process.env.NODE_ENV != 'production') {
	app.use(express.static(__glob_root + '/public'));
	app.locals.pretty = true;
	app.set('json spaces', 2);
}

i18n.configure({
	locales: ['ru', 'en'],
	defaultLocale: 'ru',
	cookie: 'locale',
	directory: __glob_root + '/locales'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);
app.locals.moment = moment;

app.use(function(req, res, next) {
	res.locals.__app_name = __app_name;
	res.locals.locale = req.cookies.locale || 'ru';
	req.locale = req.cookies.locale || 'ru';
	res.locals.host = req.hostname;
	res.locals.url = req.originalUrl;
	next();
});


var terminals = require('./routes/terminals/_terminals.js');
var error = require('./routes/_error.js');
var socket = require('./routes/terminals/socket.js')(io, i18n);


app.use('/', terminals);
app.use(error.err_500, error.err_404);


io.on('connection', socket.get);

var check_interval = setInterval(socket.interval, 1000 * 60 * 5);	// 5 minutes 1000 * 60 * 5


// ------------------------
// *** Connect server Block ***
// ------------------------


app.listen(process.env.PORT || 3002, (process.env.NODE_ENV == 'production' ? 'localhost' : undefined), function() {
	console.log('http://localhost:' + (process.env.PORT || 3002));
});