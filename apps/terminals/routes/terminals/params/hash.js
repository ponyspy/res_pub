var crypto = require('crypto');
var moment = require('moment');

module.exports.calcHash = function(ribbon, callback) {
	var new_hash = crypto.createHash('md5').update(ribbon.media.map(function(media) {
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

		return moment().isBetween(meta.date_start, meta.date_end, 'day', '[]') ? media.object._id + ':' + meta.counter : false;

	}).join('::')).digest('hex');

	callback(null, new_hash);
};