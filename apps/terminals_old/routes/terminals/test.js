module.exports = function(Model) {
	var module = {};

	module.test1 = function(req, res) {
		res.send('test1 ok!');
	};

	return module;
};