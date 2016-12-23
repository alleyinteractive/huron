'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = generateConfig;

var _parseArgs = require('./parse-args');

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /** @module cli/generate-config */

var defaultConfig = require('../../config/webpack.config');
var webpack = require('webpack');
var path = require('path');
var url = require('url');
var fs = require('fs-extra');
var HTMLWebpackPlugin = require('html-webpack-plugin');

var cwd = process.cwd();

/**
 * Generate a mutant hybrid of the huron default webpack config and your local webpack config
 *
 * @function generateConfig
 * @param {object} config - local webpack config
 * @return {object} newConfig - updated data store
 */
function generateConfig(config) {
  var newConfig = config;

  newConfig.huron = Object.assign({}, defaultConfig.huron, config.huron);
  var huron = newConfig.huron;

  // configure entries
  newConfig = configureEntries(huron, newConfig);

  // configure plugins
  newConfig = configurePlugins(huron, newConfig);

  // configure loaders
  newConfig = configureLoaders(huron, newConfig);

  // Add HTMLWebpackPlugin for each configured prototype
  newConfig = configurePrototypes(huron, newConfig);

  // Set ouput options
  newConfig.output = Object.assign({}, newConfig.output, defaultConfig.output);
  newConfig.output.path = path.resolve(cwd, huron.root);

  // Remove existing devServer settings
  delete newConfig.devServer;

  // Set publicPath
  if (!_parseArgs2.default.production) {
    newConfig.output.publicPath = 'http://localhost:' + huron.port + '/' + huron.root;
  } else {
    newConfig.output.publicPath = '';
  }

  return newConfig;
}

/**
 * Configure and manage webpack entry points
 *
 * @param {object} huron - huron configuration object
 * @param {object} config - webpack configuration object
 * @return {object} newConfig - updated data store
 */
function configureEntries(huron, config) {
  var entry = config.entry[huron.entry];
  var newConfig = config;

  newConfig.entry = {};

  if (!_parseArgs2.default.production) {
    newConfig.entry[huron.entry] = ['webpack-dev-server/client?http://localhost:' + huron.port, 'webpack/hot/dev-server', path.join(cwd, huron.root, 'huron-assets/huron')].concat(_toConsumableArray(entry));
  } else {
    newConfig.entry[huron.entry] = [path.join(cwd, huron.root, 'huron-assets/huron')].concat(_toConsumableArray(entry));
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
  var newConfig = config;

  if (!_parseArgs2.default.production) {
    if (newConfig.plugins && newConfig.plugins.length) {
      newConfig.plugins = newConfig.plugins.filter(function (plugin) {
        return 'HotModuleReplacementPlugin' !== plugin.constructor.name;
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
 * @return {object} newConfig - updated data store
 */
function configureLoaders(huron, config) {
  // Manage loaders
  var templatesLoader = huron.templates.loader;
  var newConfig = config;

  templatesLoader.include = [path.join(cwd, huron.root)];
  newConfig.module = newConfig.module || {};
  newConfig.module.loaders = newConfig.module.loaders || [];
  newConfig.module.loaders.push({
    test: /\.html$/,
    loaders: ['html'],
    include: [path.join(cwd, huron.root)]
  }, {
    test: /\.json$/,
    loaders: ['json'],
    include: [path.join(cwd, huron.root)]
  }, templatesLoader);

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
  var wrapperTemplate = fs.readFileSync(path.join(__dirname, '../../templates/prototype-template.ejs'), 'utf8');
  var defaultHTMLPluginOptions = {
    title: '',
    window: huron.window,
    js: [],
    css: [],
    filename: 'index.html',
    template: path.join(huron.root, 'huron-assets/prototype-template.ejs'),
    inject: false,
    chunks: [huron.entry]
  };
  var newConfig = config;

  // Write prototype template file for HTML webpack plugin
  fs.outputFileSync(path.join(cwd, huron.root, 'huron-assets/prototype-template.ejs'), wrapperTemplate);

  huron.prototypes.forEach(function (prototype) {
    var newPrototype = prototype;
    var opts = {};

    // Merge configured settings with default settings
    if ('string' === typeof prototype) {
      opts = Object.assign({}, defaultHTMLPluginOptions, {
        title: prototype,
        filename: prototype + '.html'
      });
    } else if ('object' === (typeof prototype === 'undefined' ? 'undefined' : _typeof(prototype)) && {}.hasOwnProperty.call(prototype, 'title')) {
      // Create filename based on configured title if not provided
      if (!prototype.filename) {
        newPrototype.filename = prototype.title + '.html';
      }

      // Move css assets for this prototype,
      // reset css option with new file paths
      if (prototype.css) {
        newPrototype.css = moveAdditionalAssets(prototype.css, 'css', huron);
      }

      // Move js assets for this prototype,
      // reset js option with new file paths
      if (prototype.js) {
        newPrototype.js = moveAdditionalAssets(prototype.js, 'js', huron);
      }

      opts = Object.assign({}, defaultHTMLPluginOptions, newPrototype);
    }

    // Move global css assets,
    // reset css option with new file paths
    if (huron.css.length) {
      opts.css = opts.css.concat(moveAdditionalAssets(huron.css, 'css', huron));
    }

    // Move global js assets,
    // reset js option with new file paths
    if (huron.js.length) {
      opts.js = opts.js.concat(moveAdditionalAssets(huron.js, 'js', huron));
    }

    // Push a new plugin for each configured prototype
    if (Object.keys(opts).length) {
      newConfig.plugins.push(new HTMLWebpackPlugin(opts));
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
function moveAdditionalAssets(assets) {
  var subdir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var huron = arguments[2];

  var currentAssets = [].concat(assets);
  var assetResults = [];

  currentAssets.forEach(function (asset) {
    var assetInfo = path.parse(asset);
    var assetURL = url.parse(asset);
    var sourcePath = path.join(cwd, asset);
    var outputPath = path.resolve(cwd, huron.root, subdir, assetInfo.base);
    var loadPath = _parseArgs2.default.production ? path.join(subdir, assetInfo.base) : path.join('/', subdir, assetInfo.base); // Use absolute path in development
    var contents = false;

    if (!path.isAbsolute(asset) && !assetURL.protocol) {
      try {
        contents = fs.readFileSync(sourcePath);
      } catch (e) {
        console.warn('could not read ' + sourcePath);
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
//# sourceMappingURL=generate-config.js.map