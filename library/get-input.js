const debuglog = require('util').debuglog;
const readFileNodeback = require('fs').readFile;
const denodeify = require('denodeify');

const readFile = denodeify(readFileNodeback);
const log = debuglog('jsonlint-cli');

module.exports = files => {
	log('reading files:', files.length);
	return Promise.all(
		files.map(file => {
			return file.configuration
				.then(configuration => {
					if (file.content && file.piped) {
						return file;
					}
					return readFile(file.path)
						.then(content => {
							file.content = content;
							return file;
						})
				});
		})
	);
};
