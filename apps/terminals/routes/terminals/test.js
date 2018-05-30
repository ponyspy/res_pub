module.exports = function(Model) {
	var module = {};

	module.index = function(req, res) {
		res.send('test ok!');
	};

	return module;
};