var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var terminals = {
	index: require('./index.js')(Model),
	test: require('./test.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(terminals.index.index);

	router.route('/test')
		.get(terminals.test.test1);

	return router;
})();