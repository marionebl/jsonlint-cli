#!/usr/bin/env node
const merge = require('lodash').merge;

const cli = require('./library/cli');
const listFiles = require('./library/list-files');
const fetchSchema = require('./library/fetch-schema');
const getConfiguration = require('./library/get-configuration');
const getInput = require('./library/get-input');
const resolveKeys = require('./library/resolve-keys');
const lint = require('./library/lint');
const format = require('./library/format');
const print = require('./library/print');
const filter = require('./library/filter');
const pkg = require('./package');

// Main program
function main(options) {
	return listFiles(options.input)
		// Load file configurations
		.then(getConfiguration)
		// Filter files according to ignore config
		.then(filter)
		// Load file contents
		.then(getInput)
		// Fetch json schemas
		.then(fetchSchema)
		// Wait for resolution of async tasks
		.then(resolveKeys)
		.then(inputs => {
			// Merge cli options on file configuration
			return inputs.map(input => {
				input.configuration = merge({}, input.configuration, options.flags);
				return input;
			});
		})
		.then(inputs => {
			// Lint and validate files
			return inputs.map(input => {
				input.content.path = input.path;
				input.data = lint(input.content, input.configuration, input.schema);
				return input;
			});
		})
		.then(inputs => {
			// Format results
			return inputs.map(input => {
				input.formatted = format(input.data, input.configuration);
				return input;
			});
		})
		.then(inputs => {
			// Print results
			inputs.forEach(print);
			return inputs;
		});
}

// Start the engines
main(cli)
	.catch(error =>
		setTimeout(() => {
			if (error.type === pkg.name) {
				console.error(error.message);
				process.exit(1);
			}
			throw error;
		})
	);

// handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
	if (reason.type === pkg.name) {
		process.exit(1);
	}
	console.log('Unhandled Rejection at: Promise ', promise, ' reason: ', reason);
	throw reason;
});

/* const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const minimist = require('minimist');
const rcNodeBack = require('cli-rc');
const globby = require('globby');
const parser = require('jsonlint').parser;
const denodeify = require('denodeify');
const jjv = require('jjv');
const request = require('sync-request');
const mkdirp = require('mkdirp');
var memoize = require('lodash.memoize');
var minimatch = require('minimatch');

const read = denodeify(fs.readFile);
const rc = denodeify(rcNodeBack);

const pkg = require('./package.json');

const defaults = {
	ignore: ['node_modules'],
	validate: null,
	indent: '  ',
	env: 'json-schema-draft-04',
	quiet: false,
	pretty: false
};

const aliases = {
	ignore: 'i',
	validate: 's',
	indent: 'w',
	env: 'e',
	quiet: 'q',
	pretty: 'p'
};

const descriptions = {
	ignore: 'glob pattern to exclude from linting',
	validate: 'uri to schema to use for validation',
	indent: 'whitespace to use for pretty printing',
	env: 'json schema env to use for validation',
	quiet: 'surpress all output',
	pretty: 'pretty-print the input'
};

function repeat(s, count) {
	return new Array(count + 1).join(s);
}
function formatJson(source, indent) {
	var i = 0; 	// eslint-disable-line no-var
	var il = 0;	// eslint-disable-line no-var
	var tab = (typeof indent === 'undefined') ? '		' : indent;	// eslint-disable-line no-var
	var newJson = '';	// eslint-disable-line no-var
	var indentLevel = 0;	// eslint-disable-line no-var
	var inString = false;	// eslint-disable-line no-var
	var currentChar = null;	// eslint-disable-line no-var

	for (i = 0, il = source.length; i < il; i += 1) {
		currentChar = source.charAt(i);

		switch (currentChar) {
			case '{':
			case '[':
				if (inString) {
					newJson += currentChar;
				} else {
					newJson += currentChar + '\n' + repeat(tab, indentLevel + 1); // eslint-disable-line prefer-template
					indentLevel += 1;
				}
				break;
			case '}':
			case ']':
				if (inString) {
					newJson += currentChar;
				} else {
					indentLevel -= 1;
					newJson += '\n' + repeat(tab, indentLevel) + currentChar; // eslint-disable-line prefer-template
				}
				break;
			case ',':
				if (inString) {
					newJson += currentChar;
				} else {
					newJson += ',\n' + repeat(tab, indentLevel); // eslint-disable-line prefer-template
				}
				break;
			case ':':
				if (inString) {
					newJson += currentChar;
				} else {
					newJson += ': ';
				}
				break;
			case ' ':
			case '\n':
			case '\t':
				if (inString) {
					newJson += currentChar;
				}
				break;
			case '"':
				if (i > 0 && source.charAt(i - 1) !== '\\') {
					inString = !inString;
				}
				newJson += currentChar;
				break;
			default:
				newJson += currentChar;
				break;
		}
	}
	return newJson;
}

function sort(o) {
	if (Array.isArray(o)) {
		return o.map(sort);
	} else if (Object.prototype.toString.call(o) !== '[object Object]') {
		return o;
	}

	const sorted = {};
	const a = [];
	var key; // eslint-disable-line no-var

	for (key in o) {
		if (o.hasOwnProperty(key)) {
			a.push(key);
		}
	}

	a.sort();

	for (key = 0; key < a.length; key++) {
		sorted[a[key]] = sort(o[a[key]]);
	}

	return sorted;
}

const lex = {
	type(key, value) {
		return `"${key}" must be of type "${value}"`;
	},
	minLength(key, value, ruleName, ruleValue) {
		return `"${key}" must be at least "${ruleValue}" characters`;
	},
	maxLength(key, value, ruleName, ruleValue) {
		return `"${key}" may be at most "${ruleValue}" characters`;
	},
	minProperties(key, value, ruleName, ruleValue) {
		return `"${key}" must hold at least "${ruleValue}" properties`;
	},
	maxProperties(key, value, ruleName, ruleValue) {
		return `"${key}" may hold at most "${ruleValue}" properties`;
	},
	patternProperties(key, value, ruleName, ruleValue) {
		return `"${key}" must hold "${ruleValue}" properties`;
	},
	minItems(key, value, ruleName, ruleValue) {
		return `"${key}" must have at leat "${ruleValue}" items`;
	},
	maxItems(key, value, ruleName, ruleValue) {
		return `"${key}" may have at most "${ruleValue}" items`;
	},
	required(key, _, name) {
		return `"${key}" is ${name} but unset`;
	},
	additional(key, value, name) {
		return `"${key}" is not allowed as ${name} key	`;
	},
	fallback(key, value, ruleName, ruleValue, prop) {
		const ruleValueString = typeof ruleValue === 'string' ? JSON.stringify(ruleValue) : ruleValue;
		return `"${key}" does not meet rule "${ruleName}=${ruleValueString}" - ${prop.description}`;
	}
};

function schemaError(error, schema) {
	return Object.keys(error.validation)
		.reduce((messages, key) => {
			const validation = error.validation[key];
			const names = Object.keys(validation);

			return messages.concat(
				names
					.map(name => lex[name] || lex.fallback)
					.map((formatter, index) => {
						const name = names[index];
						const props = schema.properties || {};
						const prop = props[key] || {};
						return formatter(
							key,
							validation[name],
							name,
							prop[name] || '',
							prop
						);
					})
			);
		}, []);
}

function getSchemaCacheId(uri) {
	const sum = crypto.createHash('md5');
	sum.update(uri);
	return sum.digest('hex');
}

function readSchemaCache(uri) {
	const id = getSchemaCacheId(uri);
	const tmp = path.resolve(__dirname, '.tmp', `${id}.json`);

	try {
		return fs.readFileSync(tmp);
	} catch (error) {
		return null;
	}
}

function writeSchemaCache(uri, schema) {
	const id = getSchemaCacheId(uri);
	const tmp = path.resolve(__dirname, '.tmp', `${id}.json`);

	try {
		mkdirp.sync(path.dirname(tmp));
		return fs.writeFileSync(tmp, schema);
	} catch (error) {
		return null;
	}
}

function getSchema(uri) {
	const parsed = url.parse(uri);

	if (parsed.protocol && parsed.host) {
		const buffer = readSchemaCache(uri);
		const response = buffer ? buffer.toString('utf-8') : request('GET', uri).getBody();
		const data = JSON.parse(response);
		writeSchemaCache(uri, response);
		return data;
	}

	return require(uri);
}

const obtainSchema = memoize(getSchema);

function lint(source, sourcePath, settings) {
	return new Promise((resolve, reject) => {
		const absSourcePath = sourcePath ? path.resolve(sourcePath) : null;

		try {
			const parsed = settings.source ?
				sort(parser.parse(source)) :
				parser.parse(source);

			if (settings.pretty && !settings.quiet) {
				console.log(formatJson(source, settings.indent));
			}

			if (settings.validate) {
				const environment = jjv(settings.env);
				const schema = obtainSchema(settings.validate);
				environment.addSchema('default', schema);
				const errors = environment.validate('default', parsed);
				if (errors) {
					const jsonLintError = new Error([`"${absSourcePath}" fails against schema "${settings.validate}"`]
						.concat(schemaError(errors, schema)
							.filter(Boolean)
							.map(message => `		${message}`)
						).join('\n'));

					jsonLintError.type = 'jsonlint';
					throw jsonLintError;
				}
			}
		} catch (error) {
			error.message = settings.quiet ? null : `${absSourcePath} ${error.message}`;
			error.file = absSourcePath;
			error.type = 'jsonlint';
			reject(error);
		}
	});
}

function readStdin() {
	return new Promise(resolve => {
		const source = [];
		const stdin = process.openStdin();
		stdin.setEncoding('utf8');
		stdin.on('data', chunk => {
			source.push(chunk.toString('utf8'));
		});
		stdin.on('end', () => {
			resolve(source.join(''));
		});
	});
}

function getSettings(options, file) {
	const filePath = path.extname(file) ?
		path.dirname(file) :
		file;

	const loaders = [
		{
			name: '.jsonlintrc',
			path: [filePath],
			prepend: [filePath]
		},
		{
			name: '.jsonlintignore',
			path: [filePath],
			type: 'ini',
			prepend: [filePath]
		}
	].map(loader => {
		return rc(loader)
			.then(config => Object.assign(config))
			.catch(error => {
				setTimeout(() => {
					throw error;
				});
			});
	});

	return Promise.all(loaders)
		.then(results => {
			const configuration = results[0];
			configuration._file = file;

			const ignore = (options.ignore || [])
				.concat(results[0].ignore || [])
				.concat(Object.keys(results[1]));

			if (configuration.validate) {
				const parsed = url.parse(configuration.validate);
				configuration.validate = parsed.protocol && parsed.host ?
					configuration.validate :
					path.resolve(file, configuration.validate);
			}

			return Object.assign({}, defaults, options, configuration, {
				ignore
			});
		});
}

function execute(settings) {
	const files = settings._ || [];
	const ignored = settings.ignore.map(rule => `!${rule}`);
	const glob = files.concat(ignored);

	// read from stdin if no files are given
	if (files.length === 0) {
		return readStdin()
			.then(content => {
				return lint(content, null, settings);
			});
	}

	// read the glob if files are given
	return globby(glob).then(paths => {
		Promise
			.all(paths.map(file => {
				return getSettings(settings, file);
			}))
			.then(configurations => {
				return Promise.all(
					configurations.map(configuration => {
						// ignore could be changed by config files
						const ignored = configuration.ignore
							.filter(pattern => {
								return minimatch(configuration._file, pattern) ||
								path.basename(configuration._file) === pattern;
							}).length > 0;

						if (ignored) {
							return null;
						}
						return read(configuration._file)
							.then(content => {
								return {
									content: content.toString('utf-8'),
									path: configuration._file,
									configuration: configuration
								};
							});
					})
				);
			})
			.then(payloads => {
				return Promise.all(
					payloads.map(payload => {
						return lint(
							payload.content,
							payload.path,
							payload.configuration
						);
					})
				);
			});
	});
}

function printFlags() {
	const flags = Object.keys(defaults)
		.map(key => {
			return [`--${aliases[key]}, --${key}`, `${descriptions[key]}, defaults to: "${defaults[key]}"`];
		});

	const lines = [
		[`--h, --help`, `show this help`],
		[`--v, --version`, `show jsonlint-cli version`]
	].concat(flags);

	const longestKeyLine = lines.sort((a, b) => b[0].length - a[0].length)[0];
	const longest = longestKeyLine[0].length;

	return lines
		.map(line => `${line[0]}${' '.repeat(4 + longest - line[0].length)}${line[1]}`)
		.join('\n');
}

function help() {
	console.log(`
${pkg.name} [options] [file] - ${pkg.description}

${printFlags()}
	`);
}

function main(options) {
	if (options.help) {
		help();
		return Promise.resolve();
	}

	if (options.version) {
		console.log(pkg.version);
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		getSettings(options, process.cwd())
			.then(execute)
			.then(resolve)
			.catch(reject);
	});
}

// parse cli flags
const args = minimist(process.argv.slice(2));

// start the main function
main(args)
	.catch(error => {
		if (error.type === 'jsonlint') {
			if (error.message !== null) {
				console.log(error.message);
			}
			process.exit(1);
		} else {
			setTimeout(() => {
				throw error;
			});
		}
	});

// Catch unhandled rejections globally
process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at: Promise ', promise, ' reason: ', reason);
	throw reason;
});
*/
