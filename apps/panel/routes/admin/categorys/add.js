var shortid = require('shortid');

module.exports = function(Model, Params) {
	var module = {};

	var Category = Model.Category;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res) {
		res.render('admin/categorys/add.jade');
	};


	module.form = function(req, res, next) {
		var post = req.body;

		var category = new Category();

		category._short_id = shortid.generate();
		category.status = post.status;

		if (post.sym == '') {
			return next(new Error('Synonym field is required!'));
		}

		if (/\s/g.test(post.sym)) {
			return next(new Error('Synonym should not include spaces!'));
		}

		category.sym = post.sym && post.sym.toLowerCase();

		var locales = post.en ? ['ru', 'en'] : ['ru'];

		locales.forEach(function(locale) {
			checkNested(post, [locale, 'title'])
				&& category.setPropertyLocalised('title', post[locale].title, locale);

		});

		category.save(function(err, category) {
			if (err) return next(err);

			res.redirect('/admin/categorys');
		});
	};


	return module;
};