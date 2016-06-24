const webpack = require('webpack');
const path = require('path');
const cwd = process.cwd();
const HTMLWebpackPlugin = require('html-webpack-plugin');
import { defaultConfig } from '../../config/webpack.config.js';
import { program } from './parse-args';

/**
 * Generate a mutant hybrid of the huron default webpack config and your local webpack config
 *
 * @param {object} config - local webpack config
 */
export default function generateConfig(config) {
  config.huron = Object.assign({}, defaultConfig.huron, config.huron);
  const huron = config.huron;
  const entry = config.entry[huron.entry];

  // Manage entries
  config.entry = {};
  if (!program.production) {
    config.entry[huron.entry] = [
      `webpack-dev-server/client?http://localhost:${huron.port}/`,
      'webpack/hot/dev-server',
      path.join(cwd, huron.root, 'huron'),
    ].concat(entry);
  } else {
    config.entry['dev'] = [path.join(cwd, huron.root, 'huron')].concat(entry);
  }

  // Manage loaders
  config.module = config.module || {};
  config.module.loaders = config.module.loaders || [];
  config.module.loaders.push(
    {
      test: /\.html?$/,
      loader: 'dom?tag=dom-module!html',
      include: [path.join(cwd, huron.root, huron.templates)]
    }
  );

  // De-dupe HMR plugin
  if (!program.production) {
    if (config.plugins && config.plugins.length) {
      config.plugins = config.plugins.filter(plugin => {
        return plugin.constructor.name !== 'HotModuleReplacementPlugin';
      });
    }
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }
  config.plugins.push(new HTMLWebpackPlugin());

  // Set ouput options
  config.output = Object.assign({}, config.output, defaultConfig.output);
  config.output.path = path.resolve(cwd, huron.root);

  // Remove existing devServer settings
  delete config.devServer;

  // Set publicPath
  delete config.output.publicPath;

  return config;
}