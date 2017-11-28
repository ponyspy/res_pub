var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale'),
	upload: require('../_params/upload')
};

var ribbons = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(ribbons.list.index)
		.post(ribbons.list.get_list);

	router.route('/add')
		.get(ribbons.add.index)
		.post(ribbons.add.form);

	router.route('/edit/:ribbon_id')
		.get(ribbons.edit.index)
		.post(ribbons.edit.form);

	router.route('/remove')
		.post(ribbons.remove.index);

	return router;
})();