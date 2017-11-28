var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Ribbon = Model.Ribbon;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.ribbon_id;

		Ribbon.findById(id).exec(function(err, ribbon) {
			if (err) return next(err);

			res.render('admin/ribbons/edit.jade', { ribbon: ribbon });
		});

	};


	module.form = function(req, res, next) {
		var post = req.body;
		var files = req.files;
		var id = req.params.ribbon_id;

		Ribbon.findById(id).exec(function(err, ribbon) {
			if (err) return next(err);

			ribbon.status = post.status;
			ribbon.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);

			var locales = post.en ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				checkNested(post, [locale, 'title'])
					&& ribbon.setPropertyLocalised('title', post[locale].title, locale);

			});

		});
	};


	return module;
};