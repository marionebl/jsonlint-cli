const meow = require('meow');
const pkg = require('../package');

const help = require('./help');
const unknown = require('./unknown');

const configuration = {
	// flags of string type
	string: ['ignore', 'validate', 'indent', 'env'],
	// flags of bool type
	boolean: ['pretty', 'sort', 'help', 'version'],
	// flag aliases
	alias: {
		i: 'ignore',
		s: 'validate',
		t: 'sort',
		w: 'indent',
		e: 'env',
		p: 'pretty',
		h: 'help',
		v: 'version'
	},
	description: {
		ignore: 'glob pattern to exclude from linting',
		validate: 'uri to schema to use for validation',
		indent: 'whitespace to use for pretty printing',
		env: 'json schema env to use for validation',
		pretty: 'pretty-print the input',
		sort: 'sort json keys alphabetically',
		version: 'print the version',
		help: 'show this help'
	},
	// flag defaults
	default: {
		ignore: ['node_modules'],
		validate: '',
		indent: '"  "',
		env: 'json-schema-draft-04',
		quiet: true,
		pretty: false,
		sort: false
	},
	unknown: unknown
};

module.exports = meow({
	help: `[input] reads from stdin if [files] are omitted\n${help(configuration)}`,
	description: `${pkg.name}@${pkg.version} - ${pkg.description}`
}, configuration);
