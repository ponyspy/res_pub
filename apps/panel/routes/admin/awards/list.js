var jade = require('jade');

module.exports = function(Model) {
	var module = {};

	var Award = Model.Award;


	module.index = function(req, res, next) {
		Award.find().sort('-date').limit(10).exec(function(err, awards) {
			if (err) return next(err);

			Award.count().exec(function(err, count) {
				if (err) return next(err);

				res.render('admin/awards', {awards: awards, count: Math.ceil(count / 10)});
			});
		});
	};


	module.get_list = function(req, res, next) {
		var post = req.body;

		var Query = (post.context.text && post.context.text !== '')
			? Award.find({ $text : { $search : post.context.text } } )
			: Award.find();

		if (post.context.status && post.context.status != 'all') {
			Query.where('status').equals(post.context.status);
		}

		Query.count(function(err, count) {
			if (err) return next(err);

			Query.find().sort('-date').skip(+post.context.skip).limit(+post.context.limit).exec(function(err, awards) {
				if (err) return next(err);

				if (awards.length > 0) {
					var opts = {
						awards: awards,
						load_list: true,
						count: Math.ceil(count / 10),
						skip: +post.context.skip,
						compileDebug: false, debug: false, cache: true, pretty: false
					};

					res.send(jade.renderFile(__app_root + '/views/admin/awards/_awards.jade', opts));
				} else {
					res.send('end');
				}
			});
		});
	};


	return module;
};