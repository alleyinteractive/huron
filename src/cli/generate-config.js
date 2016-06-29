const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
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
  const wrapperTemplate = fs.readFileSync(path.join(__dirname, '../../templates/huron-wrapper.ejs'), 'utf8');

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
      loaders: [
        'dom?tag=dom-module',
        'html',
        ],
      include: [path.join(cwd, huron.root)]
    },
    {
      test: /\.json?$/,
      loaders: ['json'],
      include: [path.join(cwd, huron.root)]
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

  // Init HTML webpack plugin
  fs.writeFileSync(path.join(cwd, huron.root, 'huron-wrapper.ejs'), wrapperTemplate);
  huron.prototypes.forEach(prototype => {
    config.plugins.push(
      new HTMLWebpackPlugin({
        title: prototype,
        window: huron.window,
        js: huron.js,
        filename: `${prototype}.html`,
        template: path.join(huron.root, 'huron-wrapper.ejs'),
        inject: false,
        chunks: [huron.entry]
      })
    );
  });

  // Set ouput options
  config.output = Object.assign({}, config.output, defaultConfig.output);
  config.output.path = path.resolve(cwd, huron.root);

  // Remove existing devServer settings
  delete config.devServer;

  // Set publicPath
  delete config.output.publicPath;

  console.log(config);

  return config;
}