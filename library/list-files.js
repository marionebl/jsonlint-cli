const dirname = require('path').dirname;
const resolve = require('path').resolve;
const globby = require('globby');
const getStdin = require('get-stdin');

module.exports = input => {
	if (input.length === 0) {
		return Promise.resolve(
			[{
				content: getStdin.buffer(),
				directory: process.cwd(),
				path: process.cwd(),
				piped: true
			}]
		);
	}
	return globby(input)
		.then(paths => {
			return paths.map(path => {
				return {
					content: null,
					directory: dirname(resolve(process.cwd(), path)),
					path: resolve(process.cwd(), path),
					piped: false
				};
			});
		});
};
