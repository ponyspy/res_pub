var express = require('express');
var multer = require('multer');

var upload = multer({ dest: __glob_root + '/uploads/' });

var admin = {
	main: require('./main.js'),
	ribbons: require('./ribbons/_ribbons.js'),
	ads: require('./ads/_ads.js'),
	places: require('./places/_places.js'),
	users: require('./users/_users.js'),
	media: require('./media/_media.js'),
	monitor: require('./monitor.js'),
	options: require('./options.js')
};

var checkAuth = function(req, res, next) {
	req.session.user_id
		? next()
		: res.redirect('/auth');
};

module.exports = (function() {
	var router = express.Router();

	router.route('/').get(checkAuth, admin.main.index);

	router.route('/monitor').get(checkAuth, admin.monitor.index);

	router.use('/media', checkAuth, admin.media);
	router.use('/ribbons', checkAuth, admin.ribbons);
	router.use('/ads', checkAuth, admin.ads);
	router.use('/places', checkAuth, admin.places);
	router.use('/users', checkAuth, admin.users);

	router.post('/preview', checkAuth, upload.single('media'), admin.options.preview);

	return router;
})();