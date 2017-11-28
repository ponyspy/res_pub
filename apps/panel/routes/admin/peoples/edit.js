var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var People = Model.People;

	var uploadImage = Params.upload.image;
	var uploadFile = Params.upload.file;
	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.people_id;

		People.findById(id).exec(function(err, people) {
			if (err) return next(err);

			res.render('admin/peoples/edit.jade', { people: people });
		});

	};


	module.form = function(req, res, next) {
		var post = req.body;
		var files = req.files;
		var id = req.params.people_id;

		People.findById(id).exec(function(err, people) {
			if (err) return next(err);

			people.status = post.status;
			people.type = post.type;
			people.link = post.link;
			people.sym = post.sym ? post.sym : undefined;
			people.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);

			var locales = post.en ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				checkNested(post, [locale, 'name'])
					&& people.setPropertyLocalised('name', post[locale].name, locale);

				checkNested(post, [locale, 'description'])
					&& people.setPropertyLocalised('description', post[locale].description, locale);
			});

			uploadImage(people, 'peoples', 'photo', 400, files.photo && files.photo[0], post.photo_del, function(err, people) {
				if (err) return next(err);

				uploadFile(people, 'peoples', 'attach_cv', files.attach_cv && files.attach_cv[0], post.attach_cv_del, function(err, people) {
					if (err) return next(err);

					people.save(function(err, people) {
						if (err) return next(err);

						res.redirect('back');
					});
				});
			});
		});
	};


	return module;
};