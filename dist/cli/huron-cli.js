#!/usr/bin/env node

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
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
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "../";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/parse-arguments */
/* eslint-disable space-unary-ops */

// Requires
/** @global */
const program = __webpack_require__(18); // Easy program flags
const path = __webpack_require__(0);

exports.default = program;

/**
 * Process huron CLI arguments
 *
 * @function parseArgs
 * @example node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production
 */

function parseArgs() {
  const envArg = {};

  process.argv = process.argv.filter(arg => {
    if (-1 !== arg.indexOf('--env')) {
      const envParts = arg.split('.')[1].split('=');

      envArg[envParts[0]] = envParts[1] || true;
      return false;
    }

    return true;
  });

  program.version('1.0.1').option('-c, --huron-config [huronConfig]', '[huronConfig] for all huron options', path.resolve(__dirname, '../default-config/huron.config.js')).option('-w, --webpack-config [webpackConfig]', '[webpackConfig] for all webpack options', path.resolve(__dirname, '../default-config/webpack.config.js')).option('-p, --production', 'compile assets once for production');

  program.env = envArg;

  // Only parse if we're not running tests
  if (!process.env.npm_lifecycle_event || 'test' !== process.env.npm_lifecycle_event) {
    program.parse(process.argv);
  }
}

parseArgs();
/* eslint-enable */

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeSectionData = normalizeSectionData;
exports.writeSectionData = writeSectionData;
exports.getTemplateDataPair = getTemplateDataPair;
exports.normalizeHeader = normalizeHeader;
exports.wrapMarkup = wrapMarkup;
exports.generateFilename = generateFilename;
exports.writeFile = writeFile;
exports.removeFile = removeFile;
exports.writeSectionTemplate = writeSectionTemplate;
exports.getSection = getSection;
exports.matchKssDir = matchKssDir;
/** @module cli/utilities */

const cwd = process.cwd(); // Current working directory
const path = __webpack_require__(0);
const fs = __webpack_require__(2);
const chalk = __webpack_require__(1); // Colorize terminal output

/**
 * Ensure predictable data structure for KSS section data
 *
 * @function normalizeSectionData
 * @param {object} section - section data
 * @return {object} section data
 */
function normalizeSectionData(section) {
  const data = section.data || section;

  if (!data.referenceURI || '' === data.referenceURI) {
    data.referenceURI = section.referenceURI();
  }

  return data;
}

/**
 * Ensure predictable data structure for KSS section data
 *
 * @function writeSectionData
 * @param {object} store - data store
 * @param {object} section - section data
 * @param {string} sectionPath - output destination for section data file
 */
function writeSectionData(store, section, sectionPath = false) {
  let outputPath = sectionPath;
  let sectionFileInfo;

  if (!outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {
    sectionFileInfo = path.parse(section.kssPath);
    outputPath = path.join(sectionFileInfo.dir, `${sectionFileInfo.name}.json`);
  }

  // Output section data
  if (outputPath) {
    return writeFile(section.referenceURI, 'section', outputPath, JSON.stringify(section), store);
  }

  console.warn( // eslint-disable-line no-console
  chalk.red(`Failed to write section data for ${section.referenceURI}`));
  return false;
}

/**
 * Find .json from a template file or vice versa
 *
 * @function getTemplateDataPair
 * @param {object} file - file object from path.parse()
 * @param {object} section - KSS section data
 * @return {string} relative path to module JSON file
 */
function getTemplateDataPair(file, section, store) {
  const huron = store.get('config');
  const kssDir = matchKssDir(file.dir, huron);

  if (kssDir) {
    const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
    const partnerType = '.json' === file.ext ? 'template' : 'data';
    const partnerExt = '.json' === file.ext ? huron.get('templates').extension : '.json';

    const pairPath = path.join(componentPath, generateFilename(section.referenceURI, partnerType, partnerExt, store));

    return `./${pairPath}`;
  }

  return false;
}

/**
 * Normalize a section title for use as a filename
 *
 * @function normalizeHeader
 * @param {string} header - section header extracted from KSS documentation
 * @return {string} modified header, lowercase and words separated by dash
 */
function normalizeHeader(header) {
  return header.toLowerCase().replace(/\s?\W\s?/g, '-');
}

/**
 * Wrap html in required template tags
 *
 * @function wrapMarkup
 * @param {string} content - html or template markup
 * @param {string} templateId - id of template (should be section reference)
 * @return {string} modified HTML
 */
function wrapMarkup(content, templateId) {
  return `<dom-module>
<template id="${templateId}">
${content}
</template>
</dom-module>\n`;
}

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
function generateFilename(id, type, ext, store) {
  // Type of file and its corresponding extension(s)
  const types = store.get('types');
  const outputExt = '.scss' !== ext ? ext : '.html';

  /* eslint-disable */
  if (-1 === types.indexOf(type)) {
    console.log(`Huron data ${type} does not exist`);
    return false;
  }
  /* eslint-enable */

  return `${id}-${type}${outputExt}`;
}

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
function writeFile(id, type, filepath, content, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const filename = generateFilename(id, type, file.ext, store);
  const kssDir = matchKssDir(filepath, huron);

  if (kssDir) {
    const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
    const outputRelative = path.join(huron.get('output'), componentPath, `${filename}`);
    const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);
    let newContent = content;

    if ('data' !== type && 'section' !== type) {
      newContent = wrapMarkup(content, id);
    }

    try {
      fs.outputFileSync(outputPath, newContent);
      console.log(chalk.green(`Writing ${outputRelative}`)); // eslint-disable-line no-console
    } catch (e) {
      console.log(chalk.red(`Failed to write ${outputRelative}`)); // eslint-disable-line no-console
    }

    return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
  }

  return false;
}

/**
 * Delete a file in the huron output directory
 *
 * @function removeFile
 * @param  {string} filename - The name of the file (with extension).
 * @param  {object} store - The data store
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
function removeFile(id, type, filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const filename = generateFilename(id, type, file.ext, store);
  const kssDir = matchKssDir(filepath, huron);

  if (kssDir) {
    const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
    const outputRelative = path.join(huron.get('output'), componentPath, `${filename}`);
    const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

    try {
      fs.removeSync(outputPath);
      console.log(chalk.green(`Removing ${outputRelative}`)); // eslint-disable-line no-console
    } catch (e) {
      console.log( // eslint-disable-line no-console
      chalk.red(`${outputRelative} does not exist or cannot be deleted`));
    }

    return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
  }

  return false;
}

/**
 * Write a template for sections
 *
 * @function writeSectionTemplate
 * @param  {string} filepath - the original template file
 * @param  {object} store - data store
 * @return {object} updated store
 */
function writeSectionTemplate(filepath, store) {
  const huron = store.get('config');
  const sectionTemplate = wrapMarkup(fs.readFileSync(filepath, 'utf8'));
  const componentPath = './huron-assets/section.hbs';
  const output = path.join(cwd, huron.get('root'), componentPath);

  // Move huron script and section template into huron root
  fs.outputFileSync(output, sectionTemplate);
  console.log(chalk.green(`writing section template to ${output}`)); // eslint-disable-line no-console

  return store.set('sectionTemplatePath', componentPath);
}

/**
 * Request for section data based on section reference
 *
 * @function writeSectionTemplate
 * @param {string} search - key on which to match section
 * @param {field} string - field in which to look to determine section
 * @param {obj} store - sections memory store
 */
function getSection(search, field, store) {
  const sectionValues = store.getIn(['sections', 'sectionsByPath']).valueSeq();
  let selectedSection = false;

  if (field) {
    selectedSection = sectionValues.filter(value => value[field] === search).get(0);
  } else {
    selectedSection = store.getIn(['sections', 'sectionsByPath', search]);
  }

  return selectedSection;
}

/**
 * Find which configured KSS directory a filepath exists in
 *
 * @function matchKssDir
 * @param {string} filepath - filepath to search for
 * @param {object} huron - huron configuration
 * @return {string} kssMatch - relative path to KSS directory
 */
function matchKssDir(filepath, huron) {
  const kssSource = huron.get('kss');
  /* eslint-disable space-unary-ops */
  // Include forward slash in our test to make sure we're matchin a directory, not a file extension
  const kssMatch = kssSource.filter(dir => filepath.includes(`/${dir}`));
  /* eslint-enable space-unary-ops */

  if (kssMatch.length) {
    return kssMatch[0];
  }

  console.error(chalk.red(`filepath ${filepath} does not exist in any
    of the configured KSS directories`));

  return false;
}

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
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;

var _utils = __webpack_require__(4);

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const path = __webpack_require__(0); /** @module cli/template-handler */

const fs = __webpack_require__(2);
const chalk = __webpack_require__(1);

/**
 * Handle update of a template or data (json) file
 *
 * @function updateTemplate
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated memory store
 */
function updateTemplate(filepath, section, store) {
  const file = path.parse(filepath);
  const pairPath = utils.getTemplateDataPair(file, section, store);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  const newStore = store;
  let content = false;

  try {
    content = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    console.log(chalk.red(`${filepath} does not exist`));
  }

  if (content) {
    const requirePath = utils.writeFile(newSection.referenceURI, type, filepath, content, newStore);
    newSection[`${type}Path`] = requirePath;

    if ('template' === type) {
      newSection.templateContent = content;

      // Rewrite section data with template content
      newSection.sectionPath = utils.writeSectionData(newStore, newSection);
    }

    return newStore.setIn(['templates', requirePath], pairPath).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
  }

  return newStore;
}

/**
 * Handle removal of a template or data (json) file
 *
 * @function deleteTemplate
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated memory store
 */
function deleteTemplate(filepath, section, store) {
  const file = path.parse(filepath);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  const newStore = store;

  // Remove partner
  const requirePath = utils.removeFile(newSection.referenceURI, type, filepath, newStore);
  delete newSection[`${type}Path`];

  return newStore.deleteIn(['templates', requirePath]).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/require-templates */

const path = __webpack_require__(0);
const fs = __webpack_require__(2);

const cwd = process.cwd();
const huronScript = fs.readFileSync(path.join(__dirname, '../web/huron.js'), 'utf8');

/**
 * Write code for requiring all generated huron assets
 * Note: prepended and appended code in this file should roughly follow es5 syntax for now,
 *  as it will not pass through the Huron internal babel build nor can we assume the user is
 *  working with babel.
 *
 * @function requireTemplates
 * @param {object} store - memory store
 */
const requireTemplates = exports.requireTemplates = function requireTemplates(store) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');
  const requireRegex = new RegExp(`\\.html|\\.json|\\${huron.get('templates').extension}$`);
  const requirePath = `'../${huron.get('output')}'`;

  // Initialize templates, js, css and HMR acceptance logic
  const prepend = `
var store = require('./huron-store.js');
var sectionTemplate = require('./section.hbs');
var assets = require.context(${requirePath}, true, ${requireRegex});
var modules = {};

modules['${store.get('sectionTemplatePath')}'] = sectionTemplate;

assets.keys().forEach(function(key) {
  modules[key] = assets(key);
});

if (module.hot) {
  // HMR for huron components (json, hbs, html)
  module.hot.accept(
    assets.id,
    () => {
      var newAssets = require.context(
        ${requirePath},
        true,
        ${requireRegex}
      );
      var newModules = newAssets.keys()
        .map((key) => {
          return [key, newAssets(key)];
        })
        .filter((newModule) => {
          return modules[newModule[0]] !== newModule[1];
        });

      updateStore(require('./huron-store.js'));

      newModules.forEach((module) => {
        modules[module[0]] = module[1];
        hotReplace(module[0], module[1], modules);
      });
    }
  );

  // HMR for sections template
  module.hot.accept(
    './section.hbs',
    () => {
      var newSectionTemplate = require('./section.hbs');
      modules['${store.get('sectionTemplatePath')}'] = newSectionTemplate;
      hotReplace(
        './huron-assets/section.hbs',
        newSectionTemplate,
        modules
      );
    }
  );

  // HMR for data store
  module.hot.accept(
    './huron-store.js',
    () => {
      updateStore(require('./huron-store.js'));
    }
  );
}\n`;

  const append = `
function hotReplace(key, module, modules) {
  insert.modules = modules;
  if (key === store.sectionTemplatePath) {
    insert.cycleSections();
  } else {
    insert.inserted = [];
    insert.loadModule(key, module, false);
  }
};

function updateStore(newStore) {
  insert.store = newStore;
}\n`;

  // Write the contents of this script.
  // @todo lint this file.
  fs.outputFileSync(path.join(outputPath, 'huron.js'), `/*eslint-disable*/\n
${prepend}\n\n${huronScript}\n\n${append}\n
/*eslint-enable*/\n`);
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @function writeStore
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
const writeStore = exports.writeStore = function writeStore(store) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  // @todo lint this file.
  fs.outputFileSync(path.join(outputPath, 'huron-store.js'), `/*eslint-disable*/
    module.exports = ${JSON.stringify(store.toJSON())}
    /*eslint-disable*/\n`);
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _actions = __webpack_require__(9);

var _requireTemplates = __webpack_require__(7);

var _parseArgs = __webpack_require__(3);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _server = __webpack_require__(15);

var _server2 = _interopRequireDefault(_server);

var _huronStore = __webpack_require__(13);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Modules
const path = __webpack_require__(0); // Local imports

const Gaze = __webpack_require__(19).Gaze;
const chalk = __webpack_require__(1); // Colorize terminal output

/**
 * Huron configuration object
 *
 * @global
 */
const huron = _huronStore.dataStructure.get('config');

/**
 * Available file extensions. Extensions should not include the leading '.'
 *
 * @global
 */
const extensions = [huron.get('kssExtension'), huron.get('templates').extension, 'html', 'json'].map(extension => extension.replace('.', ''));

// Generate watch list for Gaze, start gaze
const gazeWatch = [];

// Push KSS source directories and section template to Gaze
gazeWatch.push(path.resolve(__dirname, huron.get('sectionTemplate')));
huron.get('kss').forEach(sourceDir => {
  let gazeDir = sourceDir;

  /* eslint-disable space-unary-ops */
  if ('/' === sourceDir.slice(-1)) {
    gazeDir = sourceDir.slice(0, -1);
  }
  /* eslint-enable space-unary-ops */

  gazeWatch.push(`${gazeDir}/**/*.+(${extensions.join('|')})`);
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
const gaze = new Gaze(gazeWatch);

/**
 * Initialize data store with files from gaze and original data structure
 *
 * @global
 */
const store = (0, _actions.initFiles)(gaze.watched(), _huronStore.dataStructure);

(0, _requireTemplates.requireTemplates)(store);
(0, _requireTemplates.writeStore)(store);

if (!_parseArgs2.default.production) {
  /** @module cli/gaze */
  let newStore = store;

  /**
   * Anonymous handler for Gaze 'changed' event indicating a file has changed
   *
   * @callback changed
   * @listens gaze:changed
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('changed', filepath => {
    newStore = (0, _actions.updateFile)(filepath, newStore);
    console.log(chalk.green(`${filepath} updated!`));
  });

  /**
   * Anonymous handler for Gaze 'added' event indicating a file has been added to the watched directories
   *
   * @callback added
   * @listens gaze:added
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('added', filepath => {
    newStore = (0, _actions.updateFile)(filepath, newStore);
    (0, _requireTemplates.writeStore)(newStore);
    console.log(chalk.blue(`${filepath} added!`));
  });

  /**
   * Anonymous handler for Gaze 'renamed' event indicating a file has been renamed
   *
   * @callback renamed
   * @listens gaze:renamed
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('renamed', (newPath, oldPath) => {
    newStore = (0, _actions.deleteFile)(oldPath, newStore);
    newStore = (0, _actions.updateFile)(newPath, newStore);
    (0, _requireTemplates.writeStore)(newStore);
    console.log(chalk.blue(`${newPath} added!`));
  });

  /**
   * Anonymous handler for Gaze 'deleted' event indicating a file has been removed
   *
   * @callback deleted
   * @listens gaze:deleted
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('deleted', filepath => {
    newStore = (0, _actions.deleteFile)(filepath, newStore);
    (0, _requireTemplates.writeStore)(newStore);
    console.log(chalk.red(`${filepath} deleted`));
  });
} else {
  gaze.close();
}

// Start webpack or build for production
(0, _server2.default)(_huronStore.config);

if (false) {
  module.hot.accept();
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFiles = initFiles;
exports.updateFile = updateFile;
exports.deleteFile = deleteFile;

var _handleHtml = __webpack_require__(11);

var _handleTemplates = __webpack_require__(6);

var _handleKss = __webpack_require__(12);

var _utils = __webpack_require__(4);

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Requires
/** @module cli/actions */

// Imports
const path = __webpack_require__(0);
const chalk = __webpack_require__(1); // Colorize terminal output

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @param {object} huron - huron configuration options
 * @return {object} newStore - map object of entire data store
 */
function initFiles(data, store, depth = 0) {
  const type = Object.prototype.toString.call(data);
  let newStore = store;
  let info;
  let files;

  switch (type) {
    case '[object Object]':
      files = Object.keys(data);
      newStore = files.reduce((prevStore, file) => initFiles(data[file], prevStore, depth), newStore);
      break;

    case '[object Array]':
      newStore = data.reduce((prevStore, file) => initFiles(file, prevStore, depth), newStore);
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
  const huron = store.get('config');
  const file = path.parse(filepath);
  let field;
  let section;

  if (filepath.includes(huron.get('sectionTemplate'))) {
    return utils.writeSectionTemplate(filepath, store);
  }

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        return (0, _handleHtml.updateHTML)(filepath, section, store);
      } else if (-1 !== file.dir.indexOf('prototypes') && -1 !== file.name.indexOf('prototype-')) {
        return (0, _handleHtml.updatePrototype)(filepath, store);
      }

      console.log(chalk.red(`Failed to write file: ${file.name}`));
      break;

    // Handlebars template, external
    case huron.get('templates').extension:
    case '.json':
      field = '.json' === file.ext ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        return (0, _handleTemplates.updateTemplate)(filepath, section, store);
      }

      console.log( // eslint-disable-line no-console
      chalk.red(`Could not find associated KSS section for ${filepath}`));
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      return (0, _handleKss.updateKSS)(filepath, store);

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
  const huron = store.get('config');
  const file = path.parse(filepath);
  let field = '';
  let section = null;
  let newStore = store;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        newStore = (0, _handleHtml.deleteHTML)(filepath, section, store);
      } else if (-1 !== file.dir.indexOf('prototypes') && -1 !== file.name.indexOf('prototype-')) {
        newStore = (0, _handleHtml.deletePrototype)(filepath, store);
      }
      break;

    case huron.get('templates').extension:
    case '.json':
      field = '.json' === file.ext ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        newStore = (0, _handleTemplates.deleteTemplate)(filepath, section, store);
      }
      break;

    case huron.get('kssExtension'):
      section = utils.getSection(filepath, false, store);

      if (section) {
        newStore = (0, _handleKss.deleteKSS)(filepath, section, store);
      }
      break;

    default:
      console.warn( // eslint-disable-line no-console
      chalk.red(`Could not delete: ${file.name}`));
      break;
  }

  return newStore;
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateConfig;

var _parseArgs = __webpack_require__(3);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _requireExternal = __webpack_require__(14);

var _requireExternal2 = _interopRequireDefault(_requireExternal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module cli/generate-config */
const cwd = process.cwd();
const path = __webpack_require__(0);
const url = __webpack_require__(23);
const fs = __webpack_require__(2);
const webpack = __webpack_require__(5);
const HTMLWebpackPlugin = __webpack_require__(20);
const defaultWebpack = __webpack_require__(17);
const defaultHuron = __webpack_require__(16);

// Require configs passed in by user from CLI
let defaultConfig = false;
const localConfigPath = !path.isAbsolute(_parseArgs2.default.webpackConfig) ? path.join(cwd, _parseArgs2.default.webpackConfig) : _parseArgs2.default.webpackConfig;
const localHuronPath = !path.isAbsolute(_parseArgs2.default.huronConfig) ? path.join(cwd, _parseArgs2.default.huronConfig) : _parseArgs2.default.huronConfig;
const localConfig = (0, _requireExternal2.default)(localConfigPath);
const localHuron = (0, _requireExternal2.default)(localHuronPath);

/**
 * Generate a mutant hybrid of the huron default webpack config and your local webpack config
 *
 * @function generateConfig
 * @param {object} config - local webpack config
 * @return {object} newConfig - updated data store
 */
function generateConfig() {
  let newConfig = localConfig;
  let newHuron = localHuron;

  // Execute config function, if provided
  if ('function' === typeof newConfig) {
    newConfig = newConfig(_parseArgs2.default.env);
  }

  // Execute huron config function, if provided
  if ('function' === typeof newHuron) {
    newHuron = newHuron(_parseArgs2.default.env);
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
  const entry = config.entry[huron.entry];
  const newConfig = config;

  newConfig.entry = {};
  if (!_parseArgs2.default.production) {
    newConfig.entry[huron.entry] = [`webpack-dev-server/client?http://localhost:${huron.port}`, 'webpack/hot/dev-server', path.join(cwd, huron.root, 'huron-assets/huron')].concat(entry);
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
  const newConfig = config;

  newConfig.plugins = config.plugins || [];

  if (!_parseArgs2.default.production) {
    if (newConfig.plugins && newConfig.plugins.length) {
      newConfig.plugins = newConfig.plugins.filter(plugin => 'HotModuleReplacementPlugin' !== plugin.constructor.name && 'NamedModulesPlugin' !== plugin.constructor.name);
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
  const templatesLoader = huron.templates.rule || {};
  const newConfig = config;

  // Make sure we're only using templates loader for files in huron root
  templatesLoader.include = [path.join(cwd, huron.root, huron.output)];

  // Normalize module and module.rules
  newConfig.module = newConfig.module || {};
  newConfig.module.rules = newConfig.module.rules || newConfig.module.loaders || [];

  // Add default loaders
  newConfig.module.rules = defaultConfig.module.rules.concat(newConfig.module.rules, templatesLoader);

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
  const wrapperTemplate = fs.readFileSync(path.join(__dirname, '../../templates/prototype-template.hbs'), 'utf8');

  const defaultHTMLPluginOptions = {
    title: 'Huron',
    window: huron.window,
    js: [],
    css: [],
    filename: 'index.html',
    template: path.join(cwd, huron.root, 'huron-assets/prototype-template.hbs'),
    inject: false,
    chunks: [huron.entry]
  };
  const newConfig = config;

  // Write prototype template file for HTML webpack plugin
  fs.outputFileSync(path.join(cwd, huron.root, 'huron-assets/prototype-template.hbs'), wrapperTemplate);

  huron.prototypes.forEach(prototype => {
    const newPrototype = prototype;
    let opts = {};

    // Merge configured settings with default settings
    if ('string' === typeof prototype) {
      opts = Object.assign({}, defaultHTMLPluginOptions, {
        title: prototype,
        filename: `${prototype}.html`
      });
    } else if ('object' === typeof prototype && {}.hasOwnProperty.call(prototype, 'title')) {
      // Create filename based on configured title if not provided
      if (!prototype.filename) {
        newPrototype.filename = `${prototype.title}.html`;
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
function moveAdditionalAssets(assets, subdir = '', huron) {
  const currentAssets = [].concat(assets);
  const assetResults = [];

  currentAssets.forEach(asset => {
    const assetInfo = path.parse(asset);
    const assetURL = url.parse(asset);
    const sourcePath = path.join(cwd, asset);
    const outputPath = path.resolve(cwd, huron.root, subdir, assetInfo.base);
    const loadPath = _parseArgs2.default.production ? path.join(subdir, assetInfo.base) : path.join('/', subdir, assetInfo.base); // Use absolute path in development
    let contents = false;

    if (!path.isAbsolute(asset) && !assetURL.protocol) {
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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateHTML = updateHTML;
exports.deleteHTML = deleteHTML;
exports.updatePrototype = updatePrototype;
exports.deletePrototype = deletePrototype;

var _utils = __webpack_require__(4);

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const path = __webpack_require__(0); /** @module cli/html-handler */

const fs = __webpack_require__(2);

/**
 * Handle update of an HMTL template
 *
 * @function updateHTML
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function updateHTML(filepath, section, store) {
  const file = path.parse(filepath);
  const content = fs.readFileSync(filepath, 'utf8');
  const newSection = section;

  if (content) {
    newSection.templatePath = utils.writeFile(section.referenceURI, 'template', filepath, content, store);
    newSection.templateContent = content;

    // Rewrite section data with template content
    newSection.sectionPath = utils.writeSectionData(store, newSection);

    return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  }

  console.log(`File ${file.base} could not be read`);
  return store;
}

/**
 * Handle removal of an HMTL template
 *
 * @function deleteHTML
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function deleteHTML(filepath, section, store) {
  const newSection = section;

  utils.removeFile(newSection.referenceURI, 'template', filepath, store);

  delete newSection.templatePath;

  return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
}

/**
 * Handle update for a prototype file
 *
 * @function updatePrototype
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function updatePrototype(filepath, store) {
  const file = path.parse(filepath);
  const content = fs.readFileSync(filepath, 'utf8');

  if (content) {
    const requirePath = utils.writeFile(file.name, 'prototype', filepath, content, store);

    return store.setIn(['prototypes', file.name], requirePath);
  }

  console.log(`File ${file.base} could not be read`);
  return store;
}

/**
 * Handle removal of a prototype file
 *
 * @function deletePrototype
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function deletePrototype(filepath, store) {
  const file = path.parse(filepath);
  const requirePath = utils.removeFile(file.name, 'prototype', filepath, store);

  return store.setIn(['prototypes', file.name], requirePath);
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateKSS = updateKSS;
exports.deleteKSS = deleteKSS;

var _utils = __webpack_require__(4);

var utils = _interopRequireWildcard(_utils);

var _handleTemplates = __webpack_require__(6);

var _requireTemplates = __webpack_require__(7);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const path = __webpack_require__(0); /** @module cli/kss-handler */

const fs = __webpack_require__(2);
const parse = __webpack_require__(22).parse;
const chalk = __webpack_require__(1); // Colorize terminal output

/**
 * Handle update of a KSS section
 *
 * @function updateKSS
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function updateKSS(filepath, store) {
  const kssSource = fs.readFileSync(filepath, 'utf8');
  const huron = store.get('config');
  const oldSection = utils.getSection(filepath, false, store) || {};
  const file = path.parse(filepath);
  let newStore = store;

  if (kssSource) {
    const styleguide = parse(kssSource, huron.get('kssOptions'));

    if (styleguide.data.sections.length) {
      const section = utils.normalizeSectionData(styleguide.data.sections[0]);

      if (section.reference && section.referenceURI) {
        // Update or add section data
        newStore = updateSectionData(filepath, section, oldSection, newStore);

        // Remove old section data if reference URI has changed
        if (oldSection && oldSection.referenceURI && oldSection.referenceURI !== section.referenceURI) {
          newStore = unsetSection(oldSection, file, newStore, false);
        }

        (0, _requireTemplates.writeStore)(newStore);
        console.log(chalk.green(`KSS source in ${filepath} changed or added`));
        return newStore;
      }

      console.log(chalk.magenta(`KSS section in ${filepath} is missing a section reference`));
      return newStore;
    }

    console.log(chalk.magenta(`No KSS found in ${filepath}`));
    return newStore;
  }

  if (oldSection) {
    newStore = deleteKSS(filepath, oldSection, newStore);
  }

  console.log(chalk.red(`${filepath} not found or empty`)); // eslint-disable-line no-console
  return newStore;
}

/**
 * Handle removal of a KSS section
 *
 * @function deleteKSS
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - KSS section data
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function deleteKSS(filepath, section, store) {
  const file = path.parse(filepath);

  if (section.reference && section.referenceURI) {
    // Remove section data from memory store
    return unsetSection(section, file, store, true);
  }

  return store;
}

/**
 * Update the sections store with new data for a specific section
 *
 * @function updateSectionData
 * @param {object} section - contains updated section data
 * @param {string} kssPath - path to KSS section
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function updateSectionData(kssPath, section, oldSection, store) {
  const sectionFileInfo = path.parse(kssPath);
  const dataFilepath = path.join(sectionFileInfo.dir, `${sectionFileInfo.name}.json`);
  const isInline = null !== section.markup.match(/<\/[^>]*>/);
  const newSort = sortSection(store.getIn(['sections', 'sorted']), section.reference, store.get('referenceDelimiter'));
  const newSection = Object.assign({}, oldSection, section);
  let newStore = store;

  // Required for reference from templates and data
  newSection.kssPath = kssPath;

  if (isInline) {
    // Set section value if inlineTempalte() returned a path
    newStore = updateInlineTemplate(kssPath, oldSection, newSection, newStore);
  } else {
    // Remove inline template, if it exists
    utils.removeFile(newSection.referenceURI, 'template', kssPath, store);
    // Update markup and data fields
    newStore = updateTemplateFields(sectionFileInfo, oldSection, newSection, newStore);
  }

  // Output section description
  newStore = updateDescription(kssPath, oldSection, newSection, newStore);

  // Output section data to a JSON file
  newSection.sectionPath = utils.writeSectionData(newStore, newSection, dataFilepath);

  // Update section sorting
  return newStore.setIn(['sections', 'sorted'], newSort).setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
}

/**
 * Handle detection and output of inline templates, which is markup written
 * in the KSS documentation itself as opposed to an external file
 *
 * @function updateInlineTemplate
 * @param {string} oldSection - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 * @return {object} updated data store with new template path info
 */
function updateInlineTemplate(filepath, oldSection, section, store) {
  const newSection = section;
  const newStore = store;

  // If we have inline markup
  if (fieldShouldOutput(oldSection, section, 'markup')) {
    newSection.templatePath = utils.writeFile(section.referenceURI, 'template', filepath, section.markup, store);
    newSection.templateContent = section.markup;

    return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  }

  return newStore;
}

/**
 * Handle output of section description
 *
 * @function updateDescription
 * @param {string} oldSection - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 * @return {object} updated data store with new descripton path info
 */
function updateDescription(filepath, oldSection, section, store) {
  const newSection = section;
  const newStore = store;

  // If we don't have previous KSS or the KSS has been updated
  if (fieldShouldOutput(oldSection, section, 'description')) {
    // Write new description
    newSection.descriptionPath = utils.writeFile(section.referenceURI, 'description', filepath, section.description, store);

    return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  }

  return newStore;
}

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
function updateTemplateFields(file, oldSection, section, store) {
  const kssPath = path.format(file);
  const newSection = section;
  let filepath = '';
  let oldFilepath = '';
  let newStore = store;

  ['data', 'markup'].forEach(field => {
    if (newSection[field]) {
      if (oldSection[field]) {
        oldFilepath = path.join(file.dir, oldSection[field]);
        newStore = (0, _handleTemplates.deleteTemplate)(oldFilepath, oldSection, newStore);
      }

      filepath = path.join(file.dir, newSection[field]);
      newStore = (0, _handleTemplates.updateTemplate)(filepath, newSection, newStore);
    } else {
      delete newSection[field];
      newStore = newStore.setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
    }
  });

  return newStore;
}

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
function unsetSection(section, file, store, removed) {
  const sorted = store.getIn(['sections', 'sorted']);
  const kssPath = path.format(file);
  const dataFilepath = path.join(file.dir, `${file.name}.json`);
  const isInline = section.markup && null !== section.markup.match(/<\/[^>]*>/);
  const newSort = unsortSection(sorted, section.reference, store.get('referenceDelimiter'));
  let newStore = store;

  // Remove old section data
  utils.removeFile(section.referenceURI, 'section', dataFilepath, newStore);

  // Remove associated inline template
  if (isInline) {
    utils.removeFile(section.referenceURI, 'template', kssPath, newStore);
  }

  // Remove description template
  utils.removeFile(section.referenceURI, 'description', kssPath, newStore);

  // Remove data from sectionsByPath if file has been removed
  if (removed) {
    newStore = newStore.deleteIn(['sections', 'sectionsByPath', kssPath]);
  }

  return newStore.deleteIn(['sections', 'sectionsByURI', section.referenceURI]).setIn(['sections', 'sorted'], newSort);
}

/**
 * Sort sections and subsections
 *
 * @function sortSection
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 * @return {object} updated data store with new descripton path info
 */
function sortSection(sorted, reference, delimiter) {
  const parts = reference.split(delimiter);
  const newSort = sorted[parts[0]] || {};
  const newSorted = sorted;

  if (1 < parts.length) {
    const newParts = parts.filter((part, idx) => 0 !== idx);
    newSorted[parts[0]] = sortSection(newSort, newParts.join(delimiter), delimiter);
  } else {
    newSorted[parts[0]] = newSort;
  }

  return newSorted;
}

/**
 * Remove a section from the sorted sections
 *
 * @function unsortSection
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 * @return {object} updated data store with new descripton path info
 */
function unsortSection(sorted, reference, delimiter) {
  const parts = reference.split(delimiter);
  const subsections = Object.keys(sorted[parts[0]]);
  const newSorted = sorted;

  if (subsections.length) {
    if (1 < parts.length) {
      const newParts = parts.filter((part, idx) => 0 !== idx);
      newSorted[parts[0]] = unsortSection(newSorted[parts[0]], newParts.join(delimiter), delimiter);
    }
  } else {
    delete newSorted[parts[0]];
  }

  return newSorted;
}

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
function fieldShouldOutput(oldSection, newSection, field) {
  return oldSection && (oldSection[field] !== newSection[field] || oldSection.referenceURI !== newSection.referenceURI) || !oldSection;
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = exports.dataStructure = undefined;

var _immutable = __webpack_require__(21);

var _generateConfig = __webpack_require__(10);

var _generateConfig2 = _interopRequireDefault(_generateConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create initial data structure

// Merge Huron default webpack config with user config
const config = (0, _generateConfig2.default)();

// Make sure the kss option is represented as an array
config.huron.kss = Array.isArray(config.huron.kss) ? config.huron.kss : [config.huron.kss];

/* eslint-disable */
/**
 * Initial structure for immutable data store
 *
 * @global
 */
const dataStructure = (0, _immutable.Map)({
  types: ['template', 'data', 'description', 'section', 'prototype', 'sections-template'],
  config: (0, _immutable.Map)(config.huron),
  sections: (0, _immutable.Map)({
    sectionsByPath: (0, _immutable.Map)({}),
    sectionsByURI: (0, _immutable.Map)({}),
    sorted: {}
  }),
  templates: (0, _immutable.Map)({}),
  prototypes: (0, _immutable.Map)({}),
  sectionTemplatePath: '',
  referenceDelimiter: '.'
});
/* eslint-enable */

exports.dataStructure = dataStructure;
exports.config = config;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requireExternal;
// Necessary to remove require statement from Webpack processing preserve it in output
/* eslint-disable import/no-dynamic-require, global-require */
function requireExternal(requirePath) {
  return require(requirePath);
}
/* eslint-enable */

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startWebpack;

var _parseArgs = __webpack_require__(3);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const webpack = __webpack_require__(5); /** @module cli/webpack-server */

const WebpackDevServer = __webpack_require__(24);
const chalk = __webpack_require__(1); // Colorize terminal output

/**
 * Spin up webpack-dev-server or, if production flag is set, run webpack a single time
 *
 * @function startWebpack
 * @param {object} config - webpack configuration, preprocessed by {@link module:cli/generate-config generateConfig}
 * @see {@link module:cli/generate-config generateConfig}
 */
function startWebpack(config) {
  const huron = config.huron;
  const webpackConfig = config.webpack;
  const compiler = webpack(webpackConfig);

  if (_parseArgs2.default.progress) {
    compiler.apply(new webpack.ProgressPlugin((percentage, msg) => {
      console.log(`${percentage * 100}% `, msg);
    }));
  }

  if (_parseArgs2.default.production) {
    compiler.run((err, stats) => {
      const info = stats.toJson();

      if (err) {
        console.log(err);
      }

      if (stats.hasErrors()) {
        console.error(chalk.red('Webpack encountered errors during compile: ', info.errors));
      }

      if (stats.hasWarnings()) {
        console.error(chalk.yellow('Webpack encountered warnings during compile: ', info.warnings));
      }
    });
  } else {
    const server = new WebpackDevServer(compiler, {
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
      publicPath: `http://localhost:${huron.port}/${huron.root}`
    });
    server.listen(huron.port, 'localhost', err => {
      if (err) {
        return console.log(err);
      }

      console.log(`Listening at http://localhost:${huron.port}/`);
      return true;
    });
  }
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const path = __webpack_require__(0);

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
  sectionTemplate: path.join(__dirname, '../../templates/section.hbs'),
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _parseArgs = __webpack_require__(3);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const webpack = __webpack_require__(5);
const path = __webpack_require__(0);

module.exports = huron => {
  const cwd = process.cwd();

  return {
    entry: {},
    output: {
      path: path.join(cwd, huron.root),
      publicPath: _parseArgs2.default.production ? '' : `http://localhost:${huron.port}/${huron.root}`,
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
        test: /\.html$/,
        include: [path.join(cwd, huron.root, huron.output)],
        use: 'html-loader'
      }, {
        test: /\.(hbs|handlebars)$/,
        include: [path.join(cwd, huron.root, 'huron-assets')],
        use: {
          loader: 'handlebars-loader',
          options: {
            helperDirs: path.join(__dirname, '../../', 'templates/handlebars-helpers')
          }
        }
      }]
    }
  };
};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("commander");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("gaze");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("html-webpack-plugin");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("immutable");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("kss");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("webpack-dev-server");

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ })
/******/ ]);
//# sourceMappingURL=huron-cli.js.map