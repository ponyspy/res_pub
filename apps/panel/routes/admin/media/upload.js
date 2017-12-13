var gm = require('gm').subClass({ imageMagick: true });
var rimraf = require('rimraf');
var mime = require('mime');
var moment = require('moment');
var shortid = require('shortid');

module.exports = function(Model, Params) {
	var module = {};

	var Media = Model.Media;

	module.index = function(req, res, next) {
		var file = req.file;
		var post = req.body;
		var new_path = '/media/' + Date.now() + '.' + mime.getExtension(file.mimetype);

		var media = new Media();

		var interval = post.templ_interval.split(' - ');

		media.meta.duration = post.templ_duration;
		media.meta.date_start = moment(interval[0], 'DD.MM.YY');
		media.meta.date_end = moment(interval[1], 'DD.MM.YY');
		media.type = 'image';
		media.path = new_path;
		media._short_id = shortid.generate();

		gm(file.path).size({ bufferStream: true }, function(err, size) {

			this.resize(size.width > 1920 ? 1920 : false, false);
			this.quality(82);
			this.write(__glob_root + '/public' + new_path, function(err) {

				rimraf(file.path, { glob: false }, function() {
					media.save(function(err, media) {
						res.send(new_path);
					});
				});
			});
		});
	};


	return module;
};