var express = require('express');

var Model = require(__glob_root + '/models/main.js');

var Params = {
	locale: require('../_params/locale'),
	upload: require('../_params/upload')
};

var ads = {
	list: require('./list.js')(Model),
	add: require('./add.js')(Model, Params),
	edit: require('./edit.js')(Model, Params),
	remove: require('./remove.js')(Model)
};

module.exports = (function() {
	var router = express.Router();

	router.route('/')
		.get(ads.list.index)
		.post(ads.list.get_list);

	router.route('/add')
		.get(ads.add.index)
		.post(ads.add.form);

	router.route('/edit/:ad_id')
		.get(ads.edit.index)
		.post(ads.edit.form);

	router.route('/remove')
		.post(ads.remove.index);

	return router;
})();