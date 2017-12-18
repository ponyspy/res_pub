var moment = require('moment');
var rimraf = require('rimraf');

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
		if (!req.body.ids) return res.send('ok');

		var interval = req.body.interval.split(' - ');

		Media.find({'_id': { '$in': req.body.ids } }).cursor()
		.on('error', function(err) {
			return next(err);
		})
		.on('data', function(doc) {
			doc.set({
				meta: {
					date_start: moment(interval[0], 'DD.MM.YY'),
					date_end: moment(interval[1], 'DD.MM.YY'),
					counter: req.body.counter ? req.body.counter : doc.get('type') == 'image' ? req.body.duration : req.body.repeat
				}
			});
			doc.save();
		})
		.on('end', function() {
			res.send('ok');
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

	module.revert = function(req, res, next) {
		Media.findById(req.body.id).exec(function(err, media) {
			if (err) return next(err);

			res.send({
				counter: media.meta.counter,
				interval: moment(media.meta.date_start).format('DD.MM.YY') + ' - ' + moment(media.meta.date_end).format('DD.MM.YY')
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