import { defaultConfig } from '../../config/webpack.config';
import { program } from './parse-args';

const webpack = require('webpack');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const cwd = process.cwd();

/**
 * Generate a mutant hybrid of the huron default webpack config and your local webpack config
 *
 * @param {object} config - local webpack config
 */
export default function generateConfig(config) {
  config.huron = Object.assign({}, defaultConfig.huron, config.huron);
  const huron = config.huron;

  // configure entries
  config = configureEntries(huron, config);

  // configure plugins
  config = configurePlugins(huron, config);

  // configure loaders
  config = configureLoaders(huron, config);

  // Add HTMLWebpackPlugin for each configured prototype
  config = configurePrototypes(huron, config);

  // Set ouput options
  config.output = Object.assign({}, config.output, defaultConfig.output);
  config.output.path = path.resolve(cwd, huron.root);

  // Remove existing devServer settings
  delete config.devServer;

  // Set publicPath
  if (!program.production) {
    config.output.publicPath = `http://localhost:${huron.port}/${huron.root}`;
  } else {
    config.output.publicPath = '';
  }

  return config;
}

/**
 * Configure and manage webpack entry points
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 */
function configureEntries(huron, config) {
  const entry = config.entry[huron.entry];
  let newConfig = config;

  newConfig.entry = {};

  if (!program.production) {
    newConfig.entry[huron.entry] = [
      `webpack-dev-server/client?http://localhost:${huron.port}`,
      'webpack/hot/dev-server',
      path.join(cwd, huron.root, 'huron'),
    ].concat(entry);
  } else {
    newConfig.entry[huron.entry] = [path.join(cwd, huron.root, 'huron')]
      .concat(entry);
  }

  return newConfig;
}

/**
 * Configure and manage webpack plugins
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 */
function configurePlugins(huron, config) {
  let newConfig = config;

  if (!program.production) {
    if (newConfig.plugins && newConfig.plugins.length) {
      newConfig.plugins = newConfig.plugins.filter(plugin => {
        return plugin.constructor.name !== 'HotModuleReplacementPlugin';
      });
    }
    newConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return newConfig;
}

/**
 * Configure and manage webpack loaders
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 */
function configureLoaders(huron, config) {
  // Manage loaders
  const templatesLoader = huron.templates.loader;
  let newConfig = config;

  templatesLoader.include = [path.join(cwd, huron.root)];
  newConfig.module = newConfig.module || {};
  newConfig.module.loaders = newConfig.module.loaders || [];
  newConfig.module.loaders.push(
    {
      test: /\.html$/,
      loaders: ['html'],
      include: [path.join(cwd, huron.root)],
    },
    {
      test: /\.json$/,
      loaders: ['json'],
      include: [path.join(cwd, huron.root)],
    },
    templatesLoader
  );

  return newConfig;
}

/**
 * Create an HTML webpack plugin for each configured prototype
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 */
function configurePrototypes(huron, config) {
  const wrapperTemplate = fs.readFileSync(
    path.join(__dirname, '../../templates/huron-wrapper.ejs'),
    'utf8'
  );
  const defaultHTMLPluginOptions = {
    title: '',
    window: huron.window,
    js: [],
    css: [],
    filename: 'index.html',
    template: path.join(huron.root, 'huron-wrapper.ejs'),
    inject: false,
    chunks: [huron.entry],
  };
  let newConfig = config;

  fs.outputFileSync(path.join(cwd, huron.root, 'huron-wrapper.ejs'), wrapperTemplate);
  huron.prototypes.forEach((prototype) => {
    let opts = {};

    // Merge configured settings with default settings
    if ('string' === typeof prototype) {
      opts = Object.assign({}, defaultHTMLPluginOptions, {
        title: prototype,
        filename: `${prototype}.html`,
      });
    } else if (
      'object' === typeof prototype &&
      prototype.hasOwnProperty('title')
    ) {
      // Create filename based on configured title if not provided
      if (! prototype.filename) {
        prototype.filename = `${prototype.title}.html`;;
      }

      // Move css assets for this prototype,
      // reset css option with new file paths
      if (prototype.css) {
        prototype.css = moveAdditionalAssets(prototype.css, 'css', huron);
      }

      // Move js assets for this prototype,
      // reset js option with new file paths
      if (prototype.js) {
        prototype.js = moveAdditionalAssets(prototype.js, 'js', huron);
      }

      opts = Object.assign({}, defaultHTMLPluginOptions, prototype);
    }

    // Move global css assets,
    // reset css option with new file paths
    if (huron.css.length) {
      opts.css = opts.css.concat(
        moveAdditionalAssets(huron.css, 'css', huron)
      );
    }

    // Move global js assets,
    // reset js option with new file paths
    if (huron.js.length) {
      opts.js = opts.js.concat(
        moveAdditionalAssets(huron.js, 'js', huron)
      );
    }

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
 */
function moveAdditionalAssets(assets, subdir = '', huron) {
  const currentAssets = [].concat(assets);
  const assetResults = [];

  currentAssets.forEach((asset) => {
    const assetInfo = path.parse(asset);
    const assetURL = url.parse(asset);
    const sourcePath = path.join(cwd, asset);
    const outputPath = path.resolve(cwd, huron.root, subdir, assetInfo.base);
    const loadPath = program.production ?
      path.join(subdir, assetInfo.base) :
      path.join('/', subdir, assetInfo.base); // Use absolute path in development
    let contents = false;

    if (
      ! path.isAbsolute(asset) &&
      ! assetURL.protocol
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
