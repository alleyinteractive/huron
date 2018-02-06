/** @module cli/generate-config */
import path from 'path';
import url from 'url';
import fs from 'fs-extra';
import webpack from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import merge from 'lodash/fp/merge';

import program from './parseArgs';
import requireExternal from './requireExternal';
import defaultWebpack from '../defaultConfig/webpack.config';
import defaultHuron from '../defaultConfig/huron.config';

const cwd = process.cwd();

// Require configs passed in by user from CLI
let defaultConfig = false;
const localConfig = requireExternal(
  path.resolve(program.webpackConfig)
);
const localHuron = requireExternal(
  path.resolve(program.huronConfig)
);

/**
 * Generate a mutant hybrid of the huron default webpack config and your local webpack config
 *
 * @function generateConfig
 * @param {object} config - local webpack config
 * @return {object} newConfig - updated data store
 */
export default function generateConfig() {
  let newConfig = localConfig;
  let newHuron = localHuron;

  // Execute config function, if provided
  if ('function' === typeof newConfig) {
    newConfig = newConfig(program.env);
  }

  // Execute huron config function, if provided
  if ('function' === typeof newHuron) {
    newHuron = newHuron(program.env);
  }

  // Merge huron defaults with user settings
  newHuron = Object.assign({}, defaultHuron, newHuron);
  // Use user huron config to modify webpack defaults
  defaultConfig = defaultWebpack(newHuron);

  // Set ouput options
  newConfig.output = Object.assign({}, defaultConfig.output, newConfig.output);
  newConfig.output.path = defaultConfig.output.path;
  newConfig.output.publicPath = defaultConfig.output.publicPath;

  // configure entries
  newConfig = configureEntries(newHuron, newConfig);

  // configure plugins
  newConfig = configurePlugins(newHuron, newConfig);

  // configure loaders
  newConfig = configureLoaders(newHuron, newConfig);

  // Add HTMLWebpackPlugin for each configured prototype
  newConfig = configurePrototypes(newHuron, newConfig);

  // Remove existing devServer settings
  delete newConfig.devServer;

  return {
    huron: newHuron,
    webpack: newConfig,
  };
}

/**
 * Configure and manage webpack entry points
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 * @return {object} newConfig - updated data store
 */
function configureEntries(huron, config) {
  const entry = config.entry[huron.entry];
  const newConfig = config;

  newConfig.entry = {};
  if (!program.production) {
    newConfig.entry[huron.entry] = [
      `webpack-dev-server/client/index.js?http://localhost:${huron.port}/`,
      'webpack/hot/dev-server',
      path.join(cwd, huron.root, 'huron-assets/index'),
    ].concat(entry);
  } else {
    newConfig.entry[huron.entry] = [
      path.join(cwd, huron.root, 'huron-assets/index'),
    ].concat(entry);
  }

  return newConfig;
}

/**
 * Configure and manage webpack plugins
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 * @return {object} newConfig - updated data store
 */
function configurePlugins(huron, config) {
  const newConfig = config;

  newConfig.plugins = config.plugins || [];

  if (!program.production) {
    if (newConfig.plugins && newConfig.plugins.length) {
      newConfig.plugins = newConfig.plugins.filter(
        (plugin) => 'HotModuleReplacementPlugin' !== plugin.constructor.name &&
          'NamedModulesPlugin' !== plugin.constructor.name
      );
    }
    newConfig.plugins = newConfig.plugins
      .concat([
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
      ]);
  }

  return newConfig;
}

/**
 * Configure and manage webpack loaders
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 * @return {object} newConfig - updated data store
 */
function configureLoaders(huron, config) {
  // Manage loaders
  const templatesLoader = huron.templates.rule || {};
  const newConfig = config;

  // Make sure we're only using templates loader for files in huron root
  templatesLoader.include = [path.join(cwd, huron.root, huron.output)];

  // Normalize module and module.rules
  newConfig.module = newConfig.module || {};
  newConfig.module.rules = newConfig.module.rules ||
    newConfig.module.loaders ||
    [];

  // Add default loaders
  newConfig.module.rules = defaultConfig.module.rules
    .concat(
      newConfig.module.rules,
      templatesLoader
    );

  return newConfig;
}

/**
 * Create an HTML webpack plugin for each configured prototype
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 * @return {object} newConfig - updated data store
 */
function configurePrototypes(huron, config) {
  const wrapperTemplate = fs.readFileSync(
    path.join(__dirname, '../../templates/prototypeTemplate.hbs'),
    'utf8'
  );

  const defaultHTMLPluginOptions = {
    title: 'Huron',
    window: huron.window,
    js: [],
    css: [],
    filename: 'index.html',
    template: path.join(
      cwd,
      huron.root,
      'huron-assets/prototypeTemplate.hbs'
    ),
    inject: false,
  };
  const newConfig = config;

  // Write prototype template file for HTML webpack plugin
  fs.outputFileSync(
    path.join(cwd, huron.root, 'huron-assets/prototypeTemplate.hbs'),
    wrapperTemplate
  );

  huron.prototypes.forEach((prototype) => {
    const newPrototype = prototype;
    let opts = {};

    // Merge configured settings with default settings
    if ('string' === typeof prototype) {
      opts = {
        ...defaultHTMLPluginOptions,
        title: prototype,
        filename: `${prototype}.html`,
      };
    } else if (
      'object' === typeof prototype &&
      {}.hasOwnProperty.call(prototype, 'title')
    ) {
      opts = {
        ...defaultHTMLPluginOptions,
        ...newPrototype,
        filename: prototype.filename || `${prototype.title}.html`,
        css: moveAdditionalAssets(prototype.css, 'css', huron),
        js: moveAdditionalAssets(prototype.js, 'js', huron),
      };
    }

    // Move global css assets,
    // reset css option with new file paths
    opts = merge(opts, {
      css: moveAdditionalAssets(huron.css, 'css', huron),
      js: moveAdditionalAssets(huron.js, 'js', huron),
    });

    // Push a new plugin for each configured prototype
    if (Object.keys(opts).length) {
      newConfig.plugins.push(
        new HTMLWebpackPlugin(opts)
      );
    }
  });

  return newConfig;
}

/**
 * Move relative (and local) js and css assets provided in huron options
 *
 * @param {array|string} assets - array of assets or single asset
 * @param {string} subdir - subdirectory in huron root from which to load additional asset
 * @param {object} huron - huron configuration object
 * @return {array} assetResults - paths to js and css assets
 */
function moveAdditionalAssets(assets, subdir = '', huron) {
  const currentAssets = [].concat(assets);
  const assetResults = [];

  if (!assets || !assets.length) {
    return false;
  }

  currentAssets.forEach((asset) => {
    const assetInfo = path.parse(asset);
    const assetURL = url.parse(asset);
    const sourcePath = path.join(cwd, asset);
    const outputPath = path.resolve(cwd, huron.root, subdir, assetInfo.base);
    const loadPath = path.join(subdir, assetInfo.base);
    let contents = false;

    if (
      !path.isAbsolute(asset) &&
      !assetURL.protocol
    ) {
      try {
        contents = fs.readFileSync(sourcePath);
      } catch (e) {
        console.warn(`could not read ${sourcePath}`);
      }

      if (contents) {
        fs.outputFileSync(outputPath, contents);
        assetResults.push(loadPath);
      }
    } else {
      assetResults.push(asset);
    }
  });

  return assetResults;
}
