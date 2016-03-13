const parser = require('jsonlint').parser;
const jjv = require('jjv');
const schemaError = require('./schema-error');
const pkg = require('../package');

function parse(source) {
	try {
		return parser.parse(source);
	} catch (error) {
		error.type = pkg.name;
		error.step = 'parse';
		throw error;
	}
}

function validate(data, settings, schema) {
	if (!schema) {
		return data;
	}

	const environment = jjv(settings.env);
	environment.addSchema('default', schema);
	const errors = environment.validate('default', data);

	if (errors) {
		const message = schemaError(errors, schema)
			.filter(Boolean).join('\n');
		const error = new Error(message);
		error.type = pkg.name;
		error.step = 'validation';
		throw error;
	}

	return data;
}

module.exports = (source, settings, schema) => {
	try {
		const json = source.toString();
		const parsed = parse(json, settings);
		return validate(parsed, settings, schema);
	} catch (error) {
		const intro = `${source.path} ${error.step}`;
		error.file = error.file || source.path;
		error.message = `${intro}:\n${error.message}`;
		throw error;
	}
};
