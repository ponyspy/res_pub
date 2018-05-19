var async = require('async');

var Model = require(__glob_root + '/models/main.js');

var Ribbon = Model.Ribbon;

var videoCompile = require('./params/video.js').videoCompile;
var calcHash = require('./params/hash.js').calcHash;
var extractTable = require('./params/table.js').extractTable;


module.exports = function(io, i18n) {
	var module = {};


	module.get = function(socket) {
		var term_id = socket.handshake.query.terminal;

		extractTable([term_id], function(err, data_table) {
			Ribbon.findOne({ _id: data_table[0].ribbon }).exec(function(err, ribbon) {

				socket.terminal = term_id;
				socket.hash = ribbon.hash;

				io.to(socket.id).emit('content', { content: ribbon.build });
			});
		});
	};


	module.interval = function(time_interval, err_interval) {
		var time_interval = time_interval || 5000;
		var err_interval = err_interval || 2000;

		// name timer
		return setTimeout(function tick() {

			Ribbon.find().populate('media.object').exec(function(err, ribbons) {
				if (err) return setTimeout(tick, err_interval);

				async.eachSeries(ribbons, function(ribbon, callback) {
					calcHash(ribbon, function(err, calc_hash) {
						if (err || ribbon.hash == calc_hash) return callback();

						videoCompile(ribbon, function(err, build) {
							if (err) return callback();

							ribbon.build = build;
							ribbon.hash = calc_hash;
							ribbon.save(function() {
								callback();
							});
						});
					});
				}, function() {
					var rooms = Object.keys(io.sockets.adapter.rooms);
					var term_ids = rooms.map(function(room_id) {
						return io.sockets.connected[room_id].terminal;
					});

					extractTable(term_ids, function(err, data_table) {
						if (err) return setTimeout(tick, err_interval);

						data_table.forEach(function(item) {
							ribbons.forEach(function(ribbon) {
								if (item.ribbon.toString() == ribbon._id.toString()) {
									rooms.forEach(function(room_id) {
										var socket = io.sockets.connected[room_id];

										if (item.device_id == socket.terminal && socket.hash !== ribbon.hash) {
											socket.emit('update', { content: ribbon.build });
											socket.hash = ribbon.hash;
										}
									});
								}
							});
						});

						// next tick
						setTimeout(tick, time_interval);

					});
				});
			});

		}, time_interval);
	};


	return module;
};