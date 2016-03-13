const basename = require('path').basename;
const minimatch = require('minimatch');

module.exports = input => {
	const ignore = input.configuration.ignore || [];
	const config = Array.isArray(ignore) ?
		ignore : ignore.split(',');
	return !config.some(pattern => {
		return minimatch(input.path, pattern) ||
			basename(input.path) === pattern;
	});
};
