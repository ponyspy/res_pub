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

		Query.Ribbons([terminal_id], function(err, data_table, ribbons) {
			contentCompile(ribbons[0], function(err, content) {
				socket.terminal = terminal_id;
				socket.hash = data_table[0].hash;

				io.to(socket.id).emit('content', { content: content });
			});
		});


		// ---


		socket.on('reload', function(data) {
			io.emit('push_reload');
		});
	};

	module.interval = function() {
		var rooms = Object.keys(io.sockets.adapter.rooms);
		var terminals_table = {};
		// console.log('Connections: ' + io.engine.clientsCount);
		// console.log('Rooms: ' + Object.keys(io.sockets.adapter.rooms));

		rooms.forEach(function(room_id) {
			var terminal_id = io.sockets.connected[room_id].terminal;

			terminals_table[terminal_id] = room_id;
		});

		Query.Ribbons(Object.keys(terminals_table), function(err, data_table, ribbons) {
			data_table.forEach(function(item) {
				ribbons.forEach(function(ribbon) {
					if (item.ribbon.toString() == ribbon._id.toString()) {
						var room_id = terminals_table[item.device_id];

						io.to(room_id).emit('update', { data: 'cool' });
					}
				});
			});
		});





		// rooms.forEach(function(room_id) {
		// 	var socket = io.sockets.connected[room_id];

		// 	// socket.emit('update', { cool: 'zlo' });

		// 	console.log(socket.handshake.query.terminal);
		// 	console.log(socket.terminal);
		// });


		// io.to(room_id).emit('events', { areas: compile, status: 'update' });
	};


	return module;
};