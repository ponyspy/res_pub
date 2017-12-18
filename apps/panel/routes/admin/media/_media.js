var express = require('express');
var multer = require('multer');

var upload = multer({ dest: __glob_root + '/uploads/' });

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale')
};

var media = {
	edit: require('./edit.js')(Model, Params),
	upload: require('./upload.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(media.edit.index);

	router.route('/update')
		.post(media.edit.update);

	router.route('/remove')
		.post(media.edit.remove);

	router.route('/tobegin')
		.post(media.edit.tobegin);

	router.route('/revert')
		.post(media.edit.revert);

	router.route('/upload')
		.post(upload.single('media'), media.upload.index);

	return router;
})();