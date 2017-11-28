var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale'),
	upload: require('../_params/upload')
};

var publications = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(publications.list.index)
		.post(publications.list.get_list);

	router.route('/add')
		.get(publications.add.index)
		.post(publications.add.form);

	router.route('/edit/:publication_id')
		.get(publications.edit.index)
		.post(publications.edit.form);

	router.route('/remove')
		.post(publications.remove.index);

	return router;
})();