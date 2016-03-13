const readFileNodeback = require('fs').readFile;
const dirname = require('path').dirname;
const resolve = require('path').resolve;
const getStdin = require('get-stdin');
const globby = require('globby');
const denodeify = require('denodeify');

const readFile = denodeify(readFileNodeback);

module.exports = input => {
	if (input.length === 0) {
		return Promise.resolve(
			[{
				content: getStdin.buffer(),
				directory: process.cwd(),
				path: process.cwd()
			}]
		);
	}
	return globby(input)
		.then(paths => {
			return paths.map(path => {
				return {
					content: readFile(path),
					directory: dirname(resolve(process.cwd(), path)),
					path: resolve(process.cwd(), path)
				};
			});
		});
};
