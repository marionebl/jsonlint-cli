const pkg = require('../package');

function isFlag(arg) {
	return arg[0] === '-' ||
		arg.slice(0, 2) === '--';
}

module.exports = arg => {
	if (isFlag(arg) === false) {
		return;
	}
	const error = new RangeError(`unknown flags: ${arg}`);
	error.type = pkg.name;
	throw error;
};
