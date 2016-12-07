'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFiles = initFiles;
exports.updateFile = updateFile;
exports.deleteFile = deleteFile;

var _handleHtml = require('./handle-html');

var _handleTemplates = require('./handle-templates');

var _handleKss = require('./handle-kss');

var _utils = require('./utils');

// Requires
/** @module cli/actions */

// Imports
var path = require('path');
var chalk = require('chalk'); // Colorize terminal output

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @param {object} huron - huron configuration options
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