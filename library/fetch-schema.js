const loadSchema = require('./load-schema');

module.exports = items => {
	return Promise.all(items.map(item => {
		return item.configuration
			.then(config => {
				item.configuration = config;
				if (config.validate) {
					item.schema = loadSchema(config.validate);
				}
				return item;
			});
	}));
};
