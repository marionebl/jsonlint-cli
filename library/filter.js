const debuglog = require('util').debuglog;
const relative = require('path').relative;
const basename = require('path').basename;
const minimatch = require('minimatch');
const merge = require('lodash').merge;

const log = debuglog('jsonlint-cli');

module.exports = files => {
	const configuringFiles = Promise.all(
		files.map(file => {
			return file.configuration
				.then(configuration => {
					return merge({}, file, {
						configuration: configuration
					});
				});
		})
	);

	return configuringFiles
		.then(configuredFiles => {
			log('found files:', configuredFiles.length);
			return configuredFiles
				.filter(configuredFile => {
					const ignore = configuredFile.configuration.ignore || [];
					const config = Array.isArray(ignore) ?
						ignore : ignore.split(',');
					return !config.some(pattern => {
						return minimatch(configuredFile.path, pattern) ||
							minimatch(relative(process.cwd(), configuredFile.path), pattern) ||
							basename(configuredFile.path) === pattern;
					});
				});
		});
};
