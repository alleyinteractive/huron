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
/******/ 	return __webpack_require__(__webpack_require__.s = 30);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
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
exports.mergeClassnameJSON = mergeClassnameJSON;
exports.removeTrailingSlash = removeTrailingSlash;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _fsExtra = __webpack_require__(3);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cwd = process.cwd(); // Current working directory

/**
 * Ensure predictable data structure for KSS section data
 *
 * @function normalizeSectionData
 * @param {object} section - section data
 * @return {object} section data
 */
/** @module cli/utilities */
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
    sectionFileInfo = _path2.default.parse(section.kssPath);
    outputPath = _path2.default.join(sectionFileInfo.dir, `${sectionFileInfo.name}.json`);
  }

  // Output section data
  if (outputPath) {
    return writeFile(section.referenceURI, 'section', outputPath, JSON.stringify(section), store);
  }

  console.warn( // eslint-disable-line no-console
  _chalk2.default.red(`Failed to write section data for ${section.referenceURI}`));
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
    const componentPath = _path2.default.relative(_path2.default.resolve(cwd, kssDir), file.dir);
    const partnerType = '.json' === file.ext ? 'template' : 'data';
    const partnerExt = '.json' === file.ext ? huron.get('templates').extension : '.json';

    const pairPath = _path2.default.join(componentPath, generateFilename(section.referenceURI, partnerType, partnerExt, store));

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
  const file = _path2.default.parse(filepath);
  const filename = generateFilename(id, type, file.ext, store);
  const kssDir = matchKssDir(filepath, huron);

  if (kssDir) {
    const componentPath = _path2.default.relative(_path2.default.resolve(cwd, kssDir), file.dir);
    const outputRelative = _path2.default.join(huron.get('output'), componentPath, `${filename}`);
    const outputPath = _path2.default.resolve(cwd, huron.get('root'), outputRelative);
    let newContent = content;

    if ('data' !== type && 'section' !== type) {
      newContent = wrapMarkup(content, id);
    }

    try {
      _fsExtra2.default.outputFileSync(outputPath, newContent);
      console.log(_chalk2.default.green(`Writing ${outputRelative}`)); // eslint-disable-line no-console
    } catch (e) {
      console.log(_chalk2.default.red(`Failed to write ${outputRelative}`)); // eslint-disable-line no-console
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
  const file = _path2.default.parse(filepath);
  const filename = generateFilename(id, type, file.ext, store);
  const kssDir = matchKssDir(filepath, huron);

  if (kssDir) {
    const componentPath = _path2.default.relative(_path2.default.resolve(cwd, kssDir), file.dir);
    const outputRelative = _path2.default.join(huron.get('output'), componentPath, `${filename}`);
    const outputPath = _path2.default.resolve(cwd, huron.get('root'), outputRelative);

    try {
      _fsExtra2.default.removeSync(outputPath);
      console.log(_chalk2.default.green(`Removing ${outputRelative}`)); // eslint-disable-line no-console
    } catch (e) {
      console.log( // eslint-disable-line no-console
      _chalk2.default.red(`${outputRelative} does not exist or cannot be deleted`));
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
  const sectionTemplate = wrapMarkup(_fsExtra2.default.readFileSync(filepath, 'utf8'));
  const componentPath = './huron-assets/section.hbs';
  const output = _path2.default.join(cwd, huron.get('root'), componentPath);

  // Move huron script and section template into huron root
  _fsExtra2.default.outputFileSync(output, sectionTemplate);
  console.log(_chalk2.default.green(`writing section template to ${output}`)); // eslint-disable-line no-console

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
  // Include forward slash in our test to make sure we're matchin a directory, not a file extension
  const kssMatch = kssSource.filter(dir => filepath.includes(`/${dir}`));

  if (kssMatch.length) {
    return kssMatch[0];
  }

  return false;
}

/**
 * Merge JSON files for css modules classnames in a provided directory
 *
 * @function mergeClassnameJSON
 * @param {string} directory - directory containing classname JSON files
 *
 * @return {object} classnamesMerged - merged classnames. contents of each JSON file is nested within
 *                           the returned object by filename. (e.g. article.json -> { article: {...json contents}})
 */
function mergeClassnameJSON(directory) {
  let files;

  // If no config is provided, return immediately
  if (!directory) {
    return {};
  }

  // Try to read through classnames directory
  try {
    files = _fsExtra2.default.readdirSync(directory);
  } catch (e) {
    console.warn(_chalk2.default.red(e));
  }

  // Merge classname json files
  const classNamesMerged = files.reduce((acc, file) => {
    const fileInfo = _path2.default.parse(file);
    let classNames = {};

    if ('.json' === fileInfo.ext) {
      try {
        const contents = _fsExtra2.default.readFileSync(_path2.default.join(directory, file), 'utf8');
        classNames = JSON.parse(contents);
      } catch (e) {
        console.warn(_chalk2.default.red(e));
      }
    }

    return Object.assign({}, acc, { [fileInfo.name]: classNames });
  }, {});

  return classNamesMerged;
}

/**
 * Remove the trailing slash from a provided directory
 *
 * @function removeTrailingSlash
 * @param {string} directory - directory path
 * @return {string} directory - directory path with trailing slash removed
 */
function removeTrailingSlash(directory) {
  if ('/' === directory.slice(-1)) {
    return directory.slice(0, -1);
  }

  return directory;
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _commander = __webpack_require__(21);

var _commander2 = _interopRequireDefault(_commander);

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Requires
/** @global */

/**
 * Process huron CLI arguments
 *
 * @function parseArgs
 * @example node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production
 */
/** @module cli/parse-arguments */
/* eslint-disable space-unary-ops */

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

  _commander2.default.version('1.0.1').option('-c, --huron-config [huronConfig]', '[huronConfig] for all huron options', _path2.default.resolve(__dirname, '../defaultConfig/huron.config.js')).option('-w, --webpack-config [webpackConfig]', '[webpackConfig] for all webpack options', _path2.default.resolve(__dirname, '../defaultConfig/webpack.config.js')).option('-p, --production', 'compile assets once for production');

  _commander2.default.env = envArg;

  // Only parse if we're not running tests
  if (!process.env.npm_lifecycle_event || 'test' !== process.env.npm_lifecycle_event) {
    _commander2.default.parse(process.argv);
  }
}

parseArgs();
/* eslint-enable */

exports.default = _commander2.default;

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
exports.config = exports.defaultStore = undefined;

var _immutable = __webpack_require__(24);

var _generateConfig = __webpack_require__(13);

var _generateConfig2 = _interopRequireDefault(_generateConfig);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create initial data structure

// Merge Huron default webpack config with user config
const config = (0, _generateConfig2.default)();

// Make sure the kss option is represented as an array
config.huron.kss = [].concat(config.huron.kss);

/* eslint-disable */
/**
 * Initial structure for immutable data store
 *
 * @global
 */
const defaultStore = (0, _immutable.Map)({
  types: ['template', 'data', 'description', 'section', 'prototype', 'sections-template'],
  config: (0, _immutable.Map)(config.huron),
  classNames: (0, _utils.mergeClassnameJSON)(config.huron.classNames),
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

exports.defaultStore = defaultStore;
exports.config = config;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _fsExtra = __webpack_require__(3);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

var _utils = __webpack_require__(1);

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handle update of a template or data (json) file
 *
 * @function updateTemplate
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated memory store
 */
/** @module cli/template-handler */
function updateTemplate(filepath, section, store) {
  const file = _path2.default.parse(filepath);
  const pairPath = utils.getTemplateDataPair(file, section, store);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  const newStore = store;
  let content = false;

  try {
    content = _fsExtra2.default.readFileSync(filepath, 'utf8');
  } catch (e) {
    console.log(_chalk2.default.red(`${filepath} does not exist`));
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
  const file = _path2.default.parse(filepath);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  const newStore = store;

  // Remove partner
  const requirePath = utils.removeFile(newSection.referenceURI, type, filepath, newStore);
  delete newSection[`${type}Path`];

  return newStore.deleteIn(['templates', requirePath]).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeStore = exports.requireTemplates = undefined;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _fsExtra = __webpack_require__(3);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _hotTemplate = __webpack_require__(20);

var _hotTemplate2 = _interopRequireDefault(_hotTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-enable */

const cwd = process.cwd();

// We need to prepend this to the browser script as a string but still want to transpile it,
// hence loading it using `raw-loader` so we receive a string from webpack
/* eslint-disable */
/** @module cli/require-templates */

const huronScript = _fsExtra2.default.readFileSync(_path2.default.join(__dirname, '../web/index.js'), 'utf8');

/**
 * Write code for requiring all generated huron assets
 *
 * @function requireTemplates
 * @param {object} store - memory store
 */
const requireTemplates = exports.requireTemplates = function requireTemplates(store) {
  const huron = store.get('config');
  const outputPath = _path2.default.join(cwd, huron.get('root'), 'huron-assets');
  // These will be used to replace strings in the hotTemplate.
  // In order to accurately replace strings but still keep things parseable by eslint and babel,
  // each replaceable value should be referenced in `hotTemplate.js` under the `hotScope` object.
  // For example, if you need to replace a string with a value passed in from the CLI called `userVariable`,
  // you would reference that string in `hotTemplate.js` with `hotScope.userVariable`.
  const hotVariableScope = {
    sectionTemplatePath: `'${huron.get('sectionTemplate')}'`,
    requireRegex: new RegExp(`\\.html|\\.json|\\${huron.get('templates').extension}$`),
    requirePath: `'../${huron.get('output')}'`
  };
  const hotTemplateTransformed = Object.keys(hotVariableScope).reduce((acc, curr) => acc.replace(new RegExp(`hotScope.${curr}`, 'g'), hotVariableScope[curr]), _hotTemplate2.default);

  // Write the contents of this script.
  _fsExtra2.default.outputFileSync(_path2.default.join(outputPath, 'index.js'), hotTemplateTransformed);
  _fsExtra2.default.outputFileSync(_path2.default.join(outputPath, 'insertNodes.js'), huronScript);
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @function writeStore
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
const writeStore = exports.writeStore = function writeStore(store, newStore = false) {
  const updatedStore = newStore || store;
  const huron = updatedStore.get('config');
  const outputPath = _path2.default.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  _fsExtra2.default.outputFileSync(_path2.default.join(outputPath, 'huron-store.js'), `module.exports = ${JSON.stringify(updatedStore.toJSON())}`);
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

var _actions = __webpack_require__(11);

var _requireTemplates = __webpack_require__(8);

var _utils = __webpack_require__(1);

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _server = __webpack_require__(17);

var _server2 = _interopRequireDefault(_server);

var _defaultStore = __webpack_require__(6);

var _fileWatcher = __webpack_require__(12);

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Initialize data store with files from gaze and original data structure
 *
 * @global
 */
// Local imports
const huron = _defaultStore.defaultStore.get('config');
let store = (0, _actions.initFiles)(_fileWatcher2.default.watched(), _defaultStore.defaultStore);

(0, _requireTemplates.requireTemplates)(store);
(0, _requireTemplates.writeStore)(store);

// If building for production, close gaze and exit process once initFiles is done.
if (_parseArgs2.default.production) {
  _fileWatcher2.default.close();
  process.exit();
}

/** @module cli/gaze */
_fileWatcher2.default.on('all', (event, filepath) => {
  store = (0, _actions.updateClassNames)(filepath, store);
  (0, _requireTemplates.writeStore)(store);
});

/**
 * Anonymous handler for Gaze 'changed' event indicating a file has changed
 *
 * @callback changed
 * @listens gaze:changed
 * @param {string} filepath - absolute path of changed file
 */
_fileWatcher2.default.on('changed', filepath => {
  if ((0, _utils.matchKssDir)(filepath, huron)) {
    store = (0, _actions.updateFile)(filepath, store);
  }

  console.log(_chalk2.default.green(`${filepath} updated!`));
});

/**
 * Anonymous handler for Gaze 'added' event indicating a file has been added to the watched directories
 *
 * @callback added
 * @listens gaze:added
 * @param {string} filepath - absolute path of changed file
 */
_fileWatcher2.default.on('added', filepath => {
  if ((0, _utils.matchKssDir)(filepath, huron)) {
    store = (0, _actions.updateFile)(filepath, store);
    (0, _requireTemplates.writeStore)(store);
  }

  console.log(_chalk2.default.blue(`${filepath} added!`));
});

/**
 * Anonymous handler for Gaze 'renamed' event indicating a file has been renamed
 *
 * @callback renamed
 * @listens gaze:renamed
 * @param {string} filepath - absolute path of changed file
 */
_fileWatcher2.default.on('renamed', (newPath, oldPath) => {
  if ((0, _utils.matchKssDir)(newPath, huron)) {
    store = (0, _actions.deleteFile)(oldPath, store);
    store = (0, _actions.updateFile)(newPath, store);
    (0, _requireTemplates.writeStore)(store);
  }

  console.log(_chalk2.default.blue(`${newPath} added!`));
});

/**
 * Anonymous handler for Gaze 'deleted' event indicating a file has been removed
 *
 * @callback deleted
 * @listens gaze:deleted
 * @param {string} filepath - absolute path of changed file
 */
_fileWatcher2.default.on('deleted', filepath => {
  if ((0, _utils.matchKssDir)(filepath, huron)) {
    store = (0, _actions.deleteFile)(filepath, store);
    (0, _requireTemplates.writeStore)(store);
  }

  console.log(_chalk2.default.red(`${filepath} deleted`));
});

// Start webpack or build for production
(0, _server2.default)(_defaultStore.config);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = huron => ({
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
  overlay: true,
  publicPath: `http://localhost:${huron.port}/${huron.root}`
});

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
exports.updateClassNames = updateClassNames;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

var _isEqual = __webpack_require__(26);

var _isEqual2 = _interopRequireDefault(_isEqual);

var _handleHTML = __webpack_require__(14);

var _handleTemplates = __webpack_require__(7);

var _handleKSS = __webpack_require__(15);

var _utils = __webpack_require__(1);

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @return {object} newStore - map object of entire data store
 */
function initFiles(data, store, depth = 0) {
  const type = Object.prototype.toString.call(data);
  const huron = store.get('config');
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
      info = _path2.default.parse(data);

      // Only call update if data is a filepath and it's within the KSS source directory
      if (info.ext && !data.includes(huron.get('classNames'))) {
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
/** @module cli/actions */

// Imports
function updateFile(filepath, store) {
  const huron = store.get('config');
  const file = _path2.default.parse(filepath);
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
        return (0, _handleHTML.updateHTML)(filepath, section, store);
      } else if (file.dir.includes('prototypes') && file.name.includes('prototype-')) {
        return (0, _handleHTML.updatePrototype)(filepath, store);
      }

      console.log(_chalk2.default.red(`Failed to write file: ${file.name}`));
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
      _chalk2.default.red(`Could not find associated KSS section for ${filepath}`));
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      return (0, _handleKSS.updateKSS)(filepath, store);

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
  const file = _path2.default.parse(filepath);
  let field = '';
  let section = null;
  let newStore = store;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        newStore = (0, _handleHTML.deleteHTML)(filepath, section, store);
      } else if (file.dir.includes('prototypes') && file.name.includes('prototype-')) {
        newStore = (0, _handleHTML.deletePrototype)(filepath, store);
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
        newStore = (0, _handleKSS.deleteKSS)(filepath, section, store);
      }
      break;

    default:
      console.warn( // eslint-disable-line no-console
      _chalk2.default.red(`Could not delete: ${file.name}`));
      break;
  }

  return newStore;
}

/**
 * Logic for updating localized classnames from CSS modules
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 *
 * @return void
 */
function updateClassNames(filepath, store) {
  const classNamesPath = store.getIn(['config', 'classNames']);

  if (filepath.includes(classNamesPath)) {
    const oldClassnames = store.get('classNames');
    const newClassnames = utils.mergeClassnameJSON(classNamesPath);

    if (!(0, _isEqual2.default)(oldClassnames, newClassnames)) {
      return store.set('classNames', newClassnames);
    }
  }

  return store;
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.watchedFiles = exports.extensions = undefined;

var _gaze = __webpack_require__(22);

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _utils = __webpack_require__(1);

var _defaultStore = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Huron configuration object
 *
 * @global
 */
const huron = _defaultStore.defaultStore.get('config');

/**
 * Available file extensions. Extensions should not include the leading '.'
 *
 * @global
 */
const extensions = exports.extensions = [huron.get('kssExtension'), huron.get('templates').extension, 'html', 'json'].map(extension => extension.replace('.', ''));

// Generate watch list for Gaze, start gaze
const watchedFiles = exports.watchedFiles = [];

// Watch section template
watchedFiles.push(_path2.default.resolve(huron.get('sectionTemplate')));

// Watch cssmodules classname files (if they exist)
if (huron.get('classNames')) {
  watchedFiles.push(`${_path2.default.resolve(huron.get('classNames'))}/*.json`);
}

// Watch all provided kss directories
huron.get('kss').forEach(dir => {
  watchedFiles.push(`${(0, _utils.removeTrailingSlash)(dir)}/**/*.+(${extensions.join('|')})`);
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
const gaze = new _gaze.Gaze(watchedFiles);

exports.default = gaze;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateConfig;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _url = __webpack_require__(28);

var _url2 = _interopRequireDefault(_url);

var _fsExtra = __webpack_require__(3);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _webpack = __webpack_require__(5);

var _webpack2 = _interopRequireDefault(_webpack);

var _htmlWebpackPlugin = __webpack_require__(23);

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _requireExternal = __webpack_require__(16);

var _requireExternal2 = _interopRequireDefault(_requireExternal);

var _webpack3 = __webpack_require__(19);

var _webpack4 = _interopRequireDefault(_webpack3);

var _huron = __webpack_require__(18);

var _huron2 = _interopRequireDefault(_huron);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cwd = process.cwd();

// Require configs passed in by user from CLI
/** @module cli/generate-config */
let defaultConfig = false;
const localConfig = (0, _requireExternal2.default)(_path2.default.resolve(_parseArgs2.default.webpackConfig));
const localHuron = (0, _requireExternal2.default)(_path2.default.resolve(_parseArgs2.default.huronConfig));

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
  newHuron = Object.assign({}, _huron2.default, newHuron);
  // Use user huron config to modify webpack defaults
  defaultConfig = (0, _webpack4.default)(newHuron);

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
    newConfig.entry[huron.entry] = [`webpack-dev-server/client?http://localhost:${huron.port}`, 'webpack/hot/dev-server', _path2.default.join(cwd, huron.root, 'huron-assets/index')].concat(entry);
  } else {
    newConfig.entry[huron.entry] = [_path2.default.join(cwd, huron.root, 'huron-assets/index')].concat(entry);
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
    newConfig.plugins = newConfig.plugins.concat([new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NamedModulesPlugin()]);
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
  templatesLoader.include = [_path2.default.join(cwd, huron.root, huron.output)];

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
  const wrapperTemplate = _fsExtra2.default.readFileSync(_path2.default.join(__dirname, '../../templates/prototypeTemplate.hbs'), 'utf8');

  const defaultHTMLPluginOptions = {
    title: 'Huron',
    window: huron.window,
    js: [],
    css: [],
    filename: 'index.html',
    template: _path2.default.join(cwd, huron.root, 'huron-assets/prototypeTemplate.hbs'),
    inject: false,
    chunks: [huron.entry]
  };
  const newConfig = config;

  // Write prototype template file for HTML webpack plugin
  _fsExtra2.default.outputFileSync(_path2.default.join(cwd, huron.root, 'huron-assets/prototypeTemplate.hbs'), wrapperTemplate);

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
      newConfig.plugins.push(new _htmlWebpackPlugin2.default(opts));
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
    const assetInfo = _path2.default.parse(asset);
    const assetURL = _url2.default.parse(asset);
    const sourcePath = _path2.default.join(cwd, asset);
    const outputPath = _path2.default.resolve(cwd, huron.root, subdir, assetInfo.base);
    const loadPath = _parseArgs2.default.production ? _path2.default.join(subdir, assetInfo.base) : _path2.default.join('/', subdir, assetInfo.base); // Use absolute path in development
    let contents = false;

    if (!_path2.default.isAbsolute(asset) && !assetURL.protocol) {
      try {
        contents = _fsExtra2.default.readFileSync(sourcePath);
      } catch (e) {
        console.warn(`could not read ${sourcePath}`);
      }

      if (contents) {
        _fsExtra2.default.outputFileSync(outputPath, contents);
        assetResults.push(loadPath);
      }
    } else {
      assetResults.push(asset);
    }
  });

  return assetResults;
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateHTML = updateHTML;
exports.deleteHTML = deleteHTML;
exports.updatePrototype = updatePrototype;
exports.deletePrototype = deletePrototype;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _fsExtra = __webpack_require__(3);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _utils = __webpack_require__(1);

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  const file = _path2.default.parse(filepath);
  const content = _fsExtra2.default.readFileSync(filepath, 'utf8');
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
/** @module cli/html-handler */
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
  const file = _path2.default.parse(filepath);
  const content = _fsExtra2.default.readFileSync(filepath, 'utf8');

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
  const file = _path2.default.parse(filepath);
  const requirePath = utils.removeFile(file.name, 'prototype', filepath, store);

  return store.setIn(['prototypes', file.name], requirePath);
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateKSS = updateKSS;
exports.deleteKSS = deleteKSS;

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _fsExtra = __webpack_require__(3);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _kss = __webpack_require__(25);

var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

var _utils = __webpack_require__(1);

var utils = _interopRequireWildcard(_utils);

var _handleTemplates = __webpack_require__(7);

var _requireTemplates = __webpack_require__(8);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handle update of a KSS section
 *
 * @function updateKSS
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 * @return {object} updated data store
 */
function updateKSS(filepath, store) {
  const kssSource = _fsExtra2.default.readFileSync(filepath, 'utf8');
  const huron = store.get('config');
  const oldSection = utils.getSection(filepath, false, store) || {};
  const file = _path2.default.parse(filepath);
  let newStore = store;

  if (kssSource) {
    const styleguide = (0, _kss.parse)(kssSource, huron.get('kssOptions'));

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
        console.log(_chalk2.default.green(`KSS source in ${filepath} changed or added`));
        return newStore;
      }

      console.log(_chalk2.default.magenta(`KSS section in ${filepath} is missing a section reference`));
      return newStore;
    }

    console.log(_chalk2.default.magenta(`No KSS found in ${filepath}`));
    return newStore;
  }

  if (oldSection) {
    newStore = deleteKSS(filepath, oldSection, newStore);
  }

  console.log(_chalk2.default.red(`${filepath} not found or empty`)); // eslint-disable-line no-console
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
/** @module cli/kss-handler */

function deleteKSS(filepath, section, store) {
  const file = _path2.default.parse(filepath);

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
  const sectionFileInfo = _path2.default.parse(kssPath);
  const dataFilepath = _path2.default.join(sectionFileInfo.dir, `${sectionFileInfo.name}.json`);
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
  const kssPath = _path2.default.format(file);
  const newSection = section;
  let filepath = '';
  let oldFilepath = '';
  let newStore = store;

  ['data', 'markup'].forEach(field => {
    if (newSection[field]) {
      if (oldSection[field]) {
        oldFilepath = _path2.default.join(file.dir, oldSection[field]);
        newStore = (0, _handleTemplates.deleteTemplate)(oldFilepath, oldSection, newStore);
      }

      filepath = _path2.default.join(file.dir, newSection[field]);
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
  const kssPath = _path2.default.format(file);
  const dataFilepath = _path2.default.join(file.dir, `${file.name}.json`);
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
/* 16 */
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startWebpack;

var _webpack = __webpack_require__(5);

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = __webpack_require__(29);

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

var _opn = __webpack_require__(27);

var _opn2 = _interopRequireDefault(_opn);

var _devServer = __webpack_require__(10);

var _devServer2 = _interopRequireDefault(_devServer);

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Spin up webpack-dev-server or, if production flag is set, run webpack a single time
 *
 * @function startWebpack
 * @param {object} config - webpack configuration, preprocessed by {@link module:cli/generate-config generateConfig}
 * @see {@link module:cli/generate-config generateConfig}
 */
/** @module cli/webpack-server */
function startWebpack(config) {
  const huron = config.huron;
  const webpackConfig = config.webpack;
  const compiler = (0, _webpack2.default)(webpackConfig);

  if (_parseArgs2.default.progress) {
    compiler.apply(new _webpack2.default.ProgressPlugin((percentage, msg) => {
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
        console.error(_chalk2.default.red('Webpack encountered errors during compile: ', info.errors));
      }

      if (stats.hasWarnings()) {
        console.error(_chalk2.default.yellow('Webpack encountered warnings during compile: ', info.warnings));
      }
    });
  } else {
    const server = new _webpackDevServer2.default(compiler, (0, _devServer2.default)(huron));
    const prototypeName = huron.prototypes[0].title || huron.prototypes[0];

    server.listen(huron.port, 'localhost', err => {
      if (err) {
        return console.log(err);
      }

      console.log(`Listening at http://localhost:${huron.port}/`);
      (0, _opn2.default)(`http://localhost:${huron.port}/${huron.root}/${prototypeName}.html`);
      return true;
    });
  }
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
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
  sectionTemplate: _path2.default.join(__dirname, '../../templates/section.hbs'),
  classNames: false,
  templates: {
    rule: {
      test: /\.(hbs|handlebars)$/,
      use: 'handlebars-loader'
    },
    extension: '.hbs'
  },
  window: {}
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webpack = __webpack_require__(5);

var _webpack2 = _interopRequireDefault(_webpack);

var _path = __webpack_require__(0);

var _path2 = _interopRequireDefault(_path);

var _parseArgs = __webpack_require__(4);

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = huron => {
  const cwd = process.cwd();

  return {
    entry: {},
    output: {
      path: _path2.default.join(cwd, huron.root),
      publicPath: _parseArgs2.default.production ? '' : `http://localhost:${huron.port}/${huron.root}`,
      filename: '[name].js',
      chunkFilename: '[name].chunk.min.js'
    },
    plugins: [new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NamedModulesPlugin()],
    resolve: {
      modulesDirectories: [_path2.default.resolve(__dirname, '../src/js')]
    },
    resolveLoader: {
      modulesDirectories: ['web_loaders', 'web_modules', 'node_loaders', 'node_modules', _path2.default.resolve(__dirname, '../node_modules')]
    },
    module: {
      rules: [{
        test: /\.html$/,
        include: [_path2.default.join(cwd, huron.root, huron.output)],
        use: 'html-loader'
      }, {
        test: /\.(hbs|handlebars)$/,
        include: [_path2.default.join(cwd, huron.root, 'huron-assets')],
        use: {
          loader: 'handlebars-loader',
          options: {
            helperDirs: [_path2.default.join(__dirname, '../../', 'templates/handlebarsHelpers')]
          }
        }
      }]
    }
  };
};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = "'use strict';\n\nvar _huronStore = require('./huron-store');\n\nvar _huronStore2 = _interopRequireDefault(_huronStore);\n\nvar _insertNodes = require('./insertNodes');\n\nvar _insertNodes2 = _interopRequireDefault(_insertNodes);\n\nvar _section = require('./section.hbs');\n\nvar _section2 = _interopRequireDefault(_section);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n/* eslint-enable */\n\nconst assets = require.context(hotScope.requirePath, true, hotScope.requireRegex); /* globals hotScope */\n\n// NOTE: This is not a normal JS file! It is pulled in by the CLI as a string\n// and prepended to the browser script after replacing anything referenced via `hotScope[variable]`\n// with CLI arguments or config properties passed in by the user.\n\n/* eslint-disable */\n\nconst modules = {};\n\nmodules[hotScope.sectionTemplatePath] = _section2.default;\n\nassets.keys().forEach(key => {\n  modules[key] = assets(key);\n});\n\nconst insert = new _insertNodes2.default(modules, _huronStore2.default);\n\nif (module.hot) {\n  // Hot Module Replacement for huron components (json, hbs, html)\n  module.hot.accept(assets.id, () => {\n    const newAssets = require.context(hotScope.requirePath, true, hotScope.requireRegex);\n    const newModules = newAssets.keys().map(key => [key, newAssets(key)]).filter(newModule => modules[newModule[0]] !== newModule[1]);\n\n    updateStore(require('./huron-store.js')); // eslint-disable-line global-require, import/no-unresolved\n    newModules.forEach(module => {\n      modules[module[0]] = module[1];\n      hotReplace(module[0], module[1], modules);\n    });\n  });\n\n  // Hot Module Replacement for sections template\n  module.hot.accept('./section.hbs', () => {\n    const newSectionTemplate = require('./section.hbs'); // eslint-disable-line global-require, import/no-unresolved\n\n    modules[hotScope.sectionTemplatePath] = newSectionTemplate;\n    hotReplace('./huron-assets/section.hbs', newSectionTemplate, modules);\n  });\n\n  // Hot Module Replacement for data store\n  module.hot.accept('./huron-store.js', () => {\n    updateStore(require('./huron-store.js')); // eslint-disable-line global-require, import/no-unresolved\n  });\n}\n\nfunction hotReplace(key, module, newModules) {\n  insert.modules = newModules;\n  if (key === _huronStore2.default.sectionTemplatePath) {\n    insert.cycleSections();\n  } else {\n    insert.inserted = [];\n    insert.loadModule(key, module, false);\n  }\n}\n\nfunction updateStore(newStore) {\n  insert.store = newStore;\n}"

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("commander");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("gaze");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("html-webpack-plugin");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("immutable");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("kss");

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("lodash/isEqual");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("opn");

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("webpack-dev-server");

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(9);


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map