const createHash = require('crypto').createHash;
const denodeify = require('denodeify');
const readFileNodeback = require('fs').readFile;
const writeFileNodeback = require('fs').writeFile;
const parse = require('url').parse;
const resolve = require('path').resolve;
const dirname = require('path').dirname;
const mkdirpNodeback = require('mkdirp');
const fetch = require('omni-fetch');

const readFile = denodeify(readFileNodeback);
const writeFile = denodeify(writeFileNodeback);
const mkdirp = denodeify(mkdirpNodeback);

function getSchemaCacheId(uri) {
	const sum = createHash('md5');
	sum.update(uri);
	return sum.digest('hex');
}

function readSchemaCache(uri) {
	const id = getSchemaCacheId(uri);
	const tmp = resolve(__dirname, '.tmp', `${id}.json`);
	return readFile(tmp)
		.catch(() => {});
}

function writeSchemaCache(uri, schema) {
	const id = getSchemaCacheId(uri);
	const tmp = resolve(__dirname, '..', '.tmp', `${id}.json`);

	mkdirp(dirname(tmp))
		.then(() => {
			return writeFile(tmp, schema);
		})
		.catch(err => {
			console.log(err);
		});
}

module.exports = schema => {
	const parsed = parse(schema);

	if (parsed.protocol && parsed.host) {
		return readSchemaCache(schema)
			.then(buffer => {
				return buffer ?
					buffer.toString('utf-8') :
					fetch(schema)
						.then(resp => resp.text())
						.then(data => {
							setTimeout(() => {
								writeSchemaCache(schema, data);
							}, 0);
							return data;
						});
			})
			.then(data => JSON.parse(data));
	}

	return require(schema);
};
