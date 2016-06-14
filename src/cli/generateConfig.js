const webpack = require('webpack');

export default function generateConfig(huron, local) {
	const config = Object.assign({}, huron);
	config.entry = Object.assign(config.entry, local.entry);

	if (local.plugins) {
		config.plugins = config.plugins.concat(local.plugins);
	}

	if (local.module && local.module.loaders) {
		config.module.loaders = config.module.loaders.concat(local.module.loaders);
	}

	return config;
}