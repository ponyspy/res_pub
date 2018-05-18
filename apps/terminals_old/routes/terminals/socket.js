var pug = require('pug');
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
			moment: moment,
			i18n: i18n,
			compileDebug: false, debug: false, cache: false, pretty: false
		};

		callback(null, pug.renderFile(__app_root + '/views/terminals/_slides.pug', opts));
	};

	module.get = function(socket) {
		var terminal_id = socket.handshake.query.terminal;

		Query.Ribbons([terminal_id], function(err, data_table, ribbons) {
			contentCompile(ribbons[0], function(err, content) {
				socket.terminal = terminal_id;
				socket.hash = data_table[0].ribbon_hash;

				io.to(socket.id).emit('content', { content: content });
			});
		});

		socket.on('reload', function(data) {
			io.emit('push_reload');
		});
	};

	module.interval = function() {
		var rooms = Object.keys(io.sockets.adapter.rooms);
		var terminals = rooms.map(function(room_id) {
			return io.sockets.connected[room_id].terminal;
		});

		Query.Ribbons(terminals, function(err, data_table, ribbons) {
			data_table.forEach(function(item) {
				ribbons.forEach(function(ribbon) {
					if (item.ribbon.toString() == ribbon._id.toString()) {
						rooms.forEach(function(room_id) {
							var socket = io.sockets.connected[room_id];

							if (item.device_id == socket.terminal && socket.hash !== item.ribbon_hash) {
								contentCompile(ribbon, function(err, content) {
									socket.emit('update', { content: content });
									socket.hash = item.ribbon_hash;
								});
							}
						});
					}
				});
			});
		});
	};


	return module;
};