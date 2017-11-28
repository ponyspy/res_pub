var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale')
};

var awards = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(awards.list.index)
		.post(awards.list.get_list);

	router.route('/add')
		.get(awards.add.index)
		.post(awards.add.form);

	router.route('/edit/:award_id')
		.get(awards.edit.index)
		.post(awards.edit.form);

	router.route('/remove')
		.post(awards.remove.index);

	return router;
})();