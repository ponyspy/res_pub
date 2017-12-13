var gm = require('gm').subClass({ imageMagick: true });
var rimraf = require('rimraf');
var mime = require('mime');
var moment = require('moment');

module.exports = function(Model, Params) {
	var module = {};

	var Media = Model.Media;

	module.index = function(req, res, next) {
		var file = req.file;
		var post = req.body;
		var new_path = '/preview/' + Date.now() + '.' + mime.getExtension(file.mimetype);

		gm(file.path).size({ bufferStream: true }, function(err, size) {

			this.resize(size.width > 1920 ? 1920 : false, false);
			this.write(__glob_root + '/public' + new_path, function(err) {

				rimraf(file.path, { glob: false }, function() {
					res.send(new_path);
				});
			});
		});
	};


	return module;
};