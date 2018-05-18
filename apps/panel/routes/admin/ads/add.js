var shortid = require('shortid');
var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Ad = Model.Ad;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		res.render('admin/ads/add.pug');
	};


	module.form = function(req, res, next) {
		var post = req.body;
		var files = req.files;

		var ad = new Ad();

		ad._short_id = shortid.generate();
		ad.status = post.status;
		ad.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);

		var locales = post.en ? ['ru', 'en'] : ['ru'];

		locales.forEach(function(locale) {
			checkNested(post, [locale, 'title'])
				&& ad.setPropertyLocalised('title', post[locale].title, locale);

		});

		ad.save(function(err, ad) {
			if (err) return next(err);

			res.redirect('/admin/ads');
		});

	};


	return module;
};