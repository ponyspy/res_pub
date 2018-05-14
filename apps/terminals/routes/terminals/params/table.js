var Model = require(__glob_root + '/models/main.js');

module.exports.extractTable = function(ids, callback) {
	var Place = Model.Place;

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

		callback(null, data_table);
	});

};