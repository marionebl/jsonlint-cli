const entries = require('core-js/fn/object/entries');
const merge = require('lodash').merge;

module.exports = items => {
	return Promise.all(
		items
			.map(item => {
				return Promise
					.all(entries(item).map(entry => {
						return Promise
							.resolve(entry[1])
							.then(result => {
								const resolved = {};
								resolved[entry[0]] = result;
								return resolved;
							});
					}))
					.then(resolved => {
						return resolved.reduce((registry, entry) => {
							return merge(registry, entry);
						}, {});
					});
			})
	);
};
