var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Award = Model.Award;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.award_id;

		Award.findById(id).exec(function(err, award) {
			if (err) return next(err);

			res.render('admin/awards/edit.jade', { award: award });
		});

	};


	module.form = function(req, res, next) {
		var post = req.body;
		var file = req.file;
		var id = req.params.award_id;

		Award.findById(id).exec(function(err, award) {
			if (err) return next(err);

			award.status = post.status;
			award.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);
			award.year = post.year;

			var locales = post.en ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				checkNested(post, [locale, 'title'])
					&& award.setPropertyLocalised('title', post[locale].title, locale);

				checkNested(post, [locale, 's_title'])
					&& award.setPropertyLocalised('s_title', post[locale].s_title, locale);

				checkNested(post, [locale, 'place'])
					&& award.setPropertyLocalised('place', post[locale].place, locale);

			});

			award.save(function(err, award) {
				if (err) return next(err);

				res.redirect('back');
			});
		});
	};


	return module;
};