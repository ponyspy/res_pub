var shortid = require('shortid');
var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Event = Model.Event;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		res.render('admin/events/add.jade');
	};


	module.form = function(req, res, next) {
		var post = req.body;
		var file = req.file;

		var event = new Event();

		event._short_id = shortid.generate();
		event.status = post.status;
		event.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);
		event.year = post.year;
		event.link = post.link;

		var locales = post.en ? ['ru', 'en'] : ['ru'];

		locales.forEach(function(locale) {
			checkNested(post, [locale, 'title'])
				&& event.setPropertyLocalised('title', post[locale].title, locale);

			checkNested(post, [locale, 's_title'])
				&& event.setPropertyLocalised('s_title', post[locale].s_title, locale);

			checkNested(post, [locale, 'place'])
				&& event.setPropertyLocalised('place', post[locale].place, locale);
		});

		event.save(function(err, event) {
			if (err) return next(err);

			res.redirect('/admin/events');
		});
	};


	return module;
};