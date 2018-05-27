var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var terminals = {
	index: require('./index.js')(Model),
	test: require('./test.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(terminals.index.index)
		.post(terminals.index.get_places);

	router.route('/test')
		.get(terminals.test.test1);

	router.route('/test.m3u')
		.get(terminals.test.m3u);

	return router;
})();