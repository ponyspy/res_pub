var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale'),
	upload: require('../_params/upload')
};

var peoples = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(peoples.list.index)
		.post(peoples.list.get_list);

	router.route('/add')
		.get(peoples.add.index)
		.post(peoples.add.form);

	router.route('/edit/:people_id')
		.get(peoples.edit.index)
		.post(peoples.edit.form);

	router.route('/remove')
		.post(peoples.remove.index);

	return router;
})();