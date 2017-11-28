var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Ad = Model.Ad;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.ad_id;

		Ad.findById(id).exec(function(err, ad) {
			if (err) return next(err);

			res.render('admin/ads/edit.jade', { ad: ad });
		});

	};


	module.form = function(req, res, next) {
		var post = req.body;
		var files = req.files;
		var id = req.params.ad_id;

		Ad.findById(id).exec(function(err, ad) {
			if (err) return next(err);

			ad.status = post.status;
			ad.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);

			var locales = post.en ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				checkNested(post, [locale, 'title'])
					&& ad.setPropertyLocalised('title', post[locale].title, locale);

			});

		});
	};


	return module;
};