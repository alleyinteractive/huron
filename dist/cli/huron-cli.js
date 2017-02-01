/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "../";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/utilities */

var cwd = process.cwd(); // Current working directory
var path = __webpack_require__(0);
var fs = __webpack_require__(1);
var chalk = __webpack_require__(2); // Colorize terminal output

// Exports
/* eslint-disable */
var utils = exports.utils = {
  /* eslint-enable */

  /**
   * Ensure predictable data structure for KSS section data
   *
   * @function normalizeSectionData
   * @param {object} section - section data
   * @return {object} section data
   */
  normalizeSectionData: function normalizeSectionData(section) {
    var data = section.data || section;

    if (!data.referenceURI || '' === data.referenceURI) {
      data.referenceURI = section.referenceURI();
    }

    return data;
  },


  /**
   * Ensure predictable data structure for KSS section data
   *
   * @function writeSectionData
   * @param {object} store - data store
   * @param {object} section - section data
   * @param {string} sectionPath - output destination for section data file
   */
  writeSectionData: function writeSectionData(store, section) {
    var sectionPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var outputPath = sectionPath;
    var sectionFileInfo = void 0;

    if (!outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {
      sectionFileInfo = path.parse(section.kssPath);
      outputPath = path.join(sectionFileInfo.dir, sectionFileInfo.name + '.json');
    }

    // Output section data
    if (outputPath) {
      return utils.writeFile(section.referenceURI, 'section', outputPath, JSON.stringify(section), store);
    }

    console.warn( // eslint-disable-line no-console
    chalk.red('Failed to write section data for ' + section.referenceURI));
    return false;
  },


  /**
   * Find .json from a template file or vice versa
   *
   * @function getTemplateDataPair
   * @param {object} file - file object from path.parse()
   * @param {object} section - KSS section data
   * @return {string} relative path to module JSON file
   */
  getTemplateDataPair: function getTemplateDataPair(file, section, store) {
    var huron = store.get('config');
    var kssDir = utils.matchKssDir(file.dir, huron);

    if (kssDir) {
      var componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
      var partnerType = '.json' === file.ext ? 'template' : 'data';
      var partnerExt = '.json' === file.ext ? huron.get('templates').extension : '.json';

      var pairPath = path.join(componentPath, utils.generateFilename(section.referenceURI, partnerType, partnerExt, store));

      return './' + pairPath;
    }

    return false;
  },


  /**
   * Normalize a section title for use as a filename
   *
   * @function normalizeHeader
   * @param {string} header - section header extracted from KSS documentation
   * @return {string} modified header, lowercase and words separated by dash
   */
  normalizeHeader: function normalizeHeader(header) {
    return header.toLowerCase().replace(/\s?\W\s?/g, '-');
  },


  /**
   * Wrap html in required template tags
   *
   * @function wrapMarkup
   * @param {string} content - html or template markup
   * @param {string} templateId - id of template (should be section reference)
   * @return {string} modified HTML
   */
  wrapMarkup: function wrapMarkup(content, templateId) {
    return '<dom-module>\n<template id="' + templateId + '">\n' + content + '\n</template>\n</dom-module>\n';
  },


  /**
   * Generate a filename based on referenceURI, type and file object
   *
   * @function generateFilename
   * @param  {string} id - The name of the file (with extension).
   * @param  {string} type - the type of file output
   * @param  {object} ext - file extension
   * @param  {store} store - data store
   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
   */
  generateFilename: function generateFilename(id, type, ext, store) {
    // Type of file and its corresponding extension(s)
    var types = store.get('types');
    var outputExt = '.scss' !== ext ? ext : '.html';

    /* eslint-disable */
    if (-1 === types.indexOf(type)) {
      console.log('Huron data ' + type + ' does not exist');
      return false;
    }
    /* eslint-enable */

    return id + '-' + type + outputExt;
  },


  /**
   * Copy an HTML file into the huron output directory.
   *
   * @function writeFile
   * @param  {string} id - The name of the file (with extension).
   * @param  {string} content - The content of the file to write.
   * @param  {string} type - the type of file output
   * @param  {object} store - The data store
   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
   */
  writeFile: function writeFile(id, type, filepath, content, store) {
    var huron = store.get('config');
    var file = path.parse(filepath);
    var filename = utils.generateFilename(id, type, file.ext, store);
    var kssDir = utils.matchKssDir(filepath, huron);

    if (kssDir) {
      var componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
      var outputRelative = path.join(huron.get('output'), componentPath, '' + filename);
      var outputPath = path.resolve(cwd, huron.get('root'), outputRelative);
      var newContent = content;

      if ('data' !== type && 'section' !== type) {
        newContent = utils.wrapMarkup(content, id);
      }

      try {
        fs.outputFileSync(outputPath, newContent);
        console.log(chalk.green('Writing ' + outputRelative)); // eslint-disable-line no-console
      } catch (e) {
        console.log(chalk.red('Failed to write ' + outputRelative)); // eslint-disable-line no-console
      }

      return './' + outputRelative.replace(huron.get('output') + '/', '');
    }

    return false;
  },


  /**
   * Delete a file in the huron output directory
   *
   * @function removeFile
   * @param  {string} filename - The name of the file (with extension).
   * @param  {object} store - The data store
   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
   */
  removeFile: function removeFile(id, type, filepath, store) {
    var huron = store.get('config');
    var file = path.parse(filepath);
    var filename = utils.generateFilename(id, type, file.ext, store);
    var kssDir = utils.matchKssDir(filepath, huron);

    if (kssDir) {
      var componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
      var outputRelative = path.join(huron.get('output'), componentPath, '' + filename);
      var outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

      try {
        fs.removeSync(outputPath);
        console.log(chalk.green('Removing ' + outputRelative)); // eslint-disable-line no-console
      } catch (e) {
        console.log( // eslint-disable-line no-console
        chalk.red(outputRelative + ' does not exist or cannot be deleted'));
      }

      return './' + outputRelative.replace(huron.get('output') + '/', '');
    }

    return false;
  },


  /**
   * Write a template for sections
   *
   * @function writeSectionTemplate
   * @param  {string} filepath - the original template file
   * @param  {object} store - data store
   * @return {object} updated store
   */
  writeSectionTemplate: function writeSectionTemplate(filepath, store) {
    var huron = store.get('config');
    var sectionTemplate = utils.wrapMarkup(fs.readFileSync(filepath, 'utf8'));
    var componentPath = './huron-sections/sections.hbs';
    var output = path.join(cwd, huron.get('root'), huron.get('output'), componentPath);

    // Move huron script and section template into huron root
    fs.outputFileSync(output, sectionTemplate);
    console.log(chalk.green('writing section template to ' + output)); // eslint-disable-line no-console

    return store.set('sectionTemplatePath', componentPath);
  },


  /**
   * Request for section data based on section reference
   *
   * @function writeSectionTemplate
   * @param {string} search - key on which to match section
   * @param {field} string - field in which to look to determine section
   * @param {obj} store - sections memory store
   */
  getSection: function getSection(search, field, store) {
    var sectionValues = store.getIn(['sections', 'sectionsByPath']).valueSeq();
    var selectedSection = false;

    if (field) {
      selectedSection = sectionValues.filter(function (value) {
        return value[field] === search;
      }).get(0);
    } else {
      selectedSection = store.getIn(['sections', 'sectionsByPath', search]);
    }

    return selectedSection;
  },


  /**
   * Match which configured KSS directory the current file
   *
   * @function matchKssDir
   * @param {string} search - key on which to match section
   * @param {field} string - field in which to look to determine section
   * @param {obj} sections - sections memory store
   * @return {string} kssMatch - relative path to KSS directory
   */
  matchKssDir: function matchKssDir(filepath, huron) {
    var kssSource = huron.get('kss');
    /* eslint-disable space-unary-ops */
    var kssMatch = kssSource.filter(function (dir) {
      return -1 !== filepath.indexOf(dir);
    });
    /* eslint-enable space-unary-ops */

    if (kssMatch.length) {
      return kssMatch[0];
    }

    console.error(chalk.red('filepath ' + filepath + ' does not exist in any\n      of the configured KSS directories'));
    return false;
  }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/parse-arguments */

// Requires
/** @global */
var program = __webpack_require__(17); // Easy program flags
var path = __webpack_require__(0);

exports.default = program;

/**
 * Process huron CLI arguments
 *
 * @function parseArgs
 * @example node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production
 */

function parseArgs() {
  program.version('1.0.1').option('-c, --huron-config [huronConfig]', '[huronConfig] for all huron options', path.resolve(__dirname, '../../config/huron.config.js')).option('-w, --webpack-config [webpackConfig]', '[webpackConfig] for all webpack options', path.resolve(__dirname, '../../config/webpack.config.js')).option('-p, --production', 'compile assets once for production').parse(process.argv);
}

parseArgs();

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("webpack");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.templateHandler = undefined;

var _utils = __webpack_require__(3);

var path = __webpack_require__(0); /** @module cli/template-handler */

var fs = __webpack_require__(1);
var chalk = __webpack_require__(2);

/* eslint-disable */
var templateHandler = exports.templateHandler = {
  /* eslint-enable */
  /**
   * Handle update of a template or data (json) file
   *
   * @function updateTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   * @return {object} updated memory store
   */
  updateTemplate: function updateTemplate(filepath, section, store) {
    var file = path.parse(filepath);
    var pairPath = _utils.utils.getTemplateDataPair(file, section, store);
    var type = '.json' === file.ext ? 'data' : 'template';
    var newSection = section;
    var newStore = store;
    var content = false;

    try {
      content = fs.readFileSync(filepath, 'utf8');
    } catch (e) {
      console.log(chalk.red(filepath + ' does not exist'));
    }

    if (content) {
      var requirePath = _utils.utils.writeFile(newSection.referenceURI, type, filepath, content, newStore);
      newSection[type + 'Path'] = requirePath;

      if ('template' === type) {
        newSection.templateContent = content;

        // Rewrite section data with template content
        newSection.sectionPath = _utils.utils.writeSectionData(newStore, newSection);
      }

      return newStore.setIn(['templates', requirePath], pairPath).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
    }

    return newStore;
  },


  /**
   * Handle removal of a template or data (json) file
   *
   * @function deleteTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   * @return {object} updated memory store
   */
  deleteTemplate: function deleteTemplate(filepath, section, store) {
    var file = path.parse(filepath);
    var type = '.json' === file.ext ? 'data' : 'template';
    var newSection = section;
    var newStore = store;

    // Remove partner
    var requirePath = _utils.utils.removeFile(newSection.referenceURI, type, filepath, newStore);
    delete newSection[type + 'Path'];

    return newStore.deleteIn(['templates', requirePath]).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
  }
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/require-templates */

var path = __webpack_require__(0);
var fs = __webpack_require__(1);

var cwd = process.cwd();
var huronScript = fs.readFileSync(path.join(__dirname, '../web/huron.js'), 'utf8');

/**
 * Write code for requiring all generated huron assets
 * Note: prepended and appended code in this file should roughly follow es5 syntax for now,
 *  as it will not pass through the Huron internal babel build nor can we assume the user is
 *  working with babel.
 *
 * @function requireTemplates
 * @param {object} store - memory store
 */
var requireTemplates = exports.requireTemplates = function requireTemplates(store) {
  var huron = store.get('config');
  var outputPath = path.join(cwd, huron.get('root'), 'huron-assets');
  var requireRegex = new RegExp('\\.html|\\.json|\\' + huron.get('templates').extension + '$');
  var requirePath = '\'../' + huron.get('output') + '\'';

  // Initialize templates, js, css and HMR acceptance logic
  var prepend = '\nvar store = require(\'./huron-store.js\');\nvar assets = require.context(' + requirePath + ', true, ' + requireRegex + ');\nvar modules = {};\n\nassets.keys().forEach(function(key) {\n  modules[key] = assets(key);\n});\n\nif (module.hot) {\n  module.hot.accept(\n    assets.id,\n    () => {\n      var newAssets = require.context(\n        ' + requirePath + ',\n        true,\n        ' + requireRegex + '\n      );\n      var newModules = newAssets.keys()\n        .map((key) => {\n          return [key, newAssets(key)];\n        })\n        .filter((newModule) => {\n          return modules[newModule[0]] !== newModule[1];\n        });\n\n      updateStore(require(\'./huron-store.js\'));\n\n      newModules.forEach((module) => {\n        modules[module[0]] = module[1];\n        hotReplace(module[0], module[1], modules);\n      });\n    }\n  );\n\n  module.hot.accept(\n    \'./huron-store.js\',\n    () => {\n      updateStore(require(\'./huron-store.js\'));\n    }\n  );\n}\n';

  var append = '\nfunction hotReplace(key, module, modules) {\n  insert.modules = modules;\n  if (key === store.sectionTemplatePath) {\n    insert.cycleSections();\n  } else {\n    insert.inserted = [];\n    insert.loadModule(key, module, false);\n  }\n};\n\nfunction updateStore(newStore) {\n  insert.store = newStore;\n}\n';

  // Write the contents of this script.
  // @todo lint this file.
  fs.outputFileSync(path.join(outputPath, 'huron.js'), '/*eslint-disable*/\n\n' + prepend + '\n\n' + huronScript + '\n\n' + append + '\n\n/*eslint-enable*/\n');
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @function writeStore
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
var writeStore = exports.writeStore = function writeStore(store) {
  var huron = store.get('config');
  var outputPath = path.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  // @todo lint this file.
  fs.outputFileSync(path.join(outputPath, 'huron-store.js'), '/*eslint-disable*/\n    module.exports = ' + JSON.stringify(store.toJSON()) + '\n    /*eslint-disable*/\n');
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _actions = __webpack_require__(11);

var _requireTemplates = __webpack_require__(7);

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _generateConfig = __webpack_require__(12);

var _generateConfig2 = _interopRequireDefault(_generateConfig);

var _server = __webpack_require__(16);

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Modules
var path = __webpack_require__(0); // Local imports

var Gaze = __webpack_require__(18).Gaze;
var Immutable = __webpack_require__(20);
var chalk = __webpack_require__(2); // Colorize terminal output

// Merge Huron default webpack config with user config
var config = (0, _generateConfig2.default)();

/**
 * Huron configuration object
 *
 * @global
 */
var huron = config.huron;

// Make sure the kss option is represented as an array
huron.kss = Array.isArray(huron.kss) ? huron.kss : [huron.kss];

/**
 * Available file extensions. Extensions should not include the leading '.'
 *
 * @global
 */
var extensions = [huron.kssExtension, huron.templates.extension, 'html', 'json'].map(function (extension) {
  return extension.replace('.', '');
});

// Create initial data structure
/* eslint-disable */
/**
 * Initial structure for immutable data store
 *
 * @global
 */
var dataStructure = Immutable.Map({
  types: ['template', 'data', 'description', 'section', 'prototype', 'sections-template'],
  config: Immutable.Map(config.huron),
  sections: Immutable.Map({
    sectionsByPath: Immutable.Map({}),
    sectionsByURI: Immutable.Map({}),
    sorted: {}
  }),
  templates: Immutable.Map({}),
  prototypes: Immutable.Map({}),
  sectionTemplatePath: '',
  referenceDelimiter: '.'
});
/* eslint-enable */

// Generate watch list for Gaze, start gaze
var gazeWatch = [];

// Push KSS source directories and section template to Gaze
gazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));
huron.kss.forEach(function (sourceDir) {
  var gazeDir = sourceDir;

  /* eslint-disable space-unary-ops */
  if ('/' === sourceDir.slice(-1)) {
    gazeDir = sourceDir.slice(0, -1);
  }
  /* eslint-enable space-unary-ops */

  gazeWatch.push(gazeDir + '/**/*.+(' + extensions.join('|') + ')');
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
var gaze = new Gaze(gazeWatch);

/**
 * Initialize data store with files from gaze and original data structure
 *
 * @global
 */
var store = (0, _actions.initFiles)(gaze.watched(), dataStructure);

(0, _requireTemplates.requireTemplates)(store);
(0, _requireTemplates.writeStore)(store);

if (!_parseArgs2.default.production) {
  (function () {
    /** @module cli/gaze */
    var newStore = store;

    /**
     * Anonymous handler for Gaze 'changed' event indicating a file has changed
     *
     * @callback changed
     * @listens gaze:changed
     * @param {string} filepath - absolute path of changed file
     */
    gaze.on('changed', function (filepath) {
      newStore = (0, _actions.updateFile)(filepath, newStore);
      console.log(chalk.green(filepath + ' updated!'));
    });

    /**
     * Anonymous handler for Gaze 'added' event indicating a file has been added to the watched directories
     *
     * @callback added
     * @listens gaze:added
     * @param {string} filepath - absolute path of changed file
     */
    gaze.on('added', function (filepath) {
      newStore = (0, _actions.updateFile)(filepath, newStore);
      (0, _requireTemplates.writeStore)(newStore);
      console.log(chalk.blue(filepath + ' added!'));
    });

    /**
     * Anonymous handler for Gaze 'renamed' event indicating a file has been renamed
     *
     * @callback renamed
     * @listens gaze:renamed
     * @param {string} filepath - absolute path of changed file
     */
    gaze.on('renamed', function (newPath, oldPath) {
      newStore = (0, _actions.deleteFile)(oldPath, newStore);
      newStore = (0, _actions.updateFile)(newPath, newStore);
      (0, _requireTemplates.writeStore)(newStore);
      console.log(chalk.blue(newPath + ' added!'));
    });

    /**
     * Anonymous handler for Gaze 'deleted' event indicating a file has been removed
     *
     * @callback deleted
     * @listens gaze:deleted
     * @param {string} filepath - absolute path of changed file
     */
    gaze.on('deleted', function (filepath) {
      newStore = (0, _actions.deleteFile)(filepath, newStore);
      (0, _requireTemplates.writeStore)(newStore);
      console.log(chalk.red(filepath + ' deleted'));
    });
  })();
} else {
  gaze.close();
}

// Start webpack or build for production
(0, _server2.default)(config);

if (false) {
  module.hot.accept();
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var path = __webpack_require__(0);

module.exports = {
  css: [],
  entry: 'huron',
  js: [],
  kss: 'css/',
  kssExtension: '.css',
  kssOptions: {
    multiline: true,
    markdown: true,
    custom: ['data']
  },
  output: 'partials',
  port: 8080,
  prototypes: ['index'],
  root: 'dist/',
  sectionTemplate: path.join(__dirname, '../templates/section.hbs'),
  templates: {
    rule: {
      test: /\.(hbs|handlebars)$/,
      use: 'handlebars-template-loader'
    },
    extension: '.hbs'
  },
  window: {}
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var webpack = __webpack_require__(5);
var path = __webpack_require__(0);
var cwd = process.cwd();

module.exports = {
  entry: {},
  output: {
    // path: [huron root directory],
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js'
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()],
  resolve: {
    modulesDirectories: [path.resolve(__dirname, '../src/js')]
  },
  resolveLoader: {
    modulesDirectories: ['web_loaders', 'web_modules', 'node_loaders', 'node_modules', path.resolve(__dirname, '../node_modules')]
  },
  module: {
    rules: [{
      test: /\.html?$/,
      use: [{
        loader: 'dom-loader',
        options: {
          tag: 'dom-module'
        }
      }, 'html-loader']
      // include: ['path/to/templates']
    }, {
      test: /\.json?$/,
      use: 'json-loader'
    }]
  }
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFiles = initFiles;
exports.updateFile = updateFile;
exports.deleteFile = deleteFile;

var _handleHtml = __webpack_require__(14);

var _handleTemplates = __webpack_require__(6);

var _handleKss = __webpack_require__(15);

var _utils = __webpack_require__(3);

// Requires
/** @module cli/actions */

// Imports
var path = __webpack_require__(0);
var chalk = __webpack_require__(2); // Colorize terminal output

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @param {object} huron - huron configuration options
 * @return {object} newStore - map object of entire data store
 */
function initFiles(data, store) {
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var type = Object.prototype.toString.call(data);
  var newStore = store;
  var info = void 0;
  var files = void 0;

  switch (type) {
    case '[object Object]':
      files = Object.keys(data);
      newStore = files.reduce(function (prevStore, file) {
        return initFiles(data[file], prevStore, depth);
      }, newStore);
      break;

    case '[object Array]':
      newStore = data.reduce(function (prevStore, file) {
        return initFiles(file, prevStore, depth);
      }, newStore);
      break;

    case '[object String]':
      info = path.parse(data);
      if (info.ext) {
        newStore = updateFile(data, store);
      }
      break;

    default:
      break;
  }

  return newStore;
}

/**
 * Logic for updating and writing file information based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 * @return {object} store - map object of map object of entire data store
 */
function updateFile(filepath, store) {
  var huron = store.get('config');
  var file = path.parse(filepath);
  var field = void 0;
  var section = void 0;

  if (-1 !== filepath.indexOf(huron.get('sectionTemplate'))) {
    return _utils.utils.writeSectionTemplate(filepath, store);
  }

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = _utils.utils.getSection(file.base, 'markup', store);

      if (section) {
        return _handleHtml.htmlHandler.updateTemplate(filepath, section, store);
      } else if (-1 !== file.dir.indexOf('prototypes') && -1 !== file.name.indexOf('prototype-')) {
        return _handleHtml.htmlHandler.updatePrototype(filepath, store);
      }

      console.log(chalk.red('Failed to write file: ' + file.name));
      break;

    // Handlebars template, external
    case huron.get('templates').extension:
    case '.json':
      field = '.json' === file.ext ? 'data' : 'markup';
      section = _utils.utils.getSection(file.base, field, store);

      if (section) {
        return _handleTemplates.templateHandler.updateTemplate(filepath, section, store);
      }

      console.log( // eslint-disable-line no-console
      chalk.red('Could not find associated KSS section for ' + filepath));
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      return _handleKss.kssHandler.updateKSS(filepath, store);

    // This should never happen if Gaze is working properly
    default:
      return store;
  }

  return store;
}

/**
 * Logic for deleting file information and files based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 * @return {object} newStore - map object of map object of entire data store
 */
function deleteFile(filepath, store) {
  var huron = store.get('config');
  var file = path.parse(filepath);
  var field = '';
  var section = null;
  var newStore = store;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = _utils.utils.getSection(file.base, 'markup', store);

      if (section) {
        newStore = _handleHtml.htmlHandler.deleteTemplate(filepath, section, store);
      } else if (-1 !== file.dir.indexOf('prototypes') && -1 !== file.name.indexOf('prototype-')) {
        newStore = _handleHtml.htmlHandler.deletePrototype(filepath, store);
      }
      break;

    case huron.get('templates').extension:
    case '.json':
      field = '.json' === file.ext ? 'data' : 'markup';
      section = _utils.utils.getSection(file.base, field, store);

      if (section) {
        newStore = _handleTemplates.templateHandler.deleteTemplate(filepath, section, store);
      }
      break;

    case huron.get('kssExtension'):
      section = _utils.utils.getSection(filepath, false, store);

      if (section) {
        newStore = _handleKss.kssHandler.deleteKSS(filepath, section, store);
      }
      break;

    default:
      console.warn( // eslint-disable-line no-console
      chalk.red('Could not delete: ' + file.name));
      break;
  }

  return newStore;
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /** @module cli/generate-config */

exports.default = generateConfig;

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _getLocalConfigs = __webpack_require__(13);

var _getLocalConfigs2 = _interopRequireDefault(_getLocalConfigs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = __webpack_require__(0);
var url = __webpack_require__(22);
var fs = __webpack_require__(1);
var webpack = __webpack_require__(5);
var HTMLWebpackPlugin = __webpack_require__(19);
var defaultConfig = __webpack_require__(10);
var defaultHuron = __webpack_require__(9);

// Require configs passed in by user from CLI
var cwd = process.cwd();
var configs = (0, _getLocalConfigs2.default)(cwd, path, _parseArgs2.default);
var localConfig = configs.webpack;
var localHuron = configs.huron;

/**
 * Generate a mutant hybrid of the huron default webpack config and your local webpack config
 *
 * @function generateConfig
 * @param {object} config - local webpack config
 * @return {object} newConfig - updated data store
 */
function generateConfig() {
  var newConfig = localConfig;
  var newHuron = Object.assign({}, defaultHuron, localHuron);

  // configure entries
  newConfig = configureEntries(newHuron, newConfig);

  // configure plugins
  newConfig = configurePlugins(newHuron, newConfig);

  // configure loaders
  newConfig = configureLoaders(newHuron, newConfig);

  // Add HTMLWebpackPlugin for each configured prototype
  newConfig = configurePrototypes(newHuron, newConfig);

  // Set ouput options
  newConfig.output = Object.assign({}, newConfig.output, defaultConfig.output);
  newConfig.output.path = path.resolve(cwd, newHuron.root);

  // Remove existing devServer settings
  delete newConfig.devServer;

  // Set publicPath
  if (!_parseArgs2.default.production) {
    newConfig.output.publicPath = 'http://localhost:' + newHuron.port + '/' + newHuron.root;
  } else {
    newConfig.output.publicPath = '';
  }

  return {
    huron: newHuron,
    webpack: newConfig
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
  var entry = config.entry[huron.entry];
  var newConfig = config;

  newConfig.entry = {};

  if (!_parseArgs2.default.production) {
    newConfig.entry[huron.entry] = ['webpack-dev-server/client?http://localhost:' + huron.port, 'webpack/hot/dev-server', path.join(cwd, huron.root, 'huron-assets/huron')].concat(entry);
  } else {
    newConfig.entry[huron.entry] = [path.join(cwd, huron.root, 'huron-assets/huron')].concat(entry);
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

  newConfig.plugins = config.plugins || [];

  if (!_parseArgs2.default.production) {
    if (newConfig.plugins && newConfig.plugins.length) {
      newConfig.plugins = newConfig.plugins.filter(function (plugin) {
        return 'HotModuleReplacementPlugin' !== plugin.constructor.name && 'NamedModulesPlugin' !== plugin.constructor.name;
      });
    }
    newConfig.plugins = newConfig.plugins.concat([new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()]);
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
  var templatesLoader = huron.templates.rule || {};
  var newConfig = config;

  templatesLoader.include = [path.join(cwd, huron.root)];
  newConfig.module = newConfig.module || {};
  newConfig.module.rules = newConfig.module.rules || [];
  newConfig.module.rules.push({
    test: /\.html$/,
    use: 'html-loader',
    include: [path.join(cwd, huron.root)]
  }, {
    test: /\.json$/,
    use: 'json-loader',
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

/***/ }),
/* 13 */
/***/ (function(module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getLocalConfigs;
// This is real ugly, need to figure out a better way of doing this
/* eslint-disable import/no-dynamic-require, global-require */
function getLocalConfigs(cwd, path, program) {
  return {
    webpack: require(path.join(cwd, program.webpackConfig)),
    huron: require(path.join(cwd, program.huronConfig))
  };
}
/* eslint-enable */

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.htmlHandler = undefined;

var _utils = __webpack_require__(3);

var path = __webpack_require__(0); /** @module cli/html-handler */

var fs = __webpack_require__(1);

/* eslint-disable */
var htmlHandler = exports.htmlHandler = {
  /* eslint-enable */

  /**
   * Handle update of an HMTL template
   *
   * @function updateTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  updateTemplate: function updateTemplate(filepath, section, store) {
    var file = path.parse(filepath);
    var content = fs.readFileSync(filepath, 'utf8');
    var newSection = section;

    if (content) {
      newSection.templatePath = _utils.utils.writeFile(section.referenceURI, 'template', filepath, content, store);
      newSection.templateContent = content;

      // Rewrite section data with template content
      newSection.sectionPath = _utils.utils.writeSectionData(store, newSection);

      return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
    }

    console.log('File ' + file.base + ' could not be read');
    return store;
  },


  /**
   * Handle removal of an HMTL template
   *
   * @function deleteTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  deleteTemplate: function deleteTemplate(filepath, section, store) {
    var newSection = section;

    _utils.utils.removeFile(newSection.referenceURI, 'template', filepath, store);

    delete newSection.templatePath;

    return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  },


  /**
   * Handle update for a prototype file
   *
   * @function updatePrototype
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  updatePrototype: function updatePrototype(filepath, store) {
    var file = path.parse(filepath);
    var content = fs.readFileSync(filepath, 'utf8');

    if (content) {
      var requirePath = _utils.utils.writeFile(file.name, 'prototype', filepath, content, store);

      return store.setIn(['prototypes', file.name], requirePath);
    }

    console.log('File ' + file.base + ' could not be read');
    return store;
  },


  /**
   * Handle removal of a prototype file
   *
   * @function deletePrototype
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  deletePrototype: function deletePrototype(filepath, store) {
    var file = path.parse(filepath);
    var requirePath = _utils.utils.removeFile(file.name, 'prototype', filepath, store);

    return store.setIn(['prototypes', file.name], requirePath);
  }
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.kssHandler = undefined;

var _utils = __webpack_require__(3);

var _handleTemplates = __webpack_require__(6);

var _requireTemplates = __webpack_require__(7);

var path = __webpack_require__(0); /** @module cli/kss-handler */

var fs = __webpack_require__(1);
var parse = __webpack_require__(21).parse;
var chalk = __webpack_require__(2); // Colorize terminal output

/* eslint-disable */
var kssHandler = exports.kssHandler = {
  /* eslint-enable */

  /**
   * Handle update of a KSS section
   *
   * @function updateKSS
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  updateKSS: function updateKSS(filepath, store) {
    var kssSource = fs.readFileSync(filepath, 'utf8');
    var huron = store.get('config');
    var oldSection = _utils.utils.getSection(filepath, false, store) || {};
    var file = path.parse(filepath);
    var newStore = store;

    if (kssSource) {
      var styleguide = parse(kssSource, huron.get('kssOptions'));

      if (styleguide.data.sections.length) {
        var section = _utils.utils.normalizeSectionData(styleguide.data.sections[0]);

        if (section.reference && section.referenceURI) {
          // Update or add section data
          newStore = kssHandler.updateSectionData(filepath, section, oldSection, newStore);

          // Remove old section data if reference URI has changed
          if (oldSection && oldSection.referenceURI && oldSection.referenceURI !== section.referenceURI) {
            newStore = this.unsetSection(oldSection, file, newStore, false);
          }

          (0, _requireTemplates.writeStore)(newStore);
          console.log(chalk.green('KSS source in ' + filepath + ' changed or added'));
          return newStore;
        }

        console.log(chalk.magenta('KSS section in ' + filepath + ' is missing a section reference'));
        return newStore;
      }

      console.log(chalk.magenta('No KSS found in ' + filepath));
      return newStore;
    }

    if (oldSection) {
      newStore = kssHandler.deleteKSS(filepath, oldSection, newStore);
    }

    console.log(chalk.red(filepath + ' not found or empty')); // eslint-disable-line no-console
    return newStore;
  },


  /**
   * Handle removal of a KSS section
   *
   * @function deleteKSS
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - KSS section data
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  deleteKSS: function deleteKSS(filepath, section, store) {
    var file = path.parse(filepath);

    if (section.reference && section.referenceURI) {
      // Remove section data from memory store
      return kssHandler.unsetSection(section, file, store, true);
    }

    return store;
  },


  /**
   * Update the sections store with new data for a specific section
   *
   * @function updateSectionData
   * @param {object} section - contains updated section data
   * @param {string} kssPath - path to KSS section
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  updateSectionData: function updateSectionData(kssPath, section, oldSection, store) {
    var sectionFileInfo = path.parse(kssPath);
    var dataFilepath = path.join(sectionFileInfo.dir, sectionFileInfo.name + '.json');
    var isInline = null !== section.markup.match(/<\/[^>]*>/);
    var newSort = kssHandler.sortSection(store.getIn(['sections', 'sorted']), section.reference, store.get('referenceDelimiter'));
    var newSection = Object.assign({}, oldSection, section);
    var newStore = store;

    // Required for reference from templates and data
    newSection.kssPath = kssPath;

    if (isInline) {
      // Set section value if inlineTempalte() returned a path
      newStore = kssHandler.updateInlineTemplate(kssPath, oldSection, newSection, newStore);
    } else {
      // Remove inline template, if it exists
      _utils.utils.removeFile(newSection.referenceURI, 'template', kssPath, store);
      // Update markup and data fields
      newStore = kssHandler.updateTemplateFields(sectionFileInfo, oldSection, newSection, newStore);
    }

    // Output section description
    newStore = kssHandler.updateDescription(kssPath, oldSection, newSection, newStore);

    // Output section data to a JSON file
    newSection.sectionPath = _utils.utils.writeSectionData(newStore, newSection, dataFilepath);

    // Update section sorting
    return newStore.setIn(['sections', 'sorted'], newSort).setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  },


  /**
   * Handle detection and output of inline templates, which is markup written
   * in the KSS documentation itself as opposed to an external file
   *
   * @function updateInlineTemplate
   * @param {string} oldSection - previous iteration of KSS data, if updated
   * @param {object} section - KSS section data
   * @return {object} updated data store with new template path info
   */
  updateInlineTemplate: function updateInlineTemplate(filepath, oldSection, section, store) {
    var newSection = section;
    var newStore = store;

    // If we have inline markup
    if (this.fieldShouldOutput(oldSection, section, 'markup')) {
      newSection.templatePath = _utils.utils.writeFile(section.referenceURI, 'template', filepath, section.markup, store);
      newSection.templateContent = section.markup;

      return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
    }

    return newStore;
  },


  /**
   * Handle output of section description
   *
   * @function updateDescription
   * @param {string} oldSection - previous iteration of KSS data, if updated
   * @param {object} section - KSS section data
   * @return {object} updated data store with new descripton path info
   */
  updateDescription: function updateDescription(filepath, oldSection, section, store) {
    var newSection = section;
    var newStore = store;

    // If we don't have previous KSS or the KSS has been updated
    if (this.fieldShouldOutput(oldSection, section, 'description')) {
      // Write new description
      newSection.descriptionPath = _utils.utils.writeFile(section.referenceURI, 'description', filepath, section.description, store);

      return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
    }

    return newStore;
  },


  /**
   * Handle Data and Markup fields
   *
   * @function updateTemplateFields
   * @param {string} file - File data for KSS file from path.parse()
   * @param {object} oldSection - outdated KSS data
   * @param {object} section - KSS section data
   * @param {object} store - memory store
   * @return {object} KSS section data with updated asset paths
   */
  updateTemplateFields: function updateTemplateFields(file, oldSection, section, store) {
    var kssPath = path.format(file);
    var newSection = section;
    var filepath = '';
    var oldFilepath = '';
    var newStore = store;

    ['data', 'markup'].forEach(function (field) {
      if (newSection[field]) {
        if (oldSection[field]) {
          oldFilepath = path.join(file.dir, oldSection[field]);
          newStore = _handleTemplates.templateHandler.deleteTemplate(oldFilepath, oldSection, newStore);
        }

        filepath = path.join(file.dir, newSection[field]);
        newStore = _handleTemplates.templateHandler.updateTemplate(filepath, newSection, newStore);
      } else {
        delete newSection[field];
        newStore = newStore.setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
      }
    });

    return newStore;
  },


  /**
   * Remove a section from the memory store
   *
   * @function unsetSection
   * @param {object} section - contains updated section data
   * @param {string} file - file object from path.parse()
   * @param {object} store - memory store
   * @param {bool} removed - has the file been removed or just the section information changed?
   * @return {object} updated data store with new descripton path info
   */
  unsetSection: function unsetSection(section, file, store, removed) {
    var sorted = store.getIn(['sections', 'sorted']);
    var kssPath = path.format(file);
    var dataFilepath = path.join(file.dir, file.name + '.json');
    var isInline = section.markup && null !== section.markup.match(/<\/[^>]*>/);
    var newSort = kssHandler.unsortSection(sorted, section.reference, store.get('referenceDelimiter'));
    var newStore = store;

    // Remove old section data
    _utils.utils.removeFile(section.referenceURI, 'section', dataFilepath, newStore);

    // Remove associated inline template
    if (isInline) {
      _utils.utils.removeFile(section.referenceURI, 'template', kssPath, newStore);
    }

    // Remove description template
    _utils.utils.removeFile(section.referenceURI, 'description', kssPath, newStore);

    // Remove data from sectionsByPath if file has been removed
    if (removed) {
      newStore = newStore.deleteIn(['sections', 'sectionsByPath', kssPath]);
    }

    return newStore.deleteIn(['sections', 'sectionsByURI', section.referenceURI]).setIn(['sections', 'sorted'], newSort);
  },


  /**
   * Sort sections and subsections
   *
   * @function sortSection
   * @param {object} sorted - currently sorted sections
   * @param {string} reference - reference URI of section to sort
   * @return {object} updated data store with new descripton path info
   */
  sortSection: function sortSection(sorted, reference, delimiter) {
    var parts = reference.split(delimiter);
    var newSort = sorted[parts[0]] || {};
    var newSorted = sorted;

    if (1 < parts.length) {
      var newParts = parts.filter(function (part, idx) {
        return 0 !== idx;
      });
      newSorted[parts[0]] = kssHandler.sortSection(newSort, newParts.join(delimiter), delimiter);
    } else {
      newSorted[parts[0]] = newSort;
    }

    return newSorted;
  },


  /**
   * Remove a section from the sorted sections
   *
   * @function unsortSection
   * @param {object} sorted - currently sorted sections
   * @param {string} reference - reference URI of section to sort
   * @return {object} updated data store with new descripton path info
   */
  unsortSection: function unsortSection(sorted, reference, delimiter) {
    var parts = reference.split(delimiter);
    var subsections = Object.keys(sorted[parts[0]]);
    var newSorted = sorted;

    if (subsections.length) {
      if (1 < parts.length) {
        var newParts = parts.filter(function (part, idx) {
          return 0 !== idx;
        });
        newSorted[parts[0]] = kssHandler.unsortSection(newSorted[parts[0]], newParts.join(delimiter), delimiter);
      }
    } else {
      delete newSorted[parts[0]];
    }

    return newSorted;
  },


  /**
   * Compare a KSS field between old and new KSS data to see if we need to output
   * a new module for that field
   *
   * @function fieldShouldOutput
   * @param {object} oldSection - currently sorted sections
   * @param {object} newSection - reference URI of section to sort
   * @param {string} field - KSS field to check
   * @return {bool} output a new module for the KSS field
   */
  fieldShouldOutput: function fieldShouldOutput(oldSection, newSection, field) {
    return oldSection && (oldSection[field] !== newSection[field] || oldSection.referenceURI !== newSection.referenceURI) || !oldSection;
  }
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startWebpack;

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpack = __webpack_require__(5); /** @module cli/webpack-server */

var WebpackDevServer = __webpack_require__(23);

/**
 * Spin up webpack-dev-server or, if production flag is set, run webpack a single time
 *
 * @function startWebpack
 * @param {object} config - webpack configuration, preprocessed by {@link module:cli/generate-config generateConfig}
 * @see {@link module:cli/generate-config generateConfig}
 */
function startWebpack(config) {
  var huron = config.huron;
  var webpackConfig = config.webpack;
  var compiler = webpack(webpackConfig);

  if (_parseArgs2.default.progress) {
    compiler.apply(new webpack.ProgressPlugin(function (percentage, msg) {
      console.log(percentage * 100 + '% ', msg);
    }));
  }

  if (_parseArgs2.default.production) {
    compiler.run(function (err) {
      if (err) {
        console.log(err);
      }
    });
  } else {
    var server = new WebpackDevServer(compiler, {
      hot: true,
      quiet: false,
      noInfo: false,
      stats: {
        colors: true,
        hash: false,
        version: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false
      },
      contentBase: huron.root,
      publicPath: 'http://localhost:' + huron.port + '/' + huron.root
    });
    server.listen(huron.port, 'localhost', function (err) {
      if (err) {
        return console.log(err);
      }

      console.log('Listening at http://localhost:' + huron.port + '/');
      return true;
    });
  }
}

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("commander");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("gaze");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("html-webpack-plugin");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("immutable");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("kss");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("webpack-dev-server");

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ })
/******/ ]);
//# sourceMappingURL=huron-cli.js.map