const entries = require('core-js/fn/object/entries');

function entrySorter(a, b) {
	const aKey = a[0];
	const bKey = b[0];
	if (aKey < bKey) {
		return -1;
	} else if (aKey > bKey) {
		return 1;
	}
	return 0;
}

module.exports = function sort(data) {
	if (Array.isArray(data)) {
		return data.map(sort);
	} else if (Object.prototype.toString.call(data) !== '[object Object]') {
		return data;
	}

	return entries(data)
		.sort(entrySorter)
		.reduce((sorted, item) => {
			sorted[item[0]] = item[1];
			return sorted;
		}, {});
};
