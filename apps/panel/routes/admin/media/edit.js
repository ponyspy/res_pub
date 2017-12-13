var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Media = Model.Media;

	module.index = function(req, res, next) {
		Media.find().sort('-date').exec(function(err, media) {
			if (err) return next(err);

			res.render('admin/media.jade', { moment: moment, media: media });
		});
	};

	module.update = function(req, res, next) {

	};

	module.remove = function(req, res, next) {

	};

	module.tobegin = function(req, res, next) {
		Media.findByIdAndUpdate(req.body.id, { '$set': { date: moment() } }).exec(function(err, media) {
			if (err) return next(err);

			res.send('ok');
		});
	};


	return module;
};