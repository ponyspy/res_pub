var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale'),
	upload: require('../_params/upload')
};

var works = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(works.list.index)
		.post(works.list.get_list);

	router.route('/add')
		.get(works.add.index)
		.post(works.add.form);

	router.route('/edit/:work_id')
		.get(works.edit.index)
		.post(works.edit.form);

	router.route('/remove')
		.post(works.remove.index);

	return router;
})();