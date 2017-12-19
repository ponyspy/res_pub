var moment = require('moment');
var rimraf = require('rimraf');
var async = require('async');

module.exports = function(Model, Params) {
	var module = {};

	var Media = Model.Media;
	var Ribbon = Model.Ribbon;

	module.index = function(req, res, next) {
		Media.find().sort('-date').exec(function(err, media) {
			if (err) return next(err);

			res.render('admin/media.jade', { moment: moment, media: media });
		});
	};

	module.update = function(req, res, next) {
		async.each(req.body.items, function(item, callback) {
			var interval = item.interval.split(' - ');

			Media.findByIdAndUpdate(item.id, { '$set': {
				meta: {
					date_start: moment(interval[0], 'DD.MM.YY'),
					date_end: moment(interval[1], 'DD.MM.YY'),
					counter: item.counter
				}
			}}).exec(callback);
		}, function(err) {
			if (err) return next(err);

			res.send('ok');
		});
	};

	module.revert = function(req, res, next) {
		Media.find({ '_id': { '$in': req.body.ids } }).exec(function(err, items) {
			if (err) return next(err);

			var r_items = items.map(function(item) {
				return {
					'id': item._id,
					'counter': item.meta.counter,
					'interval': moment(item.meta.date_start).format('DD.MM.YY') + ' - ' + moment(item.meta.date_end).format('DD.MM.YY')
				};
			});

			res.send({ items: r_items });
		});
	};

	module.remove = function(req, res, next) {
		if (!req.body.ids) return res.send('ok');

		Media.remove({ '_id': { '$in': req.body.ids } }).exec(function(err) {
			var paths = req.body.ids.map(function(id) { return __glob_root + '/public/cdn/media/' + id;  });

			rimraf('{' + paths.join(',') + '}', function() {
				if (err) return next(err);

				Ribbon.update({ 'media.object': { '$in': req.body.ids } },
											{ '$pull': { 'media': {'object': { '$in': req.body.ids } } } },
											{ 'multi': true }).exec(function(err) {
					if (err) return next(err);

					res.send('ok');
				});
			});
		});
	};

	module.tobegin = function(req, res, next) {
		Media.findByIdAndUpdate(req.body.id, { '$set': { date: moment() } }).exec(function(err, media) {
			if (err) return next(err);

			res.send('ok');
		});
	};


	return module;
};