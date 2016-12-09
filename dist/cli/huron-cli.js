#!/usr/bin/env node
'use strict';

var _actions = require('./actions');

var _requireTemplates = require('./require-templates');

var _parseArgs = require('./parse-args');

var _parseArgs2 = _interopRequireDefault(_parseArgs);

var _generateConfig = require('./generate-config');

var _generateConfig2 = _interopRequireDefault(_generateConfig);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Modules
var cwd = process.cwd(); // Current working directory


// Local imports
var path = require('path');
var Gaze = require('gaze').Gaze;
var Immutable = require('immutable');
var chalk = require('chalk'); // Colorize terminal output

// Set vars
var localConfig = require(path.join(cwd, _parseArgs2.default.config)); // eslint-disable-line import/no-dynamic-require
var config = (0, _generateConfig2.default)(localConfig);

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
//# sourceMappingURL=huron-cli.js.map