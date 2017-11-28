var moment = require('moment');
var async = require('async');

module.exports = function(Model, Params) {
	var module = {};

	var Work = Model.Work;
	var Category = Model.Category;

	var previewImages = Params.upload.preview;
	var uploadImages = Params.upload.images;
	var uploadImage = Params.upload.image;
	var filesUpload = Params.upload.files_upload;
	var filesDelete = Params.upload.files_delete;
	var checkNested = Params.locale.checkNested;


	module.index = function(req, res, next) {
		var id = req.params.work_id;

		Work.findById(id).exec(function(err, work) {
			if (err) return next(err);

			Category.find().exec(function(err, categorys) {
				if (err) return next(err);

				previewImages(work.images, function(err, images_preview) {
					if (err) return next(err);

					res.render('admin/works/edit.jade', { work: work, categorys: categorys, images_preview: images_preview });
				});
			});
		});

	};


	module.form = function(req, res, next) {
		var post = req.body;
		var files = req.files;
		var id = req.params.work_id;

		Work.findById(id).exec(function(err, work) {
			if (err) return next(err);

			work.status = post.status;
			work.date = moment(post.date.date + 'T' + post.date.time.hours + ':' + post.date.time.minutes);
			work.categorys = post.categorys.filter(function(category) { return category != 'none'; });
			work.year = post.year;
			work.type = post.type;
			work.sym = post.sym ? post.sym : undefined;

			var locales = post.en ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				checkNested(post, [locale, 'title'])
					&& work.setPropertyLocalised('title', post[locale].title, locale);

				checkNested(post, [locale, 's_title'])
					&& work.setPropertyLocalised('s_title', post[locale].s_title, locale);

				checkNested(post, [locale, 'area'])
					&& work.setPropertyLocalised('area', post[locale].area, locale);

				checkNested(post, [locale, 'client'])
					&& work.setPropertyLocalised('client', post[locale].client, locale);

				checkNested(post, [locale, 'description'])
					&& work.setPropertyLocalised('description', post[locale].description, locale);

			});

			async.series([
				async.apply(uploadImages, work, 'works', post.hold, post.images),
				async.apply(uploadImage, work, 'works', 'poster', 600, files.poster && files.poster[0], post.poster_del),
				async.apply(uploadImage, work, 'works', 'poster_column', 600, files.poster_column && files.poster_column[0], post.poster_column_del),
				async.apply(filesDelete, work, 'files', post, files),
				async.apply(filesUpload, work, 'works', 'files', post, files),
			], function(err, results) {
				if (err) return next(err);

				work.save(function(err, work) {
					if (err) return next(err);

					res.redirect('back');
				});
			});
		});
	};


	return module;
};