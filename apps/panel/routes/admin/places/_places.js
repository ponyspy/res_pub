var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale')
};

var places = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(places.list.index)
		.post(places.list.get_list);

	// router.route('/:place_type/:place_parent_id')
	// 	.get(places.list.index)
	// 	.post(places.list.get_list);

	router.route('/add')
		.get(places.add.index)
		.post(places.add.form);

	router.route('/edit/:place_id')
		.get(places.edit.index)
		.post(places.edit.form);

	router.route('/remove')
		.post(places.remove.index);

	return router;
})();