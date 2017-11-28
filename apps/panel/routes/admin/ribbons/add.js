var shortid = require('shortid');
var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Ribbon = Model.Ribbon;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		res.render('admin/ribbons/add.jade');
	};


	module.form = function(req, res, next) {
		var post = req.body;
		var files = req.files;

		var ribbon = new Ribbon();

		ribbon._short_id = shortid.generate();
		ribbon.status = post.status;
		ribbon.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);

		var locales = post.en ? ['ru', 'en'] : ['ru'];

		locales.forEach(function(locale) {
			checkNested(post, [locale, 'title'])
				&& ribbon.setPropertyLocalised('title', post[locale].title, locale);

		});
	};


	return module;
};