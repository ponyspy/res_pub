var shortid = require('shortid');
var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Place = Model.Place;
	var Ribbon = Model.Ribbon;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		Ribbon.find().sort('-date').exec(function(err, ribbons) {
			if (err) return next(err);

			res.render('admin/places/add.jade', { ribbons: ribbons });
		});
	};


	module.form = function(req, res, next) {
		var post = req.body;
		var query = req.query;

		var place = new Place();

		place._short_id = shortid.generate();
		place.status = post.status;
		place.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);
		place.ribbon = post.ribbon == 'none' ? undefined : post.ribbon;
		place.inheritance = post.inheritance;

		place.type = query.type || 'city';
		if (query.parent) {
			place.meta.parent = query.parent;
		}

		var locales = post.en ? ['ru', 'en'] : ['ru'];

		locales.forEach(function(locale) {
			checkNested(post, [locale, 'title'])
				&& place.setPropertyLocalised('title', post[locale].title, locale);

			checkNested(post, [locale, 'comment'])
				&& place.setPropertyLocalised('comment', post[locale].comment, locale);
		});

		place.save(function(err, place) {
			if (err) return next(err);

			res.redirect('/admin/places');
		});
	};


	return module;
};