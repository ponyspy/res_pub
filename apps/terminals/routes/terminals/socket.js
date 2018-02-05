var jade = require('jade');
var moment = require('moment');

var Query = {
	Ribbons: require('./queries/ribbons.js').Ribbons,
};

module.exports = function(io, i18n) {
	var module = {};

	var contentCompile = function(ribbon, callback) {

		var get_locale = function(option, lang) {
			return ((option.filter(function(locale) {
				return locale.lg == lang;
			})[0] || {}).value || '');
		};

		var opts = {
			__: function() { return i18n.__.apply(null, arguments); },
			__n: function() { return i18n.__n.apply(null, arguments); },
			ribbon: ribbon,
			get_locale: get_locale,
			i18n: i18n,
			moment: moment,
			compileDebug: false, debug: false, cache: false, pretty: false
		};

		callback(null, jade.renderFile(__app_root + '/views/terminals/_slides.jade', opts));
	};

	module.get = function(socket) {
		var terminal_id = socket.handshake.query.terminal;

		socket.join(terminal_id);


		Query.Ribbons([terminal_id], function(err, data_table, ribbons) {
			contentCompile(ribbons[0], function(err, content) {
				io.to(terminal_id).emit('content', { content: content });
			});
		});


		// ---


		socket.on('update', function(data) {

		});

		socket.on('disconnect', function(data) {
			socket.leave(terminal_id);
		});

		socket.on('reload', function(data) {
			io.emit('push_reload');
		});
	};

	module.interval = function() {
		var date_now = moment().toDate();
		var rooms = Object.keys(io.sockets.adapter.rooms);
		// console.log('Connections: ' + io.engine.clientsCount);
		// console.log('Rooms: ' + Object.keys(io.sockets.adapter.rooms));

		// io.to(room_id).emit('events', { areas: compile, status: 'update' });
	};


	return module;
};