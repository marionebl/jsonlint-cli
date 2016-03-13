const sort = require('./sort');

function repeat(s, count) {
	return new Array(count + 1).join(s);
}

function formatJSON(source, indent) {
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

module.exports = (data, settings) => {
	const sorted = settings.sort ?
		sort(data) :
		data;
	return formatJSON(JSON.stringify(sorted), settings.indent.replace(/["']/g, ''));
};
