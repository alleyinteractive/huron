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

/**
 * Available file extensions
 *
 * @global
 */
var extenstions = [huron.kssExtension, '.html', '.handlebars', '.hbs', '.json'];

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

/**
 * Data store, to be initialized with dataStructure
 *
 * @global
 */
var store = null; // All updates to store will be here

// Generate watch list for Gaze, start gaze
var gazeWatch = [];
gazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));
extenstions.forEach(function (ext) {
  gazeWatch.push(huron.kss + '/**/*' + ext);
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
var gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
store = (0, _actions.initFiles)(gaze.watched(), dataStructure);
(0, _requireTemplates.requireTemplates)(store);
(0, _requireTemplates.writeStore)(store);

if (!_parseArgs2.default.production) {
  /** @module cli/gaze */

  /**
   * Anonymous handler for Gaze 'changed' event indicating a file has changed
   *
   * @callback changed
   * @listens gaze:changed
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('changed', function (filepath) {
    store = (0, _actions.updateFile)(filepath, store);
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
    store = (0, _actions.updateFile)(filepath, store);
    (0, _requireTemplates.writeStore)(store);
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
    store = (0, _actions.deleteFile)(oldPath, store);
    store = (0, _actions.updateFile)(newPath, store);
    (0, _requireTemplates.writeStore)(store);
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
    store = (0, _actions.deleteFile)(filepath, store);
    (0, _requireTemplates.writeStore)(store);
    console.log(chalk.red(filepath + ' deleted'));
  });
} else {
  gaze.close();
}

// Start webpack or build for production
(0, _server2.default)(config);