var mongoose = require('mongoose');
var crypto = require('crypto');
var moment = require('moment');

var Model = require(__glob_root + '/models/main.js');

module.exports.Ribbons = function(ids, callback) {
	var Place = Model.Place;
	var Ribbon = Model.Ribbon;

	Place.find({ 'type': 'device', 'status': { $ne: 'hidden' }, '_id': { $in: ids } }).populate({
			path: 'meta.parent',
			select: '_id ribbon',
			match: { 'status': { $ne: 'hidden' } },
		populate: {
			path: 'meta.parent',
			select: '_id ribbon',
			match: { 'status': { $ne: 'hidden' } },
		}
	}).exec(function(err, devices) {
		if (err) return callback(err);

		var data_table = devices.map(function(device) {
			if (device.ribbon) {
				return { device_id: device._id, ribbon: device.ribbon };
			} else if (device.meta.parent.ribbon) {
					return { device_id: device._id, ribbon: device.meta.parent.ribbon };
				} else if (device.meta.parent.meta.parent.ribbon) {
					return { device_id: device._id, ribbon: device.meta.parent.meta.parent.ribbon };
			}
		});

		var ribbons_ids = data_table.map(function(item) {
			return item.ribbon;
		});

		Ribbon.find({ _id: { $in: ribbons_ids } }).populate('media.object').exec(function(err, ribbons) {
			if (err) return callback(err);

			hash_table = ribbons.map(function(ribbon) {
				var hash = crypto.createHash('md5').update(ribbon.media.map(function(media) {
					var meta = {};

					if (media.meta.date_start && media.meta.date_end) {
						meta.date_start = media.meta.date_start;
						meta.date_end = media.meta.date_end;
						meta.counter = media.meta.counter;
					} else {
						meta.date_start = media.object.meta.date_start;
						meta.date_end = media.object.meta.date_end;
						meta.counter = media.object.meta.counter;
					}

					return moment().isBetween(meta.date_start, meta.date_end, 'day', '[]') ? meta.counter : false;

				}).join('::')).digest('hex');

				return { ribbon: ribbon._id, hash: hash };
			});

			callback(null, data_table, ribbons, hash_table);
		});
	});

};