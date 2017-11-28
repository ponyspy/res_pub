module.exports = function(Model, Params) {
	var module = {};

	var Category = Model.Category;

	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.id;

		Category.findById(id).exec(function(err, category) {
			if (err) return next(err);

			res.render('admin/categorys/edit.jade', {category: category});
		});
	};


	module.form = function(req, res, next) {
		var post = req.body;
		var id = req.params.id;

		Category.findById(id).exec(function(err, category) {
			if (err) return next(err);

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

				res.redirect('back');
			});
		});
	};


	return module;
};