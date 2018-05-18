var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Ribbon = Model.Ribbon;
	var Media = Model.Media;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.ribbon_id;

		Ribbon.findById(id).populate('media.object').exec(function(err, ribbon) {
			if (err) return next(err);

			Media.find().sort('-date').exec(function(err, media) {
				if (err) return next(err);

				res.render('admin/ribbons/edit.pug', { ribbon: ribbon, media: media, moment: moment });
			});
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
			ribbon.media = post.media && post.media.map(function(item) {
				if (item.meta) {
					var interval = item.meta.interval.split(' - ');

					return {
						object: item.object,
						meta: {
							counter: item.meta.counter,
							date_start: moment(interval[0], 'DD.MM.YY'),
							date_end: moment(interval[1], 'DD.MM.YY')
						}
					};
				} else {
					return { object: item.object };
				}
			});

			var locales = post.en ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				checkNested(post, [locale, 'title'])
					&& ribbon.setPropertyLocalised('title', post[locale].title, locale);

			});

			ribbon.save(function(err, ribbon) {
				if (err) return next(err);

				res.redirect('back');
			});

		});
	};


	return module;
};