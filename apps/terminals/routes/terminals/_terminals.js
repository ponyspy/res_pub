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
		.get(terminals.test.index);

	return router;
})();