var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale')
};

var media = {
	edit: require('./edit.js')(Model, Params),
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

	return router;
})();