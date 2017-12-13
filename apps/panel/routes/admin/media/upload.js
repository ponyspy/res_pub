var gm = require('gm').subClass({ imageMagick: true });
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var mime = require('mime');
var moment = require('moment');
var shortid = require('shortid');

module.exports = function(Model, Params) {
	var module = {};

	var Media = Model.Media;

	module.index = function(req, res, next) {
		var file = req.file;
		var post = req.body;

		var media = new Media();

		var public_path = __glob_root + '/public';
		var media_path = '/cdn/media/' + media._id;
		var interval = post.templ_interval.split(' - ');

		media.meta.date_start = moment(interval[0], 'DD.MM.YY');
		media.meta.date_end = moment(interval[1], 'DD.MM.YY');
		media._short_id = shortid.generate();

		if (/jpeg|png|gif/.test(mime.getExtension(file.mimetype))) {
			media.path.main = media_path + '/main' + '.' + mime.getExtension(file.mimetype);
			media.path.preview = media_path + '/preview' + '.' + mime.getExtension(file.mimetype);
			media.type = 'image';
			media.meta.duration = post.templ_duration;

			mkdirp(public_path + media_path, function() {
				gm(file.path).resize(240, false).quality(40).write(public_path + media.path.preview, function(err) {
					gm(file.path).size({ bufferStream: true }, function(err, size) {

						this.resize(size.width > 1920 ? 1920 : false, false);
						this.quality(82);
						this.write(public_path + media.path.main, function(err) {

							rimraf(file.path, { glob: false }, function() {
								media.save(function(err, media) {
									res.send(media.path.preview);
								});
							});
						});
					});
				});
			});
		} else {

		}
	};


	return module;
};