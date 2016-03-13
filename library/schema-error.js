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

module.exports = function schemaError(error, schema) {
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
};
